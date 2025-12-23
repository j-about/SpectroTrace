"use client";

/**
 * @fileoverview Waveform visualization component using WaveSurfer.js.
 * Provides audio playback controls and click-to-seek functionality.
 * @module components/Visualizer/Waveform
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type WaveSurfer from "wavesurfer.js";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExportButton } from "@/components/ExportButton";
import { cn } from "@/lib/utils";

// Lazy import WaveSurfer to avoid SSR issues
const importWaveSurfer = () => import("wavesurfer.js");

export interface WaveformProps {
  /** WAV audio blob to visualize and play */
  wavBlob: Blob | null;
  /** Timestamp when the audio was generated. Used for download filename. */
  generatedAt?: Date;
  /** Optional class name for the container */
  className?: string;
  /** Callback when playback state changes */
  onPlaybackChange?: (isPlaying: boolean) => void;
  /** Callback when time updates during playback */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** Callback when waveform is ready */
  onReady?: (duration: number) => void;
  /** Callback when playback finishes */
  onFinish?: () => void;
  /** Callback when audio download completes */
  onDownloadComplete?: () => void;
}

/**
 * Formats time in seconds to MM:SS display format.
 *
 * Handles edge cases like negative numbers and non-finite values
 * by returning "0:00".
 *
 * @param seconds - Time value in seconds
 * @returns Formatted string like "1:23" or "0:05"
 *
 * @example
 * ```ts
 * formatTime(65);  // "1:05"
 * formatTime(0);   // "0:00"
 * formatTime(-5);  // "0:00"
 * ```
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Waveform visualizer component using WaveSurfer.js.
 *
 * **Features:**
 * - Interactive waveform display with click-to-seek
 * - Play/Pause and Stop controls
 * - Real-time time display (current / duration)
 * - Keyboard support (Space to play/pause)
 * - Export button integration for downloading generated audio
 *
 * **Technical Notes:**
 * - WaveSurfer is lazy-loaded to avoid SSR issues
 * - Component handles cleanup on unmount and blob changes
 * - Uses emerald color scheme matching SpectroTrace branding
 *
 * @param props - Component props
 * @param props.wavBlob - WAV audio blob to visualize (null shows placeholder)
 * @param props.generatedAt - Timestamp for download filename generation
 * @param props.className - Additional CSS classes for container
 * @param props.onPlaybackChange - Callback when play/pause state changes
 * @param props.onTimeUpdate - Callback with current time and duration during playback
 * @param props.onReady - Callback when waveform is fully rendered
 * @param props.onFinish - Callback when playback completes
 * @param props.onDownloadComplete - Callback after audio download (enables export button)
 *
 * @example
 * ```tsx
 * <Waveform
 *   wavBlob={generatedAudio}
 *   generatedAt={new Date()}
 *   onPlaybackChange={(playing) => setIsPlaying(playing)}
 *   onDownloadComplete={() => toast.success("Downloaded!")}
 * />
 * ```
 */
export function Waveform({
  wavBlob,
  generatedAt,
  className,
  onPlaybackChange,
  onTimeUpdate,
  onReady,
  onFinish,
  onDownloadComplete,
}: WaveformProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize WaveSurfer when blob changes
  useEffect(() => {
    // Skip if no container or blob
    if (!waveformContainerRef.current || !wavBlob) {
      return;
    }

    // Capture blob after null check for TypeScript
    const blobToLoad = wavBlob;

    let ws: WaveSurfer | null = null;
    let isDestroyed = false;

    async function initWaveSurfer() {
      if (!waveformContainerRef.current || isDestroyed) return;

      setIsLoading(true);
      setError(null);
      setIsReady(false);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);

      try {
        const WaveSurfer = (await importWaveSurfer()).default;

        if (isDestroyed || !waveformContainerRef.current) return;

        // Destroy previous instance if exists
        if (waveSurferRef.current) {
          waveSurferRef.current.destroy();
          waveSurferRef.current = null;
        }

        // Create new WaveSurfer instance
        ws = WaveSurfer.create({
          container: waveformContainerRef.current,
          waveColor: "#00d492", // emerald-400
          progressColor: "#00bc7d", // emerald-500
          cursorColor: "#ecfdf5", // emerald-50
          cursorWidth: 2,
          height: 128,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          normalize: true,
          hideScrollbar: true,
        });

        if (isDestroyed) {
          ws.destroy();
          return;
        }

        waveSurferRef.current = ws;

        // Set up event handlers
        ws.on("ready", (dur: number) => {
          if (isDestroyed) return;
          setDuration(dur);
          setIsLoading(false);
          // Set max volume
          ws?.setVolume(1);
        });

        // Wait for visual rendering to complete before signaling ready
        ws.once("redrawcomplete", () => {
          if (isDestroyed) return;
          setIsReady(true);
          onReady?.(waveSurferRef.current?.getDuration() ?? 0);
        });

        ws.on("timeupdate", (time: number) => {
          if (isDestroyed) return;
          setCurrentTime(time);
          const dur = ws?.getDuration() ?? 0;
          onTimeUpdate?.(time, dur);
        });

        ws.on("play", () => {
          if (isDestroyed) return;
          setIsPlaying(true);
          onPlaybackChange?.(true);
        });

        ws.on("pause", () => {
          if (isDestroyed) return;
          setIsPlaying(false);
          onPlaybackChange?.(false);
        });

        ws.on("finish", () => {
          if (isDestroyed) return;
          setIsPlaying(false);
          onPlaybackChange?.(false);
          onFinish?.();
        });

        ws.on("error", (err: Error) => {
          if (isDestroyed) return;
          setError(err.message || "Failed to load audio");
          setIsLoading(false);
        });

        // Load the blob
        await ws.loadBlob(blobToLoad);
      } catch (err) {
        if (isDestroyed) return;
        const message =
          err instanceof Error ? err.message : "Failed to load audio";
        setError(message);
        setIsLoading(false);
      }
    }

    initWaveSurfer().catch((err) => {
      if (!isDestroyed) {
        console.error("WaveSurfer initialization failed:", err);
      }
    });

    // Cleanup function
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
  }, [wavBlob, onPlaybackChange, onTimeUpdate, onReady, onFinish]);

  // Handlers
  const handlePlayPause = useCallback(() => {
    if (!waveSurferRef.current || !isReady) return;
    waveSurferRef.current.playPause();
  }, [isReady]);

  const handleStop = useCallback(() => {
    if (!waveSurferRef.current || !isReady) return;
    waveSurferRef.current.stop();
  }, [isReady]);

  // Keyboard handler for Space to toggle play/pause
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        handlePlayPause();
      }
    },
    [handlePlayPause],
  );

  // Render placeholder if no blob
  if (!wavBlob) {
    return (
      <div
        className={cn(
          "border-border bg-card flex min-h-35 flex-col items-center justify-center rounded-lg border p-4",
          className,
        )}
      >
        <p className="text-muted-foreground text-sm font-medium">Waveform</p>
        <p className="text-muted-foreground/60 mt-2 text-xs">
          Generate audio to see waveform
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "border-border bg-card flex flex-col gap-3 rounded-lg border p-4",
        className,
      )}
      role="region"
      aria-label="Waveform visualizer and audio player"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Waveform container */}
      <div
        ref={waveformContainerRef}
        className="min-h-20 w-full cursor-pointer"
        aria-label="Audio waveform - click to seek"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <span className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-muted-foreground ml-2 text-sm">Loading...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              onClick={handlePlayPause}
              disabled={!isReady || isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying ? "Pause (Space)" : "Play (Space)"}
          </TooltipContent>
        </Tooltip>

        {/* Stop button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleStop}
              disabled={!isReady || isLoading}
              aria-label="Stop"
            >
              <Square className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Stop</TooltipContent>
        </Tooltip>

        {/* Time display */}
        <div className="text-muted-foreground min-w-20 text-center font-mono text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export button */}
        {onDownloadComplete && (
          <ExportButton
            wavBlob={wavBlob}
            generatedAt={generatedAt}
            onDownloadComplete={onDownloadComplete}
          />
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-muted-foreground text-xs">
        Press <kbd className="bg-muted rounded px-1 py-0.5 text-xs">Space</kbd>{" "}
        to play/pause when focused
      </p>
    </div>
  );
}
