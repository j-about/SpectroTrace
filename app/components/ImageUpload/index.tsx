"use client";

/**
 * @fileoverview Image upload component with drag-and-drop and clipboard paste.
 * Handles file validation and emits normalized ImageData.
 * @module components/ImageUpload
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ImageData, ImageUploadProps } from "./types";
import {
  ACCEPT_ATTRIBUTE,
  ERROR_MESSAGES,
  MAX_RESOLUTION,
  isWithinResolutionLimit,
  validateFile,
} from "./validation";

/**
 * ImageUpload component supporting multiple input methods for image selection.
 *
 * **Input Methods:**
 * - File picker dialog (click or button)
 * - Drag and drop (with full-viewport overlay)
 * - Clipboard paste (Ctrl/Cmd+V)
 *
 * **Validation:**
 * - Supported formats: PNG, JPG, WebP, BMP, SVG, TIFF, HEIC
 * - Maximum file size: 50MB
 * - Maximum resolution: 8192×8192 (warns if exceeded, will be downscaled)
 *
 * @param props - Component props
 * @param props.onImageLoaded - Callback when image is successfully loaded with dimensions
 * @param props.onLoadStart - Optional callback when image loading begins
 * @param props.className - Additional CSS classes for the container
 * @param props.disabled - If true, all input methods are disabled
 *
 * @example
 * ```tsx
 * <ImageUpload
 *   onImageLoaded={(data) => setImage(data)}
 *   onLoadStart={() => setLoading(true)}
 *   disabled={isGenerating}
 * />
 * ```
 */
export function ImageUpload({
  onImageLoaded,
  onLoadStart,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  /**
   * Processes a file and emits the normalized image data
   */
  const handleFile = useCallback(
    (file: File) => {
      // Validate file format and size
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setIsLoading(true);
      onLoadStart?.();

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = img;

        // Check resolution limits
        if (!isWithinResolutionLimit(width, height)) {
          toast.warning(
            `Image resolution (${width}×${height}) exceeds ${MAX_RESOLUTION}×${MAX_RESOLUTION}. It will be downscaled during processing.`,
            { duration: 5000 },
          );
        }

        setIsLoading(false);
        onImageLoaded({ file, objectUrl, width, height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setIsLoading(false);
        toast.error(ERROR_MESSAGES.LOAD_FAILED);
      };

      img.src = objectUrl;
    },
    [onImageLoaded, onLoadStart],
  );

  /**
   * Handles files from any input source (file picker, drop, paste)
   */
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const file = files[0];
      if (!file) {
        toast.error(ERROR_MESSAGES.NO_FILE);
        return;
      }
      handleFile(file);
    },
    [handleFile],
  );

  /**
   * File input change handler
   */
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input so the same file can be selected again
      event.target.value = "";
    },
    [handleFiles],
  );

  /**
   * Opens the file picker dialog
   */
  const openFilePicker = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // Drag and drop handlers
  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;

      dragCounterRef.current++;
      if (event.dataTransfer?.items) {
        const hasFiles = Array.from(event.dataTransfer.items).some(
          (item) => item.kind === "file",
        );
        if (hasFiles) {
          setIsDragging(true);
        }
      }
    },
    [disabled],
  );

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (disabled) return;

      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [disabled, handleFiles],
  );

  // Clipboard paste handler
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (disabled) return;
      if (!document.hasFocus()) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
            return;
          }
        }
      }
    },
    [disabled, handleFile],
  );

  // Set up global event listeners
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => handleDragEnter(e);
    const handleGlobalDragOver = (e: DragEvent) => handleDragOver(e);
    const handleGlobalDragLeave = (e: DragEvent) => handleDragLeave(e);
    const handleGlobalDrop = (e: DragEvent) => handleDrop(e);
    const handleGlobalPaste = (e: ClipboardEvent) => handlePaste(e);

    window.addEventListener("dragenter", handleGlobalDragEnter);
    window.addEventListener("dragover", handleGlobalDragOver);
    window.addEventListener("dragleave", handleGlobalDragLeave);
    window.addEventListener("drop", handleGlobalDrop);
    window.addEventListener("paste", handleGlobalPaste);

    return () => {
      window.removeEventListener("dragenter", handleGlobalDragEnter);
      window.removeEventListener("dragover", handleGlobalDragOver);
      window.removeEventListener("dragleave", handleGlobalDragLeave);
      window.removeEventListener("drop", handleGlobalDrop);
      window.removeEventListener("paste", handleGlobalPaste);
    };
  }, [
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
  ]);

  return (
    <>
      {/* Full-viewport drag overlay */}
      {isDragging && (
        <div
          data-slot="drop-overlay"
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          aria-hidden="true"
        >
          <div className="border-primary bg-primary/10 flex flex-col items-center gap-4 rounded-xl border-4 border-dashed p-12">
            <ImageIcon className="text-primary size-16" />
            <p className="text-primary text-xl font-semibold">
              Drop image here
            </p>
          </div>
        </div>
      )}

      {/* Main upload area */}
      <div
        data-slot="image-upload"
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        className={cn(
          "border-border bg-muted/20 flex min-h-75 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6 transition-colors",
          "hover:border-primary/50 hover:bg-muted/30",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer",
          className,
        )}
        aria-label="Image upload area. Click to browse, drag and drop, or paste from clipboard."
        aria-disabled={disabled}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          disabled={disabled}
          aria-hidden="true"
        />

        {isLoading ? (
          <>
            <div className="border-muted-foreground/20 border-t-primary size-12 animate-spin rounded-full border-4" />
            <p className="font-medium">Loading image...</p>
          </>
        ) : (
          <>
            <Upload
              className="text-muted-foreground size-12"
              aria-hidden="true"
            />
            <div className="text-center">
              <p className="font-medium">Drop an image here</p>
              <p className="text-muted-foreground text-sm">
                or click to browse • paste from clipboard
              </p>
            </div>
            <Button
              variant="secondary"
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker();
              }}
            >
              Select Image
            </Button>
            <p className="text-muted-foreground/70 text-xs">
              PNG, JPG, WebP, BMP, SVG, TIFF, HEIC • Max 50MB
            </p>
          </>
        )}
      </div>
    </>
  );
}

export type { ImageData, ImageUploadProps };
