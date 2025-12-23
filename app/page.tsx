"use client";

/**
 * @fileoverview Main application page for SpectroTrace.
 * Orchestrates image upload, parameter controls, audio generation, and visualization.
 * @module app/page
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Header, type AppMode } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ImageUpload, type ImageData } from "@/components/ImageUpload";
import {
  ImageCropper,
  ImageCropperControls,
  type Crop,
} from "@/components/ImageUpload/ImageCropper";
import { AdvancedControlsPanel } from "@/components/AudioControls";
import { Waveform, Spectrogram } from "@/components/Visualizer";
import { TipPrompt } from "@/components/TipPrompt";
import { useConversionParams } from "@/hooks/useConversionParams";
import { useGeneration } from "@/hooks/useGeneration";
import {
  DEFAULT_CONVERSION_PARAMS,
  sanitizeConversionParams,
} from "@/lib/audio/types";
import { cn } from "@/lib/utils";

export default function Home() {
  const [mode, setMode] = useState<AppMode>("basic");
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [paramsState, paramsActions] = useConversionParams();
  const [generationState, generationActions] = useGeneration();

  // Track the crop used for the last successful generation
  const [lastGeneratedCrop, setLastGeneratedCrop] = useState<Crop | null>(null);

  // Track when waveform is ready for scroll timing
  const [waveformReady, setWaveformReady] = useState(false);

  // Ref for scrolling to results after generation
  const resultsRef = useRef<HTMLElement>(null);

  // Scroll to results when generation completes and waveform is ready
  useEffect(() => {
    if (
      generationState.status === "ready" &&
      waveformReady &&
      resultsRef.current
    ) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      resultsRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [generationState.status, waveformReady]);

  const isGenerating =
    generationState.status === "preprocessing" ||
    generationState.status === "generating";

  // Determine if current settings differ from the last generated result
  const isDirty = useMemo(() => {
    if (generationState.status !== "ready" || !generationState.usedParams) {
      return false;
    }

    // Compare crop dimensions
    const cropChanged =
      JSON.stringify(crop) !== JSON.stringify(lastGeneratedCrop);

    // Compare actual params that would be used now vs what was used
    // Basic mode uses DEFAULT_CONVERSION_PARAMS, advanced mode uses current params
    // Sanitize to ensure consistent key order for JSON.stringify comparison
    const currentParams = sanitizeConversionParams(
      mode === "basic" ? DEFAULT_CONVERSION_PARAMS : paramsState.params,
    );
    const paramsChanged =
      JSON.stringify(currentParams) !==
      JSON.stringify(generationState.usedParams);

    return cropChanged || paramsChanged;
  }, [
    crop,
    mode,
    paramsState.params,
    generationState.status,
    generationState.usedParams,
    lastGeneratedCrop,
  ]);

  function handleGenerate() {
    if (!imageData) return;

    // Capture the current crop for dirty state tracking
    // (params are tracked in generationState.usedParams)
    setLastGeneratedCrop(crop);

    // Reset waveform ready state for scroll timing
    setWaveformReady(false);

    // Build generation options
    generationActions.generate(imageData, crop, {
      // In basic mode, use default params; in advanced mode, use current params
      params: mode === "basic" ? undefined : paramsState.params,
    });
  }

  function handleImageLoaded(image: ImageData) {
    // Revoke previous object URL if exists
    if (imageData?.objectUrl) {
      URL.revokeObjectURL(imageData.objectUrl);
    }
    setImageData(image);
    // Reset crop when new image is loaded
    setCrop(null);
  }

  function handleCropChange(newCrop: Crop) {
    setCrop(newCrop);
  }

  const handleDownloadComplete = useCallback(() => {
    setDownloadCompleted(true);
  }, []);

  const handleWaveformReady = useCallback(() => {
    setWaveformReady(true);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col">
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>

        <Header
          mode={mode}
          onModeChange={setMode}
          onTipClick={() => setTipModalOpen(true)}
        />

        {/* Reserved space for PWA install prompt and offline status banner */}
        <div id="pwa-banner-slot" aria-live="polite" className="empty:hidden" />

        <main id="main-content" className="flex-1" tabIndex={-1}>
          <div className="container mx-auto px-4 py-6">
            <section
              aria-labelledby="upload-heading"
              className="flex flex-col gap-6"
            >
              {/* Upload and preview area */}
              <div className="flex flex-1 flex-col gap-4">
                <h1 id="upload-heading" className="sr-only">
                  Image Upload
                </h1>

                {imageData ? (
                  <div
                    role="region"
                    aria-label="Uploaded image preview and crop"
                    className="flex flex-col gap-4"
                  >
                    <ImageCropper
                      imageSrc={imageData.objectUrl}
                      imageWidth={imageData.width}
                      imageHeight={imageData.height}
                      onCropChange={handleCropChange}
                      className="border-border min-h-75 rounded-lg border"
                      renderControls={(controls) => (
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="max-lg:px-0"
                            onClick={() => {
                              URL.revokeObjectURL(imageData.objectUrl);
                              setImageData(null);
                              setCrop(null);
                            }}
                          >
                            Remove image
                          </Button>
                          <ImageCropperControls {...controls} />
                        </div>
                      )}
                    />
                  </div>
                ) : (
                  <ImageUpload onImageLoaded={handleImageLoaded} />
                )}

                {/* Advanced controls panel - only visible in advanced mode */}
                {mode === "advanced" && (
                  <div
                    role="region"
                    aria-labelledby="advanced-controls-heading"
                    className="border-border bg-card rounded-lg border p-4"
                  >
                    <h2
                      id="advanced-controls-heading"
                      className="mb-4 text-lg font-semibold"
                    >
                      Advanced Controls
                    </h2>
                    <AdvancedControlsPanel
                      params={paramsState.params}
                      onParamsChange={paramsActions.setParams}
                    />
                  </div>
                )}

                {/* Generate button with progress */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="lg"
                    disabled={!imageData || isGenerating}
                    onClick={handleGenerate}
                    className={cn(
                      "w-full",
                      isDirty && "ring-primary ring-2 ring-offset-2",
                    )}
                  >
                    {isGenerating
                      ? "Generating..."
                      : isDirty
                        ? "Regenerate Audio"
                        : "Generate Audio"}
                  </Button>

                  {/* Progress indicator */}
                  {isGenerating && (
                    <div
                      role="progressbar"
                      aria-valuenow={generationState.progress ?? 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Audio generation progress"
                      className="flex flex-col gap-1"
                    >
                      <Progress value={generationState.progress ?? 0} />
                      <p className="text-muted-foreground text-center text-sm">
                        {generationState.status === "preprocessing"
                          ? "Processing image..."
                          : `Generating audio: ${generationState.progress ?? 0}%`}
                      </p>
                    </div>
                  )}

                  {/* Error message */}
                  {generationState.status === "error" &&
                    generationState.error && (
                      <p
                        role="alert"
                        className="text-destructive text-center text-sm"
                      >
                        {generationState.error}
                      </p>
                    )}
                </div>
              </div>
            </section>

            {/* Results area */}
            <section
              ref={resultsRef}
              aria-labelledby="results-heading"
              className="mt-6"
            >
              <h2 id="results-heading" className="mb-4 text-lg font-semibold">
                Results
              </h2>

              {/* Stale results banner */}
              {isDirty && (
                <div
                  role="status"
                  className="mb-4 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  <span>
                    Settings changed. Click &quot;Generate Audio&quot; to update
                    results.
                  </span>
                </div>
              )}

              <div className="grid gap-4">
                <Waveform
                  wavBlob={
                    generationState.status === "ready"
                      ? generationState.wavBlob
                      : null
                  }
                  generatedAt={generationState.generatedAt ?? undefined}
                  onReady={handleWaveformReady}
                  onDownloadComplete={handleDownloadComplete}
                />
                <Spectrogram
                  wavBlob={
                    generationState.status === "ready"
                      ? generationState.wavBlob
                      : null
                  }
                  frequencyMin={generationState.usedParams?.minFreq}
                  frequencyMax={generationState.usedParams?.maxFreq}
                  frequencyScale={generationState.usedParams?.frequencyScale}
                  sampleRate={generationState.usedParams?.sampleRate}
                />
              </div>
            </section>
          </div>
        </main>

        <Footer />

        {/* Tip prompt shown after successful download or from header */}
        <TipPrompt
          downloadCompleted={downloadCompleted}
          isOpen={tipModalOpen}
          onDismiss={() => {
            setDownloadCompleted(false);
            setTipModalOpen(false);
          }}
        />
      </div>
    </TooltipProvider>
  );
}
