/**
 * @fileoverview Type definitions for the ImageCropper component.
 *
 * This module defines the types for interactive image cropping functionality.
 * The cropper allows users to select a region of their uploaded image before
 * converting it to audio. Supports aspect ratio presets and zoom controls.
 *
 * @module components/ImageUpload/ImageCropper/types
 * @see {@link module:components/ImageUpload/ImageCropper} - Main cropper component
 * @see {@link module:lib/image/canvasUtils} - Uses Crop for image processing
 */

/**
 * Represents a crop region in image coordinates (pixels).
 *
 * This is the application-specific crop type used throughout SpectroTrace.
 * All coordinates are in the original image's pixel space, not display pixels.
 * This ensures consistent behavior regardless of how the image is scaled on screen.
 */
export interface Crop {
  /** X offset from left edge in pixels */
  x: number;
  /** Y offset from top edge in pixels */
  y: number;
  /** Width of the crop region in pixels */
  width: number;
  /** Height of the crop region in pixels */
  height: number;
}

/**
 * Aspect ratio presets for cropping
 */
export type AspectRatioPreset = "1:1" | "4:3" | "16:9" | "free";

/**
 * Map of aspect ratio presets to numeric values
 * undefined means free-form (no constraint)
 */
export const ASPECT_RATIOS: Record<AspectRatioPreset, number | undefined> = {
  free: undefined,
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
};

/**
 * Controls render props for external rendering
 */
export interface CropperControls {
  aspectRatio: AspectRatioPreset;
  scale: number;
  disabled: boolean;
  onAspectChange: (preset: AspectRatioPreset) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSliderChange: (value: number[]) => void;
}

/**
 * Props for the ImageCropper component
 */
export interface ImageCropperProps {
  /** Object URL or data URL for the image to crop */
  imageSrc: string;
  /** Original image width in pixels */
  imageWidth: number;
  /** Original image height in pixels */
  imageHeight: number;
  /** Initial aspect ratio preset (defaults to "free") */
  initialAspectRatio?: AspectRatioPreset;
  /** Callback when crop region changes (coordinates in original image pixels) */
  onCropChange?: (crop: Crop) => void;
  /** Callback when aspect ratio preset changes */
  onAspectRatioChange?: (aspectRatio: AspectRatioPreset) => void;
  /** Optional additional class names */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Render prop for controls - if provided, controls are rendered externally */
  renderControls?: (controls: CropperControls) => React.ReactNode;
}
