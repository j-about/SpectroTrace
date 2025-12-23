"use client";

/**
 * @fileoverview Hook for managing the audio generation Web Worker.
 *
 * This hook provides a React-friendly interface to the audio generation Web Worker.
 * It handles the complete worker lifecycle including initialization, message passing,
 * job tracking, cancellation, and cleanup.
 *
 * **Key Features:**
 * - Automatic worker initialization on mount and cleanup on unmount
 * - Job-based tracking with unique IDs to handle race conditions
 * - Progress reporting during audio generation
 * - Cancellation support for long-running jobs
 * - Type-safe message passing with WorkerRequest/WorkerResponse
 *
 * **Usage Pattern:**
 * ```typescript
 * const [state, actions] = useAudioWorker();
 *
 * // Start generation
 * const jobId = actions.generateAudio(grayscaleData, width, height, params);
 *
 * // Monitor progress
 * console.log(state.progress); // 0-100
 *
 * // Cancel if needed
 * actions.cancelJob();
 *
 * // Access result when ready
 * if (state.result) {
 *   const blob = new Blob([state.result], { type: 'audio/wav' });
 * }
 * ```
 *
 * @module hooks/useAudioWorker
 * @see {@link module:workers/audioWorker} - The worker this hook communicates with
 * @see {@link module:hooks/useGeneration} - Higher-level hook that uses this
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  WorkerRequest,
  WorkerResponse,
  ConversionParams,
} from "@/lib/audio/types";
import { DEFAULT_CONVERSION_PARAMS } from "@/lib/audio/types";

/**
 * State returned by the useAudioWorker hook.
 */
export interface AudioWorkerState {
  /** Whether the worker is currently processing a job */
  isBusy: boolean;
  /** Whether the worker is ready to accept jobs */
  isReady: boolean;
  /** Current progress (0-100) or null if not processing */
  progress: number | null;
  /** Result audio buffer from last completed job */
  result: ArrayBuffer | null;
  /** Error from last operation, if any */
  error: string | null;
  /** ID of the current/last job */
  currentJobId: string | null;
}

/**
 * Actions returned by the useAudioWorker hook.
 */
export interface AudioWorkerActions {
  /**
   * Start generating audio from grayscale data.
   * Accepts Float32Array (0-1, preferred) or Uint8Array (0-255, legacy).
   * Float32Array avoids an extra conversion in the worker.
   */
  generateAudio: (
    grayscaleData: Float32Array | Uint8Array,
    width: number,
    height: number,
    params?: Partial<ConversionParams>,
  ) => string;
  /** Cancel the current job */
  cancelJob: () => void;
  /** Clear the result and error state */
  reset: () => void;
}

/**
 * Generate a unique job ID.
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Hook for managing audio generation in a Web Worker.
 * Handles worker lifecycle, message passing, and state management.
 */
export function useAudioWorker(): [AudioWorkerState, AudioWorkerActions] {
  const workerRef = useRef<Worker | null>(null);
  const currentJobIdRef = useRef<string | null>(null);

  const [state, setState] = useState<AudioWorkerState>({
    isBusy: false,
    isReady: false,
    progress: null,
    result: null,
    error: null,
    currentJobId: null,
  });

  // Initialize worker on mount
  useEffect(() => {
    // Create worker using the new URL pattern for proper bundling
    const worker = new Worker(
      new URL("../workers/audioWorker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current = worker;

    // Handle messages from worker
    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;

      switch (message.type) {
        case "ready":
          setState((prev) => ({ ...prev, isReady: true }));
          break;

        case "progress":
          // Only update progress for the current job
          if (message.payload.jobId === currentJobIdRef.current) {
            setState((prev) => ({
              ...prev,
              progress: message.payload.progress,
            }));
          }
          break;

        case "result":
          // Only accept results for the current job
          if (message.payload.jobId === currentJobIdRef.current) {
            setState((prev) => ({
              ...prev,
              isBusy: false,
              progress: 100,
              result: message.payload.audioBuffer,
              error: null,
            }));
          }
          break;

        case "error":
          // Only report errors for the current job (or global errors)
          if (
            !message.payload.jobId ||
            message.payload.jobId === currentJobIdRef.current
          ) {
            setState((prev) => ({
              ...prev,
              isBusy: false,
              progress: null,
              error: message.payload.message,
            }));
          }
          break;
      }
    };

    // Handle worker errors
    const handleError = (event: ErrorEvent) => {
      setState((prev) => ({
        ...prev,
        isBusy: false,
        isReady: false,
        progress: null,
        error: `Worker error: ${event.message}`,
      }));
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);

    // Cleanup on unmount
    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const generateAudio = useCallback(
    (
      grayscaleData: Float32Array | Uint8Array,
      width: number,
      height: number,
      params?: Partial<ConversionParams>,
    ): string => {
      const worker = workerRef.current;
      if (!worker) {
        throw new Error("Worker not initialized");
      }

      const jobId = generateJobId();
      currentJobIdRef.current = jobId;

      // Merge params with defaults
      const fullParams: ConversionParams = {
        ...DEFAULT_CONVERSION_PARAMS,
        ...params,
      };

      // Update state to busy
      setState((prev) => ({
        ...prev,
        isBusy: true,
        progress: 0,
        result: null,
        error: null,
        currentJobId: jobId,
      }));

      // Send request to worker with full ConversionParams
      const request: WorkerRequest = {
        type: "generate",
        payload: {
          jobId,
          grayscaleData,
          width,
          height,
          params: fullParams,
        },
      };

      // Transfer the ArrayBuffer to the worker to avoid copying
      // This gives ownership of the buffer to the worker
      worker.postMessage(request, [grayscaleData.buffer]);

      return jobId;
    },
    [],
  );

  const cancelJob = useCallback(() => {
    const worker = workerRef.current;
    const jobId = currentJobIdRef.current;

    if (worker && jobId) {
      const request: WorkerRequest = {
        type: "cancel",
        payload: { jobId },
      };
      worker.postMessage(request);
    }
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      progress: null,
      result: null,
      error: null,
    }));
  }, []);

  return [state, { generateAudio, cancelJob, reset }];
}
