/**
 * @fileoverview Canvas and image processing utilities for SpectroTrace.
 *
 * This module provides the image processing pipeline that prepares uploaded
 * images for audio synthesis. It handles loading, resizing, cropping, and
 * converting images to grayscale data.
 *
 * **Processing Pipeline:**
 * ```
 * User Upload → Load to Canvas → Resize (if needed) → Crop (if specified) → Grayscale
 * ```
 *
 * **Key Features:**
 * - **OffscreenCanvas Support**: Uses OffscreenCanvas when available for
 *   better performance and Web Worker compatibility
 * - **Device Heuristics**: Automatically reduces max dimensions on low-memory
 *   devices to prevent crashes
 * - **ITU-R BT.709 Grayscale**: Uses standard luminance coefficients for
 *   accurate grayscale conversion
 *
 * **Memory Management:**
 * The module creates temporary canvases during processing. These are
 * garbage collected after use. For large images, the device heuristic
 * helps prevent out-of-memory errors on constrained devices.
 *
 * @module lib/image/canvasUtils
 * @see {@link module:hooks/useGeneration} - Uses imageToGrayscaleData for preprocessing
 * @see {@link module:lib/image/types} - Type definitions for processing
 */

import type {
  CanvasLike,
  GrayscaleData,
  ImageProcessingOptions,
  RenderingContext2D,
} from "./types";
import type { Crop } from "@/components/ImageUpload/ImageCropper/types";

/** Default maximum dimensions */
const DEFAULT_MAX_WIDTH = 8192;
const DEFAULT_MAX_HEIGHT = 8192;

/** Default timeout for image loading (30 seconds) */
const DEFAULT_TIMEOUT = 30000;

/** Mid-range device cap for performance (when heuristic enabled) */
const DEVICE_HEURISTIC_MAX = 4000;

/** Memory threshold for applying device heuristic (4GB) */
const DEVICE_MEMORY_THRESHOLD = 4;

/**
 * Feature detection for OffscreenCanvas support.
 */
export function supportsOffscreenCanvas(): boolean {
  return typeof OffscreenCanvas !== "undefined";
}

/**
 * Create a canvas (OffscreenCanvas if supported, otherwise HTMLCanvasElement).
 */
export function createCanvas(width: number, height: number): CanvasLike {
  if (supportsOffscreenCanvas()) {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Get 2D rendering context from a canvas.
 */
export function getContext2D(canvas: CanvasLike): RenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D rendering context");
  }
  return ctx as RenderingContext2D;
}

/**
 * Load an image from a File or Blob into a canvas.
 * Uses createImageBitmap for efficient loading when available.
 *
 * @param source - File or Blob containing image data
 * @param options - Processing options
 * @returns Promise resolving to a canvas with the image drawn on it
 */
export async function loadImageToCanvas(
  source: File | Blob,
  options: ImageProcessingOptions = {},
): Promise<CanvasLike> {
  const { timeout = DEFAULT_TIMEOUT } = options;

  try {
    // Race between image loading and timeout.
    // Note: createImageBitmap does not support AbortSignal in all browsers,
    // so we use Promise.race for cross-browser timeout handling.
    const bitmap = await Promise.race([
      createImageBitmap(source),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Image loading timed out after ${timeout}ms`)),
          timeout,
        ),
      ),
    ]);

    // Create canvas with image dimensions
    const canvas = createCanvas(bitmap.width, bitmap.height);
    const ctx = getContext2D(canvas);

    // Draw the image
    ctx.drawImage(bitmap, 0, 0);

    // Close the bitmap to free memory
    bitmap.close();

    return canvas;
  } catch (error) {
    // Re-throw timeout errors as-is
    if (error instanceof Error && error.message.includes("timed out")) {
      throw error;
    }

    throw new Error(
      `Failed to load image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Determine if device heuristic should apply based on available memory.
 */
function shouldApplyDeviceHeuristic(): boolean {
  // navigator.deviceMemory is only available in some browsers
  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;

  if (deviceMemory !== undefined) {
    return deviceMemory < DEVICE_MEMORY_THRESHOLD;
  }

  // Default to NOT applying heuristic if memory detection is unavailable.
  // This prevents unnecessary downscaling on capable devices that lack the API.
  return false;
}

/**
 * Resize canvas if it exceeds maximum dimensions.
 * Maintains aspect ratio and optionally applies device heuristics.
 *
 * @param canvas - Source canvas to resize
 * @param options - Processing options
 * @returns A new canvas with resized dimensions, or the original if no resize needed
 */
export function resizeCanvasIfNeeded(
  canvas: CanvasLike,
  options: ImageProcessingOptions = {},
): CanvasLike {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    enableDeviceHeuristic = true,
  } = options;

  let targetMaxWidth = maxWidth;
  let targetMaxHeight = maxHeight;

  // Apply device heuristic if enabled and device is mid-range
  if (enableDeviceHeuristic && shouldApplyDeviceHeuristic()) {
    targetMaxWidth = Math.min(targetMaxWidth, DEVICE_HEURISTIC_MAX);
    targetMaxHeight = Math.min(targetMaxHeight, DEVICE_HEURISTIC_MAX);
  }

  const { width, height } = canvas;

  // Check if resize is needed
  if (width <= targetMaxWidth && height <= targetMaxHeight) {
    return canvas;
  }

  // Calculate scale factor to fit within max dimensions
  const scale = Math.min(targetMaxWidth / width, targetMaxHeight / height);
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  // Create new canvas with scaled dimensions
  const resizedCanvas = createCanvas(newWidth, newHeight);
  const ctx = getContext2D(resizedCanvas);

  // Use high-quality image smoothing for downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw scaled image
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

  return resizedCanvas;
}

/**
 * Extract a crop region from a canvas.
 *
 * @param canvas - Source canvas
 * @param crop - Crop rectangle in source coordinates
 * @returns A new canvas containing only the cropped region
 */
export function applyCrop(canvas: CanvasLike, crop: Crop): CanvasLike {
  const { x, y, width, height } = crop;

  // Validate crop bounds
  if (width <= 0 || height <= 0) {
    throw new Error("Crop dimensions must be positive");
  }

  if (x < 0 || y < 0) {
    throw new Error("Crop position cannot be negative");
  }

  if (x + width > canvas.width || y + height > canvas.height) {
    throw new Error("Crop region exceeds canvas bounds");
  }

  // Create canvas for cropped region
  const croppedCanvas = createCanvas(Math.round(width), Math.round(height));
  const ctx = getContext2D(croppedCanvas);

  // Draw the cropped region
  ctx.drawImage(
    canvas,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height),
    0,
    0,
    Math.round(width),
    Math.round(height),
  );

  return croppedCanvas;
}

/**
 * Standard luminance coefficients for grayscale conversion (ITU-R BT.709).
 */
const LUMINANCE_R = 0.2126;
const LUMINANCE_G = 0.7152;
const LUMINANCE_B = 0.0722;

/**
 * Convert canvas to grayscale Float32Array using standard luminance formula.
 * Result is in row-major order with values normalized to [0, 1].
 *
 * @param canvas - Source canvas
 * @returns Grayscale data with width, height, and Float32Array data
 */
export function toGrayscaleFloat32(canvas: CanvasLike): GrayscaleData {
  const { width, height } = canvas;
  const ctx = getContext2D(canvas);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  // Create output array
  const grayscale = new Float32Array(width * height);

  // Convert each pixel to grayscale
  for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
    const r = pixels[i] / 255;
    const g = pixels[i + 1] / 255;
    const b = pixels[i + 2] / 255;

    // Apply luminance formula
    grayscale[j] = LUMINANCE_R * r + LUMINANCE_G * g + LUMINANCE_B * b;
  }

  return {
    width,
    height,
    data: grayscale,
  };
}

/**
 * Process an image file to grayscale data, applying optional crop and resize.
 * This is the main entry point for the audio engine.
 *
 * Processing pipeline:
 * 1. Load image to canvas
 * 2. Resize if exceeds max dimensions (maintains aspect ratio)
 * 3. Scale crop coordinates if resize was applied
 * 4. Apply crop if specified
 * 5. Convert to grayscale Float32Array
 *
 * @param file - Image file to process
 * @param crop - Optional crop region
 * @param options - Processing options
 * @returns Grayscale data ready for audio synthesis
 */
export async function imageToGrayscaleData(
  file: File | Blob,
  crop?: Crop,
  options: ImageProcessingOptions = {},
): Promise<GrayscaleData> {
  // Load image to canvas
  const imageCanvas = await loadImageToCanvas(file, options);

  // Resize if needed (max dimensions check)
  const resized = resizeCanvasIfNeeded(imageCanvas, options);

  // Scale crop coordinates if image was resized
  let scaledCrop = crop;
  if (crop && resized.width !== imageCanvas.width) {
    const scale = resized.width / imageCanvas.width;
    scaledCrop = {
      x: Math.round(crop.x * scale),
      y: Math.round(crop.y * scale),
      width: Math.min(Math.round(crop.width * scale), resized.width),
      height: Math.min(Math.round(crop.height * scale), resized.height),
    };
    // Clamp to canvas bounds (handle rounding)
    scaledCrop.width = Math.min(scaledCrop.width, resized.width - scaledCrop.x);
    scaledCrop.height = Math.min(
      scaledCrop.height,
      resized.height - scaledCrop.y,
    );
  }

  // Apply crop if specified
  const cropped = scaledCrop ? applyCrop(resized, scaledCrop) : resized;

  // Convert to grayscale
  return toGrayscaleFloat32(cropped);
}
