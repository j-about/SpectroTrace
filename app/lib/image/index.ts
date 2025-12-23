/**
 * @fileoverview Image processing module barrel exports.
 *
 * This module serves as the public API for SpectroTrace's image processing system.
 * It re-exports all types and functions from the image submodules.
 *
 * **Core Functionality:**
 * - **types.ts**: Type definitions for image processing (Crop, GrayscaleData, etc.)
 * - **canvasUtils.ts**: Canvas operations (load, resize, crop, grayscale conversion)
 *
 * **Primary Entry Point:**
 * The main function for external use is `imageToGrayscaleData()`, which handles
 * the complete pipeline from file upload to grayscale data ready for synthesis.
 *
 * **Usage:**
 * ```typescript
 * import { imageToGrayscaleData, type GrayscaleData } from "@/lib/image";
 *
 * const grayscale = await imageToGrayscaleData(file, crop);
 * // grayscale.data is a Float32Array ready for audio synthesis
 * ```
 *
 * @module lib/image
 * @see {@link module:lib/image/types} - Type definitions
 * @see {@link module:lib/image/canvasUtils} - Canvas utilities
 */

// =============================================================================
// Type definitions
// =============================================================================
export type {
  CanvasLike,
  GrayscaleData,
  ImageProcessingOptions,
  RenderingContext2D,
} from "./types";

// =============================================================================
// Canvas utilities
// =============================================================================
export {
  supportsOffscreenCanvas,
  createCanvas,
  getContext2D,
  loadImageToCanvas,
  resizeCanvasIfNeeded,
  applyCrop,
  toGrayscaleFloat32,
  imageToGrayscaleData,
} from "./canvasUtils";
