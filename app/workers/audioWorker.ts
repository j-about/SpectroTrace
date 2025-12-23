/// <reference lib="webworker" />

/**
 * @fileoverview Web Worker for audio generation from spectrogram data.
 *
 * This worker offloads heavy audio synthesis and WAV encoding from the main UI thread,
 * preventing the browser from becoming unresponsive during audio generation. The worker
 * implements a job-based system with cancellation support and progress reporting.
 *
 * **Message Protocol:**
 * The worker communicates with the main thread using typed messages:
 *
 * **Incoming (from main thread):**
 * - `generate`: Start audio generation with grayscale image data and params
 * - `cancel`: Cancel an in-progress generation job
 *
 * **Outgoing (to main thread):**
 * - `ready`: Worker is initialized and ready to accept jobs
 * - `progress`: Generation progress update (0-100%)
 * - `result`: Generation complete with WAV audio buffer
 * - `error`: Generation failed with error details
 *
 * **Performance:**
 * - Uses Transferable objects for zero-copy ArrayBuffer transfer
 * - Scales progress 0-90% for synthesis, 90-100% for WAV encoding
 * - Supports cancellation at any point during generation
 *
 * @module workers/audioWorker
 * @see {@link module:lib/audio/types} - WorkerRequest/WorkerResponse message types
 * @see {@link module:lib/audio/generateFromImage} - Core synthesis algorithm
 * @see {@link module:hooks/useAudioWorker} - Main thread hook for worker communication
 */

import type {
  WorkerRequest,
  WorkerResponse,
  GenerateAudioRequest,
} from "@/lib/audio/types";
import {
  generatePCM,
  toBasicModeConfig,
  type AudioGenerationInput,
} from "@/lib/audio/generateFromImage";
import { encodeWavStereo } from "@/lib/audio/wavEncoder";

// =============================================================================
// Job State Management
// =============================================================================

/**
 * ID of the currently active generation job.
 * Only one job can be active at a time. Set to null when no job is running.
 */
let currentJobId: string | null = null;

/**
 * Cancellation flag for the current job.
 * Checked periodically during generation to allow early termination.
 * Reset to false at the start of each new job.
 */
let isCancelled = false;

/**
 * Post a typed message to the main thread.
 */
function postTypedMessage(message: WorkerResponse, transfer?: Transferable[]) {
  if (transfer) {
    self.postMessage(message, transfer);
  } else {
    self.postMessage(message);
  }
}

/**
 * Report progress to main thread.
 */
function reportProgress(jobId: string, progress: number) {
  postTypedMessage({
    type: "progress",
    payload: { jobId, progress: Math.round(progress) },
  });
}

/**
 * Report error to main thread.
 */
function reportError(
  message: string,
  code: "CANCELLED" | "GENERATION_FAILED" | "INVALID_INPUT" | "UNKNOWN",
  jobId?: string,
) {
  postTypedMessage({
    type: "error",
    payload: { jobId, message, code },
  });
}

/**
 * Convert grayscale data to Float32Array if needed.
 * Handles both Float32Array (0-1, no conversion) and Uint8Array (0-255, needs conversion).
 */
function toFloat32Grayscale(data: Float32Array | Uint8Array): Float32Array {
  // Already Float32Array - use directly
  if (data instanceof Float32Array) {
    return data;
  }

  // Convert Uint8Array (0-255) to Float32Array (0-1)
  const floatData = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    floatData[i] = data[i] / 255;
  }
  return floatData;
}

/**
 * Generate audio from grayscale image data using the generatePCM engine.
 * Accepts both Float32Array (preferred, no conversion) and Uint8Array (legacy).
 */
function generateAudio(request: GenerateAudioRequest["payload"]): ArrayBuffer {
  const { grayscaleData, width, height, params, jobId } = request;

  // Convert to Float32Array if needed (no-op for Float32Array input)
  const floatData = toFloat32Grayscale(grayscaleData);

  const input: AudioGenerationInput = {
    data: floatData,
    width,
    height,
  };

  // Convert ConversionParams to BasicModeConfig (handles smoothing % to 0-1 conversion)
  const config = toBasicModeConfig(params);

  // Generate PCM using the engine with full configuration
  const audioData = generatePCM(input, config, {
    onProgress: (progress) => {
      // Scale progress to 0-90% (reserve 10% for WAV encoding)
      reportProgress(jobId, progress * 0.9);
    },
    isCancelled: () => isCancelled && currentJobId === jobId,
  });

  reportProgress(jobId, 95);

  // Encode to stereo WAV format (mono duplicated to both channels)
  const wavBuffer = encodeWavStereo(audioData, params.sampleRate);

  reportProgress(jobId, 100);

  return wavBuffer;
}

// =============================================================================
// Message Handler
// =============================================================================

/**
 * Handle incoming messages from the main thread.
 *
 * This is the main entry point for worker communication. It processes
 * typed messages and dispatches to the appropriate handler.
 *
 * @param event - MessageEvent containing the typed WorkerRequest
 */
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  // Step 1: Extract the typed message from the event
  const message = event.data;

  // Step 2: Route to appropriate handler based on message type
  switch (message.type) {
    case "generate": {
      // Step 2a: Start a new generation job
      const { jobId } = message.payload;

      // Initialize job state - mark this job as active and reset cancellation flag
      currentJobId = jobId;
      isCancelled = false;

      try {
        // Step 3: Run the audio generation pipeline
        // This is the CPU-intensive work that would block the UI if run on main thread
        const audioBuffer = generateAudio(message.payload);

        // Step 4: Send the result back to main thread
        // Use transferable to avoid copying the ArrayBuffer (zero-copy transfer)
        // After this call, audioBuffer is no longer accessible in this worker
        postTypedMessage(
          {
            type: "result",
            payload: { jobId, audioBuffer },
          },
          [audioBuffer],
        );
      } catch (error) {
        // Step 5: Handle errors during generation
        if (error instanceof Error && error.message === "CANCELLED") {
          // User-initiated cancellation is not an error, but we still report it
          reportError("Generation cancelled", "CANCELLED", jobId);
        } else {
          // Unexpected error during generation
          reportError(
            error instanceof Error ? error.message : "Unknown error",
            "GENERATION_FAILED",
            jobId,
          );
        }
      } finally {
        // Step 6: Clean up job state regardless of success or failure
        currentJobId = null;
      }
      break;
    }

    case "cancel": {
      // Step 2b: Handle cancellation request
      const { jobId } = message.payload;

      // Only cancel if the requested job is the one currently running
      // This prevents race conditions where an old cancel arrives for a completed job
      if (currentJobId === jobId) {
        isCancelled = true;
      }
      break;
    }
  }
};

// =============================================================================
// Worker Initialization
// =============================================================================

// Signal to main thread that worker is ready to accept jobs
// This is sent immediately after the worker script loads
postTypedMessage({ type: "ready" });
