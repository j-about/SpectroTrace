/**
 * @fileoverview Spectrogram visualization component using WaveSurfer.js.
 *
 * Renders dual spectrograms for audio analysis:
 * - Full spectrum view (20Hz to Nyquist frequency)
 * - Zoomed view (user's selected frequency range)
 *
 * Supports multiple color maps and respects reduced motion preferences.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type WaveSurfer from "wavesurfer.js";
import { Link2, Unlink2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FrequencyScale } from "@/lib/audio/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Lazy import WaveSurfer to avoid SSR issues */
const importWaveSurfer = () => import("wavesurfer.js");

/** Lazy import Spectrogram plugin to avoid SSR issues */
const importSpectrogram = () =>
  import("wavesurfer.js/dist/plugins/spectrogram.esm.js");

/** Color map options for the spectrogram (built-in WaveSurfer options) */
export type ColorMapType = "gray" | "igray" | "roseus";

export interface SpectrogramProps {
  /** WAV audio blob to visualize */
  wavBlob: Blob | null;
  /** Optional class name for the container */
  className?: string;
  /** Callback when error occurs */
  onError?: (error: string) => void;
  /** Minimum frequency in Hz for spectrogram display (default: 200) */
  frequencyMin?: number;
  /** Maximum frequency in Hz for spectrogram display (default: 8000) */
  frequencyMax?: number;
  /** Frequency scale for spectrogram display (default: "logarithmic") */
  frequencyScale?: FrequencyScale;
  /** Sample rate in Hz for Nyquist frequency calculation (default: 44100) */
  sampleRate?: number;
}

/**
 * Hook to detect if user prefers reduced motion.
 *
 * Uses the prefers-reduced-motion media query to respect user's
 * accessibility preferences. Updates reactively when the preference changes.
 *
 * @returns True if user has enabled reduced motion preference
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // SSR-safe: return false on server, check on client
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

/** Props for the internal SpectrogramPanel component */
interface SpectrogramPanelProps {
  /** WAV audio blob to visualize */
  wavBlob: Blob;
  /** Minimum frequency in Hz */
  frequencyMin: number;
  /** Maximum frequency in Hz */
  frequencyMax: number;
  /** Frequency scale */
  frequencyScale: FrequencyScale;
  /** Sample rate in Hz */
  sampleRate: number;
  /** Color map to use (built-in WaveSurfer option) */
  colorMap: ColorMapType;
  /** Label to display above the spectrogram */
  label: string;
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Callback when error occurs */
  onError?: (error: string) => void;
}

/**
 * Internal component that renders a single spectrogram panel.
 *
 * Creates a WaveSurfer instance with the Spectrogram plugin to visualize
 * audio frequency content over time. The waveform itself is hidden (transparent)
 * as only the spectrogram visualization is needed.
 *
 * @param props - Panel configuration
 * @param props.wavBlob - Audio data to visualize
 * @param props.frequencyMin - Lower frequency bound (Hz)
 * @param props.frequencyMax - Upper frequency bound (Hz)
 * @param props.frequencyScale - Scale type ("linear" or "logarithmic")
 * @param props.sampleRate - Audio sample rate (Hz)
 * @param props.colorMap - Color scheme for visualization
 * @param props.label - Display label above the spectrogram
 * @param props.prefersReducedMotion - Whether to apply reduced motion styles
 * @param props.onError - Error callback
 */
function SpectrogramPanel({
  wavBlob,
  frequencyMin,
  frequencyMax,
  frequencyScale,
  sampleRate,
  colorMap,
  label,
  prefersReducedMotion,
  onError,
}: SpectrogramPanelProps) {
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!waveformContainerRef.current || !wavBlob) {
      return;
    }

    const blobToLoad = wavBlob;
    let ws: WaveSurfer | null = null;
    let isDestroyed = false;

    async function initWaveSurfer() {
      if (!waveformContainerRef.current || isDestroyed) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [WaveSurferModule, SpectrogramModule] = await Promise.all([
          importWaveSurfer(),
          importSpectrogram(),
        ]);

        if (isDestroyed || !waveformContainerRef.current) {
          return;
        }

        const WaveSurfer = WaveSurferModule.default;
        const Spectrogram = SpectrogramModule.default;

        // Destroy previous instance if exists
        if (waveSurferRef.current) {
          waveSurferRef.current.destroy();
          waveSurferRef.current = null;
        }

        ws = WaveSurfer.create({
          container: waveformContainerRef.current,
          waveColor: "transparent",
          progressColor: "transparent",
          cursorColor: "transparent",
          height: 1,
          normalize: true,
          hideScrollbar: true,
          sampleRate: sampleRate,
        });

        if (isDestroyed) {
          ws.destroy();
          return;
        }

        ws.on("error", (err: Error) => {
          if (isDestroyed) return;
          const message = err.message || "Failed to load audio for spectrogram";
          setError(message);
          setIsLoading(false);
          onError?.(message);
        });

        const wsInstance = ws;
        await new Promise<void>((resolve, reject) => {
          wsInstance.once("decode", () => {
            resolve();
          });
          wsInstance.once("error", (err: Error) => {
            reject(err);
          });
          wsInstance.loadBlob(blobToLoad);
        });

        if (isDestroyed) {
          ws.destroy();
          return;
        }

        const decodedBuffer = ws.getDecodedData();
        if (!decodedBuffer) {
          throw new Error("Failed to decode audio buffer");
        }

        const nyquistFrequency = sampleRate / 2;
        const effectiveFrequencyMax = Math.min(frequencyMax, nyquistFrequency);

        ws.registerPlugin(
          Spectrogram.create({
            labels: true,
            labelsColor: "#94a3b8",
            labelsBackground: "rgba(15, 23, 42, 0.8)",
            height: 512,
            fftSamples: 1024,
            frequencyMin,
            frequencyMax: effectiveFrequencyMax,
            colorMap: colorMap,
            scale: frequencyScale,
            gainDB: 20,
            rangeDB: 80,
            windowFunc: "hann",
          }),
        );

        if (isDestroyed) {
          ws.destroy();
          return;
        }

        waveSurferRef.current = ws;
        setIsLoading(false);
      } catch (err) {
        if (isDestroyed) return;
        const message =
          err instanceof Error
            ? err.message
            : "Failed to initialize spectrogram";
        setError(message);
        setIsLoading(false);
        onError?.(message);
      }
    }

    initWaveSurfer();

    return () => {
      isDestroyed = true;
      if (ws) {
        ws.destroy();
      }
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
        waveSurferRef.current = null;
      }
    };
  }, [
    wavBlob,
    colorMap,
    frequencyMin,
    frequencyMax,
    frequencyScale,
    sampleRate,
    onError,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <div
        ref={waveformContainerRef}
        className={cn(
          "w-full overflow-hidden rounded bg-slate-950",
          prefersReducedMotion && "motion-reduce",
        )}
        aria-label={`${label} - frequency visualization`}
      />
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <span className="border-primary size-4 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-muted-foreground ml-2 text-xs">Loading...</span>
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Spectrogram visualizer component using WaveSurfer.js Spectrogram plugin.
 *
 * **Dual View Display:**
 * - Left panel: Full spectrum (20Hz to Nyquist frequency)
 * - Right panel: Zoomed view (user's selected frequency range)
 *
 * **Color Map Options:**
 * - Gray: Standard grayscale
 * - Inverted Gray: White = high intensity
 * - Roseus: Purple/pink heat map (default)
 *
 * Color maps can be linked (both panels use same color) or independent.
 *
 * **Technical Notes:**
 * - Uses FFT with 1024 samples for frequency analysis
 * - Hann window function for better frequency resolution
 * - Respects prefers-reduced-motion accessibility setting
 *
 * @param props - Component props
 * @param props.wavBlob - WAV audio blob to visualize (null shows placeholder)
 * @param props.className - Additional CSS classes for container
 * @param props.onError - Callback when spectrogram rendering fails
 * @param props.frequencyMin - Lower bound for zoomed view (default: 200Hz)
 * @param props.frequencyMax - Upper bound for zoomed view (default: 8000Hz)
 * @param props.frequencyScale - Scale type for y-axis (default: "logarithmic")
 * @param props.sampleRate - Audio sample rate for Nyquist calculation (default: 44100Hz)
 *
 * @example
 * ```tsx
 * <Spectrogram
 *   wavBlob={generatedAudio}
 *   frequencyMin={params.minFreq}
 *   frequencyMax={params.maxFreq}
 *   sampleRate={params.sampleRate}
 * />
 * ```
 */
export function Spectrogram({
  wavBlob,
  className,
  onError,
  frequencyMin = 200,
  frequencyMax = 8000,
  frequencyScale = "logarithmic",
  sampleRate = 44100,
}: SpectrogramProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // State for color map linking
  const [colorMapsLinked, setColorMapsLinked] = useState(true);
  const [globalColorMap, setGlobalColorMap] = useState<ColorMapType>("roseus");
  const [fullViewColorMap, setFullViewColorMap] =
    useState<ColorMapType>("roseus");
  const [zoomedViewColorMap, setZoomedViewColorMap] =
    useState<ColorMapType>("roseus");

  // Detect reduced motion preference
  const prefersReducedMotion = usePrefersReducedMotion();

  // Compute Nyquist frequency for full spectrum display
  const nyquistFrequency = sampleRate / 2;

  // Compute effective color map types based on link state
  const effectiveFullColorMap = colorMapsLinked
    ? globalColorMap
    : fullViewColorMap;
  const effectiveZoomedColorMap = colorMapsLinked
    ? globalColorMap
    : zoomedViewColorMap;

  // Handle color map changes
  const handleGlobalColorMapChange = useCallback((value: string) => {
    setGlobalColorMap(value as ColorMapType);
  }, []);

  const handleFullViewColorMapChange = useCallback((value: string) => {
    setFullViewColorMap(value as ColorMapType);
  }, []);

  const handleZoomedViewColorMapChange = useCallback((value: string) => {
    setZoomedViewColorMap(value as ColorMapType);
  }, []);

  const toggleColorMapLink = useCallback(() => {
    setColorMapsLinked((prev) => {
      if (!prev) {
        // When linking, sync individual maps to global
        setFullViewColorMap(globalColorMap);
        setZoomedViewColorMap(globalColorMap);
      }
      return !prev;
    });
  }, [globalColorMap]);

  // Render placeholder if no blob
  if (!wavBlob) {
    return (
      <div
        className={cn(
          "border-border bg-card flex min-h-35 flex-col items-center justify-center rounded-lg border p-4",
          className,
        )}
      >
        <p className="text-muted-foreground text-sm font-medium">Spectrogram</p>
        <p className="text-muted-foreground/60 mt-2 text-xs">
          Generate audio to see spectrogram
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "border-border bg-card relative flex flex-col gap-3 rounded-lg border p-4",
        className,
      )}
      role="region"
      aria-label="Spectrogram visualization"
    >
      {/* Color map controls row */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleColorMapLink}
          className="gap-2"
          aria-label={colorMapsLinked ? "Unlink color maps" : "Link color maps"}
        >
          {colorMapsLinked ? (
            <Link2 className="size-4" />
          ) : (
            <Unlink2 className="size-4" />
          )}
          <span className="text-xs">
            {colorMapsLinked ? "Linked" : "Independent"}
          </span>
        </Button>

        {colorMapsLinked ? (
          // Single global color map selector
          <div className="flex items-center gap-2">
            <Label
              htmlFor="colormap-global"
              className="text-sm whitespace-nowrap"
            >
              Color Map
            </Label>
            <Select
              value={globalColorMap}
              onValueChange={handleGlobalColorMapChange}
            >
              <SelectTrigger id="colormap-global" className="w-32">
                <SelectValue placeholder="Select color map" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gray">Gray</SelectItem>
                <SelectItem value="igray">Inverted Gray</SelectItem>
                <SelectItem value="roseus">Roseus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          // Independent color map selectors
          <>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="colormap-full"
                className="text-xs whitespace-nowrap"
              >
                Full
              </Label>
              <Select
                value={fullViewColorMap}
                onValueChange={handleFullViewColorMapChange}
              >
                <SelectTrigger id="colormap-full" className="w-28">
                  <SelectValue placeholder="Color map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="igray">Inverted Gray</SelectItem>
                  <SelectItem value="roseus">Roseus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="colormap-zoomed"
                className="text-xs whitespace-nowrap"
              >
                Zoomed
              </Label>
              <Select
                value={zoomedViewColorMap}
                onValueChange={handleZoomedViewColorMapChange}
              >
                <SelectTrigger id="colormap-zoomed" className="w-28">
                  <SelectValue placeholder="Color map" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="igray">Inverted Gray</SelectItem>
                  <SelectItem value="roseus">Roseus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {prefersReducedMotion && (
          <span className="text-muted-foreground text-xs">
            (Reduced motion mode)
          </span>
        )}
      </div>

      {/* Dual spectrogram grid - 50/50 split */}
      <div className="grid grid-cols-2 gap-4">
        <SpectrogramPanel
          wavBlob={wavBlob}
          frequencyMin={20}
          frequencyMax={nyquistFrequency}
          frequencyScale={frequencyScale}
          sampleRate={sampleRate}
          colorMap={effectiveFullColorMap}
          label="Full Spectrum"
          prefersReducedMotion={prefersReducedMotion}
          onError={onError}
        />
        <SpectrogramPanel
          wavBlob={wavBlob}
          frequencyMin={frequencyMin}
          frequencyMax={frequencyMax}
          frequencyScale={frequencyScale}
          sampleRate={sampleRate}
          colorMap={effectiveZoomedColorMap}
          label="Selected Range"
          prefersReducedMotion={prefersReducedMotion}
          onError={onError}
        />
      </div>
    </div>
  );
}
