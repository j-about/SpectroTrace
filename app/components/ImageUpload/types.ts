/**
 * @fileoverview Type definitions for the ImageUpload component.
 *
 * This module defines the props and data structures for image upload functionality.
 * The ImageUpload component handles drag-and-drop, file picker, and clipboard paste
 * for importing images into SpectroTrace.
 *
 * @module components/ImageUpload/types
 * @see {@link module:components/ImageUpload} - Main upload component using these types
 * @see {@link module:components/ImageUpload/validation} - Validates uploaded files
 */

/**
 * Represents a normalized image ready for processing.
 *
 * This interface encapsulates all the data needed to display and process
 * an uploaded image. The objectUrl should be revoked when no longer needed
 * to prevent memory leaks.
 */
export interface ImageData {
  /** Original file object */
  file: File;
  /** Object URL for displaying the image */
  objectUrl: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
}

/**
 * Props for the ImageUpload component
 */
export interface ImageUploadProps {
  /** Callback when an image is successfully loaded and validated */
  onImageLoaded: (image: ImageData) => void;
  /** Optional callback when image loading starts */
  onLoadStart?: () => void;
  /** Optional additional class names */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}
