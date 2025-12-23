"use client";

/**
 * @fileoverview WAV export button component.
 * Triggers browser-native download with timestamp-based filenames.
 * @module components/ExportButton
 */

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateWavFilename } from "@/lib/audio/wavEncoder";
import type { ExportButtonProps } from "./types";

/**
 * Export button component that initiates a browser-native WAV download.
 *
 * **Download Process:**
 * 1. Creates an object URL from the WAV blob
 * 2. Generates timestamped filename (e.g., "spectrotrace_2024-01-15_143022.wav")
 * 3. Triggers download via hidden anchor element
 * 4. Revokes object URL after 10s delay to ensure download completes
 *
 * @param props - Component props
 * @param props.wavBlob - The WAV audio blob to download
 * @param props.generatedAt - Timestamp for filename generation (defaults to now)
 * @param props.disabled - If true, button is non-interactive
 * @param props.className - Additional CSS classes
 * @param props.onDownloadComplete - Callback after successful download initiation
 *
 * @example
 * ```tsx
 * <ExportButton
 *   wavBlob={audioBlob}
 *   generatedAt={generationTime}
 *   onDownloadComplete={() => setHasDownloaded(true)}
 * />
 * ```
 */
export function ExportButton({
  wavBlob,
  generatedAt,
  disabled = false,
  className,
  onDownloadComplete,
}: ExportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(() => {
    if (!wavBlob || isDownloading) return;

    setIsDownloading(true);

    try {
      // Generate filename with generation timestamp (falls back to current time if not provided)
      const filename = generateWavFilename(generatedAt);

      // Create object URL for download
      const url = URL.createObjectURL(wavBlob);

      // Create hidden anchor element and trigger download
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Revoke object URL after a delay to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);

      toast.success(`Downloading ${filename}`);
      onDownloadComplete?.();
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download audio file");
    } finally {
      setIsDownloading(false);
    }
  }, [wavBlob, generatedAt, isDownloading, onDownloadComplete]);

  const isDisabled = disabled || !wavBlob || isDownloading;

  return (
    <Button
      variant="secondary"
      size="default"
      onClick={handleDownload}
      disabled={isDisabled}
      className={className}
      aria-label={
        isDownloading ? "Downloading audio file" : "Download WAV file"
      }
    >
      {isDownloading ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Download aria-hidden="true" />
      )}
      {isDownloading ? "Downloading..." : "Download WAV"}
    </Button>
  );
}

export type { ExportButtonProps };
