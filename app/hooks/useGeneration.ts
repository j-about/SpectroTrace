"use client";

/**
 * @fileoverview Hook for orchestrating the complete audio generation flow.
 *
 * This is the primary hook for the SpectroTrace audio generation pipeline.
 * It coordinates image preprocessing with Web Worker-based audio synthesis,
 * providing a simple interface for the main application page.
 *
 * **State Machine:**
 * ```
 * idle → preprocessing → generating → ready
 *   ↑         ↓              ↓          ↓
 *   └─────── error ←─────────┴──────────┘
 *            ↓
 *          reset
 * ```
 *
 * **Pipeline Stages:**
 * 1. **Preprocessing** (main thread): Load image, apply crop, convert to grayscale
 * 2. **Generation** (Web Worker): Run additive synthesis, encode to WAV
 * 3. **Ready**: WAV blob available for playback and download
 *
 * **Key Features:**
 * - Automatic progress tracking (0-100%)
 * - Cancellation support at any stage
 * - Stores used parameters for dirty state detection
 * - Tracks generation timestamp for unique filenames
 *
 * **Usage Pattern:**
 * ```typescript
 * const [state, actions] = useGeneration();
 *
 * // Start generation
 * await actions.generate(imageData, crop, { params });
 *
 * // Monitor status
 * if (state.status === 'ready') {
 *   const wavBlob = state.wavBlob;
 * }
 * ```
 *
 * @module hooks/useGeneration
 * @see {@link module:hooks/useAudioWorker} - Worker communication used internally
 * @see {@link module:lib/image/canvasUtils} - Image preprocessing functions
 * @see {@link module:app/page} - Main page that uses this hook
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ImageData } from "@/components/ImageUpload/types";
import type { Crop } from "@/components/ImageUpload/ImageCropper/types";
import type { ConversionParams } from "@/lib/audio/types";
import {
  DEFAULT_CONVERSION_PARAMS,
  sanitizeConversionParams,
} from "@/lib/audio/types";
import { imageToGrayscaleData } from "@/lib/image";
import { useAudioWorker } from "./useAudioWorker";

/**
 * Generation status values representing the state machine states.
 */
export type GenerationStatus =
  | "idle"
  | "preprocessing"
  | "generating"
  | "ready"
  | "error";

/**
 * State returned by the useGeneration hook.
 */
export interface GenerationState {
  /** Current generation status */
  status: GenerationStatus;
  /** Progress percentage (0-100) during generation, null otherwise */
  progress: number | null;
  /** Error message if status is 'error' */
  error: string | null;
  /** Resulting WAV audio as Blob when status is 'ready' */
  wavBlob: Blob | null;
  /** Whether the worker is ready to accept jobs */
  isWorkerReady: boolean;
  /** Params actually used for audio generation - source of truth for Spectrogram */
  usedParams: ConversionParams | null;
  /** Timestamp when audio generation completed */
  generatedAt: Date | null;
}

/**
 * Options for the generate function.
 */
export interface GenerateOptions {
  /** Audio conversion parameters */
  params?: Partial<ConversionParams>;
}

/**
 * Actions returned by the useGeneration hook.
 */
export interface GenerationActions {
  /** Start audio generation from image data */
  generate: (
    image: ImageData,
    crop: Crop | null,
    options?: GenerateOptions,
  ) => Promise<void>;
  /** Cancel the current generation */
  cancel: () => void;
  /** Reset state to idle */
  reset: () => void;
}

/**
 * Hook for orchestrating the complete audio generation flow.
 * Combines image preprocessing with audio worker communication.
 *
 * State machine:
 * - idle: Initial state, ready to start
 * - preprocessing: Loading and processing image to grayscale
 * - generating: Worker is generating audio (progress updates)
 * - ready: Generation complete, WAV available
 * - error: An error occurred
 *
 * @returns Tuple of [state, actions]
 */
export function useGeneration(): [GenerationState, GenerationActions] {
  const [workerState, workerActions] = useAudioWorker();

  const [localState, setLocalState] = useState<{
    status: GenerationStatus;
    preprocessingError: string | null;
  }>({
    status: "idle",
    preprocessingError: null,
  });

  // Store the actual params used for audio generation (source of truth for Spectrogram)
  const [usedParams, setUsedParams] = useState<ConversionParams | null>(null);

  // Combined audio result state - blob and generation timestamp together
  // This ensures they're always in sync and avoids multiple re-renders
  const [audioResult, setAudioResult] = useState<{
    blob: Blob;
    generatedAt: Date;
  } | null>(null);

  // Track previous result to detect changes
  const prevResultRef = useRef<ArrayBuffer | null>(null);

  // Synchronize audioResult with worker result
  // useLayoutEffect ensures the state update happens before browser paint,
  // preventing visual flicker when displaying the generation timestamp
  useLayoutEffect(() => {
    if (workerState.result !== prevResultRef.current) {
      prevResultRef.current = workerState.result;
      if (workerState.result !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizing with external Web Worker state
        setAudioResult({
          blob: new Blob([workerState.result], { type: "audio/wav" }),
          generatedAt: new Date(),
        });
      } else {
        setAudioResult(null);
      }
    }
  }, [workerState.result]);

  const wavBlob = audioResult?.blob ?? null;
  const generatedAt = audioResult?.generatedAt ?? null;

  // Compute combined state
  const computeStatus = (): GenerationStatus => {
    // Local preprocessing state takes precedence
    if (localState.status === "preprocessing") {
      return "preprocessing";
    }
    if (localState.preprocessingError) {
      return "error";
    }

    // Worker state
    if (workerState.error) {
      return "error";
    }
    if (workerState.isBusy) {
      return "generating";
    }
    if (workerState.result !== null) {
      return "ready";
    }

    return "idle";
  };

  const status = computeStatus();

  // Compute progress (only during generation)
  const progress = status === "generating" ? workerState.progress : null;

  // Compute error message
  const error = localState.preprocessingError ?? workerState.error;

  const state: GenerationState = {
    status,
    progress,
    error,
    wavBlob,
    isWorkerReady: workerState.isReady,
    usedParams,
    generatedAt,
  };

  const generate = useCallback(
    async (
      image: ImageData,
      crop: Crop | null,
      options?: GenerateOptions,
    ): Promise<void> => {
      // Reset any previous errors
      setLocalState({ status: "preprocessing", preprocessingError: null });
      workerActions.reset();

      try {
        // Step 1: Preprocess image to grayscale (returns Float32Array with values 0-1)
        const grayscaleData = await imageToGrayscaleData(
          image.file,
          crop ?? undefined,
        );

        // Step 2: Send to worker for audio generation
        // We send Float32Array directly to avoid unnecessary conversions
        // The ArrayBuffer is transferred (not copied) for performance
        setLocalState({ status: "idle", preprocessingError: null });

        // Merge with defaults and sanitize to ensure consistent key order
        // (needed for JSON.stringify comparison in isDirty check)
        const fullParams = sanitizeConversionParams({
          ...DEFAULT_CONVERSION_PARAMS,
          ...options?.params,
        });

        // Store the actual params used - source of truth for Spectrogram
        setUsedParams(fullParams);

        workerActions.generateAudio(
          grayscaleData.data,
          grayscaleData.width,
          grayscaleData.height,
          fullParams,
        );
      } catch (err) {
        console.error("Image preprocessing failed:", err);
        const message =
          err instanceof Error ? err.message : "Failed to preprocess image";
        setLocalState({ status: "idle", preprocessingError: message });
      }
    },
    [workerActions],
  );

  const cancel = useCallback(() => {
    workerActions.cancelJob();
  }, [workerActions]);

  const reset = useCallback(() => {
    setLocalState({ status: "idle", preprocessingError: null });
    setUsedParams(null);
    // Reset refs - workerActions.reset() will clear workerState.result,
    // which will trigger the ref update on next render
    workerActions.reset();
  }, [workerActions]);

  return [state, { generate, cancel, reset }];
}
