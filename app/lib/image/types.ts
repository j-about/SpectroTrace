/**
 * @fileoverview Type definitions for image processing utilities.
 *
 * This module defines types for image loading, processing, and grayscale conversion.
 * These types are used by the canvas utilities to prepare images for audio synthesis.
 *
 * The image processing pipeline:
 * 1. User uploads an image (ImageData from ImageUpload component)
 * 2. Image is optionally cropped (Crop region)
 * 3. Image is converted to grayscale (GrayscaleData)
 * 4. Grayscale data is sent to audio worker for synthesis
 *
 * @module lib/image/types
 * @see {@link module:lib/image/canvasUtils} - Implements image processing using these types
 * @see {@link module:components/ImageUpload} - Produces ImageData for processing
 */

/**
 * Represents a crop region in image coordinates (pixels).
 * Re-exported from ImageCropper for convenience.
 */
export type { Crop } from "@/components/ImageUpload/ImageCropper/types";

/**
 * Result of grayscale conversion - a Float32Array with pixel luminance values.
 */
export interface GrayscaleData {
  /** Width of the image in pixels */
  width: number;
  /** Height of the image in pixels */
  height: number;
  /**
   * Grayscale pixel data in row-major order.
   * data[y * width + x] represents luminance at (x, y).
   * Values are normalized to [0, 1] where 0 is black and 1 is white.
   */
  data: Float32Array;
}

/**
 * Options for image loading and processing.
 */
export interface ImageProcessingOptions {
  /** Maximum width for the output (default: 8192) */
  maxWidth?: number;
  /** Maximum height for the output (default: 8192) */
  maxHeight?: number;
  /** Timeout in milliseconds for image loading (default: 30000) */
  timeout?: number;
  /** Enable downsampling heuristic for mid-range devices (default: true) */
  enableDeviceHeuristic?: boolean;
}

/**
 * Canvas-like object that works with both HTMLCanvasElement and OffscreenCanvas.
 */
export type CanvasLike = HTMLCanvasElement | OffscreenCanvas;

/**
 * 2D rendering context that works with both canvas types.
 */
export type RenderingContext2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;
