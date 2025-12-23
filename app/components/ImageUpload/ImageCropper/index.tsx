"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ReactCrop, {
  centerCrop,
  type Crop as ReactCropType,
  type PixelCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

import {
  type ImageCropperProps,
  type AspectRatioPreset,
  type Crop,
  type CropperControls,
  ASPECT_RATIOS,
} from "./types";

// Re-export types for consumers
export type { Crop, AspectRatioPreset, ImageCropperProps, CropperControls };

/**
 * Standalone controls component for ImageCropper.
 *
 * Provides UI controls for aspect ratio selection and zoom adjustment.
 * Can be rendered separately from the cropper using the renderControls prop,
 * or is automatically rendered below the cropper when renderControls is not provided.
 *
 * @param props - Control props from CropperControls type
 * @param props.aspectRatio - Current aspect ratio preset
 * @param props.scale - Current zoom level (1-4)
 * @param props.disabled - Whether controls are disabled
 * @param props.onAspectChange - Callback when aspect ratio changes
 * @param props.onZoomIn - Callback to increase zoom
 * @param props.onZoomOut - Callback to decrease zoom
 * @param props.onSliderChange - Callback when zoom slider changes
 */
export function ImageCropperControls({
  aspectRatio,
  scale,
  disabled,
  onAspectChange,
  onZoomIn,
  onZoomOut,
  onSliderChange,
}: Omit<CropperControls, "onReset">) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Aspect ratio - Select on mobile, buttons on lg+ */}
      <Select
        value={aspectRatio}
        onValueChange={onAspectChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20 lg:hidden" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="1:1">1:1</SelectItem>
          <SelectItem value="4:3">4:3</SelectItem>
          <SelectItem value="16:9">16:9</SelectItem>
        </SelectContent>
      </Select>

      <div
        className="hidden gap-1 lg:flex"
        role="group"
        aria-label="Aspect ratio"
      >
        {(["free", "1:1", "4:3", "16:9"] as AspectRatioPreset[]).map(
          (preset) => (
            <Button
              key={preset}
              variant={aspectRatio === preset ? "default" : "outline"}
              size="sm"
              onClick={() => onAspectChange(preset)}
              disabled={disabled}
              aria-pressed={aspectRatio === preset}
            >
              {preset === "free" ? "Free" : preset}
            </Button>
          ),
        )}
      </div>

      {/* Zoom - Input on mobile, slider on lg+ */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="text-muted-foreground text-sm">Zoom</span>
        <Input
          type="number"
          min={100}
          max={400}
          step={10}
          value={Math.round(scale * 100)}
          onChange={(e) => {
            const value = Math.max(100, Math.min(400, Number(e.target.value)));
            onSliderChange([value / 100]);
          }}
          disabled={disabled}
          className="h-8 w-18"
          aria-label="Zoom level"
        />
        <span className="text-muted-foreground text-sm">%</span>
      </div>

      <div
        className="hidden items-center gap-2 lg:flex"
        role="group"
        aria-label="Zoom controls"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          disabled={disabled || scale <= 1}
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Slider
          value={[scale]}
          onValueChange={onSliderChange}
          min={1}
          max={4}
          step={0.1}
          className="w-24"
          disabled={disabled}
          aria-label="Zoom level"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          disabled={disabled || scale >= 4}
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="text-muted-foreground w-12 text-sm">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Creates a centered crop that maximizes the area while maintaining aspect ratio.
 *
 * Calculates the largest possible crop area that fits within the image bounds
 * while respecting the given aspect ratio, then centers it.
 *
 * @param mediaWidth - Image display width in pixels
 * @param mediaHeight - Image display height in pixels
 * @param aspect - Desired aspect ratio (width/height)
 * @returns ReactCrop crop object with percentage-based coordinates
 */
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): ReactCropType {
  // Calculate the maximum crop dimensions that fit within the image
  const imageAspect = mediaWidth / mediaHeight;

  let cropWidth: number;
  let cropHeight: number;

  if (aspect > imageAspect) {
    // Crop is wider than image - constrain by width
    cropWidth = 100;
    cropHeight = (mediaWidth / aspect / mediaHeight) * 100;
  } else {
    // Crop is taller than image - constrain by height
    cropHeight = 100;
    cropWidth = ((mediaHeight * aspect) / mediaWidth) * 100;
  }

  return centerCrop(
    { unit: "%", width: cropWidth, height: cropHeight, x: 0, y: 0 },
    mediaWidth,
    mediaHeight,
  );
}

/**
 * ImageCropper component using react-image-crop library.
 *
 * Provides interactive image cropping with:
 * - Aspect ratio presets (free, 1:1, 4:3, 16:9)
 * - Zoom controls (1x to 4x)
 * - Rule of thirds overlay
 * - Real-time crop coordinate updates
 *
 * **Coordinate System:**
 * The component converts between three coordinate systems:
 * 1. Percentage-based (react-image-crop internal, avoids rounding errors)
 * 2. Display pixels (what the user sees)
 * 3. Original image pixels (reported to parent via onCropChange)
 *
 * @param props - Component props
 * @param props.imageSrc - URL or data URL of the image to crop
 * @param props.imageWidth - Original image width in pixels
 * @param props.imageHeight - Original image height in pixels
 * @param props.initialAspectRatio - Starting aspect ratio preset (default: "free")
 * @param props.onCropChange - Callback with crop coordinates in original image pixels
 * @param props.onAspectRatioChange - Callback when aspect ratio preset changes
 * @param props.className - Additional CSS classes for the cropper container
 * @param props.disabled - If true, cropping is disabled
 * @param props.renderControls - Optional render prop for custom controls placement
 *
 * @example
 * ```tsx
 * <ImageCropper
 *   imageSrc={imageUrl}
 *   imageWidth={1920}
 *   imageHeight={1080}
 *   onCropChange={(crop) => setSelectedRegion(crop)}
 * />
 * ```
 */
export function ImageCropper({
  imageSrc,
  imageWidth,
  imageHeight,
  initialAspectRatio = "free",
  onCropChange,
  onAspectRatioChange,
  className,
  disabled = false,
  renderControls,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  const [crop, setCrop] = useState<ReactCropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [aspectRatio, setAspectRatio] =
    useState<AspectRatioPreset>(initialAspectRatio);

  const aspect = ASPECT_RATIOS[aspectRatio];

  /**
   * Convert crop coordinates to original image coordinates and notify parent.
   *
   * Uses percentCrop directly to avoid rounding errors:
   * - react-image-crop uses getBoundingClientRect() (returns decimals like 733.5625)
   * - img.width returns integers (734)
   * - This mismatch causes cumulative rounding errors when converting through pixels
   *
   * Solution: originalCoord = percent * imageSize / 100
   * This gives consistent results regardless of display size or position.
   */
  const notifyParent = useCallback(
    (
      pixelCrop: PixelCrop,
      img: HTMLImageElement,
      currentScale: number,
      percentCrop?: ReactCropType,
    ) => {
      if (!onCropChange) return;

      // Use percentCrop directly to calculate original image coordinates
      // This avoids rounding errors from the pixel conversion chain:
      // - react-image-crop uses getBoundingClientRect() (e.g., 733.5625)
      // - img.width returns an integer (e.g., 734)
      // - This mismatch causes cumulative rounding errors
      //
      // By using percentages directly: originalCoord = percent * imageSize / 100
      // we get accurate results regardless of display size

      if (!percentCrop || percentCrop.unit !== "%") {
        // Fallback for non-percentage crops (shouldn't happen in normal use)
        const displayToOriginalX = imageWidth / img.width;
        const displayToOriginalY = imageHeight / img.height;
        const unscaledX = pixelCrop.x / currentScale;
        const unscaledY = pixelCrop.y / currentScale;
        const unscaledWidth = pixelCrop.width / currentScale;
        const unscaledHeight = pixelCrop.height / currentScale;

        const imageCrop: Crop = {
          x: Math.round(unscaledX * displayToOriginalX),
          y: Math.round(unscaledY * displayToOriginalY),
          width: Math.round(unscaledWidth * displayToOriginalX),
          height: Math.round(unscaledHeight * displayToOriginalY),
        };

        // Clamp to valid bounds
        imageCrop.x = Math.max(0, Math.min(imageCrop.x, imageWidth - 1));
        imageCrop.y = Math.max(0, Math.min(imageCrop.y, imageHeight - 1));
        imageCrop.width = Math.min(
          Math.max(1, imageCrop.width),
          imageWidth - imageCrop.x,
        );
        imageCrop.height = Math.min(
          Math.max(1, imageCrop.height),
          imageHeight - imageCrop.y,
        );

        onCropChange(imageCrop);
        return;
      }

      // Calculate original coordinates directly from percentages
      // This is the most accurate method as it doesn't depend on display dimensions
      const rawX = (percentCrop.x * imageWidth) / 100;
      const rawY = (percentCrop.y * imageHeight) / 100;
      const rawWidth = (percentCrop.width * imageWidth) / 100;
      const rawHeight = (percentCrop.height * imageHeight) / 100;

      // Round to integers
      let x = Math.round(rawX);
      let y = Math.round(rawY);
      let width = Math.round(rawWidth);
      let height = Math.round(rawHeight);

      // Edge snapping: when crop touches an edge, use exact values
      // This prevents off-by-one errors at boundaries
      if (percentCrop.x === 0) {
        x = 0;
      }
      if (percentCrop.y === 0) {
        y = 0;
      }
      if (percentCrop.x + percentCrop.width >= 100) {
        width = imageWidth - x;
      }
      if (percentCrop.y + percentCrop.height >= 100) {
        height = imageHeight - y;
      }

      // Ensure valid bounds (defensive, should rarely trigger)
      x = Math.max(0, Math.min(x, imageWidth - 1));
      y = Math.max(0, Math.min(y, imageHeight - 1));
      width = Math.min(Math.max(1, width), imageWidth - x);
      height = Math.min(Math.max(1, height), imageHeight - y);

      onCropChange({ x, y, width, height });
    },
    [imageWidth, imageHeight, onCropChange],
  );

  // Initialize crop on image load
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;

      // Initialize with a default crop
      let newCrop: ReactCropType;
      if (aspect) {
        newCrop = centerAspectCrop(width, height, aspect);
      } else {
        // Free crop: start with full image selected
        newCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };
      }
      setCrop(newCrop);

      // Convert to pixel crop and notify parent
      // On initial load, scale is always 1
      const pixelCrop = convertToPixelCrop(newCrop, width, height);
      setCompletedCrop(pixelCrop);
      notifyParent(pixelCrop, e.currentTarget, 1, newCrop);
    },
    [aspect, notifyParent],
  );

  // Handle aspect ratio change
  const handleAspectChange = useCallback(
    (newAspect: AspectRatioPreset) => {
      setAspectRatio(newAspect);
      onAspectRatioChange?.(newAspect);

      const numericAspect = ASPECT_RATIOS[newAspect];
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        let newCrop: ReactCropType;

        if (numericAspect) {
          newCrop = centerAspectCrop(width, height, numericAspect);
        } else {
          // Free crop: expand to full image
          newCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };
        }

        setCrop(newCrop);
        const pixelCrop = convertToPixelCrop(newCrop, width, height);
        setCompletedCrop(pixelCrop);
        notifyParent(pixelCrop, imgRef.current, scale, newCrop);
      }
    },
    [onAspectRatioChange, notifyParent, scale],
  );

  // Handle crop completion
  const handleCropComplete = useCallback(
    (c: PixelCrop, percentCrop: ReactCropType) => {
      setCompletedCrop(c);
      if (imgRef.current) {
        notifyParent(c, imgRef.current, scale, percentCrop);
      }
    },
    [notifyParent, scale],
  );

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(4, Math.round((s + 0.1) * 10) / 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(1, Math.round((s - 0.1) * 10) / 10));
  }, []);

  const handleSliderChange = useCallback((value: number[]) => {
    setScale(value[0]);
  }, []);

  // Update parent when scale changes (crop coordinates change relative to original image)
  // We use a ref to track the previous scale to avoid re-running on completedCrop changes
  const prevScaleRef = useRef(scale);
  useEffect(() => {
    if (
      prevScaleRef.current !== scale &&
      completedCrop &&
      imgRef.current &&
      crop
    ) {
      notifyParent(completedCrop, imgRef.current, scale, crop);
      prevScaleRef.current = scale;
    }
  }, [scale, completedCrop, crop, notifyParent]);

  // Controls object for render prop - memoized to avoid passing ref during render
  const controls: CropperControls = useMemo(
    () => ({
      aspectRatio,
      scale,
      disabled,
      onAspectChange: handleAspectChange,
      onZoomIn: handleZoomIn,
      onZoomOut: handleZoomOut,
      onSliderChange: handleSliderChange,
    }),
    [
      aspectRatio,
      scale,
      disabled,
      handleAspectChange,
      handleZoomIn,
      handleZoomOut,
      handleSliderChange,
    ],
  );

  return (
    <>
      <div
        className={cn(
          "bg-muted flex items-center justify-center overflow-hidden rounded-lg",
          className,
        )}
      >
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={handleCropComplete}
          aspect={aspect}
          minHeight={20}
          minWidth={20}
          disabled={disabled}
          ruleOfThirds
          className="max-h-[60vh]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Image to crop"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center",
              maxHeight: "60vh",
              width: "auto",
            }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>

      {renderControls ? (
        // eslint-disable-next-line react-hooks/refs -- controls object contains values and callbacks, not refs
        renderControls(controls)
      ) : (
        <ImageCropperControls {...controls} />
      )}
    </>
  );
}

export default ImageCropper;
