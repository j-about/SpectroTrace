/**
 * @fileoverview Image validation utilities for file upload.
 *
 * Provides validation for:
 * - Supported image formats (MIME types and extensions)
 * - File size limits (50MB max)
 * - Resolution limits (8192x8192 max)
 */

/**
 * Supported image MIME types
 */
export const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "image/tiff",
  "image/heic",
  "image/heif",
] as const;

/**
 * Supported image file extensions (lowercase)
 */
export const SUPPORTED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".bmp",
  ".svg",
  ".tiff",
  ".tif",
  ".heic",
  ".heif",
] as const;

/**
 * Accept attribute value for file input
 */
export const ACCEPT_ATTRIBUTE = SUPPORTED_MIME_TYPES.join(",");

/**
 * Maximum file size in bytes (50 MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Maximum image resolution in pixels (width or height)
 */
export const MAX_RESOLUTION = 8192;

/**
 * Human-readable file size limit
 */
export const MAX_FILE_SIZE_LABEL = "50MB";

/**
 * Human-readable resolution limit
 */
export const MAX_RESOLUTION_LABEL = "8192×8192";

/**
 * Error messages for validation failures
 */
export const ERROR_MESSAGES = {
  UNSUPPORTED_FORMAT:
    "Unsupported image format. Supported formats: PNG, JPG, WebP, BMP, SVG, TIFF, HEIC.",
  FILE_TOO_LARGE: `File exceeds ${MAX_FILE_SIZE_LABEL} size limit.`,
  RESOLUTION_TOO_LARGE: `Image resolution exceeds ${MAX_RESOLUTION_LABEL}. The image will need to be downscaled.`,
  LOAD_FAILED: "Failed to load image. The file may be corrupted.",
  NO_FILE: "No file selected.",
} as const;

/**
 * Checks if a MIME type is in the supported list.
 *
 * @param mimeType - The MIME type string to check (e.g., "image/png")
 * @returns True if the MIME type is supported for image upload
 *
 * @example
 * ```ts
 * isSupportedMimeType("image/png"); // true
 * isSupportedMimeType("text/plain"); // false
 * ```
 */
export function isSupportedMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(
    mimeType as (typeof SUPPORTED_MIME_TYPES)[number],
  );
}

/**
 * Checks if a filename has a supported image extension.
 *
 * Performs case-insensitive comparison against the supported extensions list.
 *
 * @param filename - The filename to check (e.g., "photo.PNG")
 * @returns True if the file extension is supported
 *
 * @example
 * ```ts
 * isSupportedExtension("image.jpg"); // true
 * isSupportedExtension("document.pdf"); // false
 * ```
 */
export function isSupportedExtension(filename: string): boolean {
  const lowercaseName = filename.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lowercaseName.endsWith(ext));
}

/**
 * Checks if a file is a supported image format.
 *
 * Uses a two-step validation approach:
 * 1. First checks the MIME type (if available and valid)
 * 2. Falls back to extension check for files with missing/incorrect MIME types
 *
 * This handles edge cases like HEIC files which may not have correct MIME types
 * set by all browsers.
 *
 * @param file - The File object to validate
 * @returns True if the file format is supported
 */
export function isSupported(file: File): boolean {
  // Check MIME type if available
  if (file.type && isSupportedMimeType(file.type)) {
    return true;
  }

  // Fall back to extension check (for files with missing/incorrect MIME types)
  return isSupportedExtension(file.name);
}

/**
 * Checks if a file size is within the allowed limit.
 *
 * @param file - The File object to check
 * @returns True if file.size <= MAX_FILE_SIZE (50MB)
 */
export function isWithinSizeLimit(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Checks if image dimensions are within the resolution limit.
 *
 * Both width and height must be <= MAX_RESOLUTION (8192 pixels).
 * Images exceeding this will be downscaled during processing.
 *
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns True if both dimensions are within limits
 */
export function isWithinResolutionLimit(
  width: number,
  height: number,
): boolean {
  return width <= MAX_RESOLUTION && height <= MAX_RESOLUTION;
}

/**
 * Validates a file for upload and returns an error message if invalid.
 *
 * Performs sequential validation checks:
 * 1. Format validation (MIME type or extension)
 * 2. Size validation (max 50MB)
 *
 * Note: Resolution validation is performed separately after image load
 * since it requires decoding the image to get dimensions.
 *
 * @param file - The File object to validate
 * @returns Error message string if validation fails, null if valid
 */
export function validateFile(file: File): string | null {
  if (!isSupported(file)) {
    return ERROR_MESSAGES.UNSUPPORTED_FORMAT;
  }

  if (!isWithinSizeLimit(file)) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }

  return null;
}
