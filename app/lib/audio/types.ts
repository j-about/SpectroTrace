/**
 * @fileoverview Type definitions for audio generation and Web Worker communication.
 *
 * This module defines the core types, interfaces, and validation functions for
 * the SpectroTrace audio generation pipeline. It includes:
 *
 * - **Parameter Types**: Configuration options for image-to-audio conversion
 *   (duration, frequency range, sample rate, curves, etc.)
 * - **Validation Functions**: Runtime validation and sanitization of user input
 * - **Worker Message Types**: Type-safe message contracts for Web Worker communication
 *
 * The types here are used throughout the application to ensure type safety
 * between the UI controls, generation hooks, and the audio worker.
 *
 * @module lib/audio/types
 * @see {@link module:lib/audio/generateFromImage} - Uses ConversionParams for synthesis
 * @see {@link module:workers/audioWorker} - Implements WorkerRequest/WorkerResponse protocol
 * @see {@link module:hooks/useConversionParams} - Manages ConversionParams state in UI
 */

// =============================================================================
// Parameter Type Definitions
// =============================================================================

/**
 * Frequency scale options for mapping image rows to frequencies.
 */
export type FrequencyScale = "logarithmic" | "linear";

/**
 * Brightness curve options for mapping pixel intensity to amplitude.
 */
export type BrightnessCurve = "linear" | "exponential" | "logarithmic";

/**
 * Available sample rate options.
 */
export type SampleRate = 22050 | 44100 | 48000;

/**
 * Available sample rates as a constant array.
 */
export const SAMPLE_RATES: readonly SampleRate[] = [
  22050, 44100, 48000,
] as const;

// =============================================================================
// Parameter Ranges and Constraints
// =============================================================================

/**
 * Parameter range constraints for validation.
 */
export const PARAM_RANGES = {
  duration: { min: 1, max: 60 },
  minFreq: { min: 20, max: 2000 },
  maxFreq: { min: 500, max: 22000 },
  smoothing: { min: 0, max: 100 },
} as const;

// =============================================================================
// Conversion Parameters
// =============================================================================

/**
 * Complete parameters for image-to-audio conversion.
 * Used throughout the application for advanced mode controls.
 */
export interface ConversionParams {
  /** Duration of the output audio in seconds (1-60) */
  duration: number;
  /** Minimum frequency in Hz - bottom of spectrogram (20-2000) */
  minFreq: number;
  /** Maximum frequency in Hz - top of spectrogram (500-22000) */
  maxFreq: number;
  /** Frequency scale for row-to-frequency mapping */
  frequencyScale: FrequencyScale;
  /** Sample rate in Hz */
  sampleRate: SampleRate;
  /** Brightness curve for intensity-to-amplitude mapping */
  brightnessCurve: BrightnessCurve;
  /** Whether to invert the image (bright becomes quiet) */
  invertImage: boolean;
  /** Smoothing factor as percentage (0-100) */
  smoothing: number;
}

/**
 * Default conversion parameters.
 */
export const DEFAULT_CONVERSION_PARAMS: ConversionParams = {
  duration: 8,
  minFreq: 50,
  maxFreq: 16000,
  frequencyScale: "logarithmic",
  sampleRate: 44100,
  brightnessCurve: "linear",
  invertImage: false,
  smoothing: 15,
};

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validation error structure.
 */
export interface ValidationError {
  field: keyof ConversionParams;
  message: string;
}

/**
 * Clamp a value to a specified range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Validate that minFreq is less than maxFreq.
 * Returns an error message if invalid, null if valid.
 */
export function validateFrequencyRange(
  minFreq: number,
  maxFreq: number,
): string | null {
  if (minFreq >= maxFreq) {
    return "Minimum frequency must be less than maximum frequency";
  }
  return null;
}

/**
 * Validate a single parameter value against its constraints.
 */
export function validateParamValue(
  field: keyof ConversionParams,
  value: unknown,
): ValidationError | null {
  switch (field) {
    case "duration": {
      const num = Number(value);
      const { min, max } = PARAM_RANGES.duration;
      if (isNaN(num) || num < min || num > max) {
        return {
          field,
          message: `Duration must be between ${min} and ${max} seconds`,
        };
      }
      break;
    }
    case "minFreq": {
      const num = Number(value);
      const { min, max } = PARAM_RANGES.minFreq;
      if (isNaN(num) || num < min || num > max) {
        return {
          field,
          message: `Minimum frequency must be between ${min} and ${max} Hz`,
        };
      }
      break;
    }
    case "maxFreq": {
      const num = Number(value);
      const { min, max } = PARAM_RANGES.maxFreq;
      if (isNaN(num) || num < min || num > max) {
        return {
          field,
          message: `Maximum frequency must be between ${min} and ${max} Hz`,
        };
      }
      break;
    }
    case "smoothing": {
      const num = Number(value);
      const { min, max } = PARAM_RANGES.smoothing;
      if (isNaN(num) || num < min || num > max) {
        return {
          field,
          message: `Smoothing must be between ${min} and ${max}%`,
        };
      }
      break;
    }
    case "sampleRate": {
      if (!SAMPLE_RATES.includes(value as SampleRate)) {
        return {
          field,
          message: `Sample rate must be one of: ${SAMPLE_RATES.join(", ")} Hz`,
        };
      }
      break;
    }
    case "frequencyScale": {
      if (value !== "logarithmic" && value !== "linear") {
        return {
          field,
          message: "Frequency scale must be 'logarithmic' or 'linear'",
        };
      }
      break;
    }
    case "brightnessCurve": {
      if (
        value !== "linear" &&
        value !== "exponential" &&
        value !== "logarithmic"
      ) {
        return {
          field,
          message:
            "Brightness curve must be 'linear', 'exponential', or 'logarithmic'",
        };
      }
      break;
    }
    case "invertImage": {
      if (typeof value !== "boolean") {
        return { field, message: "Invert image must be a boolean" };
      }
      break;
    }
  }
  return null;
}

/**
 * Validate complete ConversionParams object.
 * Returns array of validation errors, empty if valid.
 */
export function validateConversionParams(
  params: ConversionParams,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate individual fields
  for (const [field, value] of Object.entries(params)) {
    const error = validateParamValue(field as keyof ConversionParams, value);
    if (error) {
      errors.push(error);
    }
  }

  // Cross-field validation: minFreq < maxFreq
  const freqError = validateFrequencyRange(params.minFreq, params.maxFreq);
  if (freqError) {
    errors.push({ field: "minFreq", message: freqError });
  }

  return errors;
}

/**
 * Check if ConversionParams are valid.
 */
export function isValidConversionParams(params: ConversionParams): boolean {
  return validateConversionParams(params).length === 0;
}

/**
 * Sanitize and clamp ConversionParams to valid ranges.
 * Returns a new valid ConversionParams object.
 */
export function sanitizeConversionParams(
  params: Partial<ConversionParams>,
): ConversionParams {
  const base = { ...DEFAULT_CONVERSION_PARAMS, ...params };

  // Clamp numeric values
  const sanitized: ConversionParams = {
    duration: clamp(
      base.duration,
      PARAM_RANGES.duration.min,
      PARAM_RANGES.duration.max,
    ),
    minFreq: clamp(
      base.minFreq,
      PARAM_RANGES.minFreq.min,
      PARAM_RANGES.minFreq.max,
    ),
    maxFreq: clamp(
      base.maxFreq,
      PARAM_RANGES.maxFreq.min,
      PARAM_RANGES.maxFreq.max,
    ),
    smoothing: clamp(
      base.smoothing,
      PARAM_RANGES.smoothing.min,
      PARAM_RANGES.smoothing.max,
    ),
    frequencyScale: base.frequencyScale === "linear" ? "linear" : "logarithmic",
    sampleRate: SAMPLE_RATES.includes(base.sampleRate as SampleRate)
      ? (base.sampleRate as SampleRate)
      : 44100,
    brightnessCurve:
      base.brightnessCurve === "exponential"
        ? "exponential"
        : base.brightnessCurve === "logarithmic"
          ? "logarithmic"
          : "linear",
    invertImage: Boolean(base.invertImage),
  };

  // Ensure minFreq < maxFreq
  if (sanitized.minFreq >= sanitized.maxFreq) {
    // Adjust maxFreq to be higher than minFreq
    sanitized.maxFreq = Math.min(
      sanitized.minFreq + 500,
      PARAM_RANGES.maxFreq.max,
    );
    // If still invalid, adjust minFreq down
    if (sanitized.minFreq >= sanitized.maxFreq) {
      sanitized.minFreq = sanitized.maxFreq - 500;
    }
  }

  return sanitized;
}

// --- Worker Message Types ---

/**
 * Request to generate audio from grayscale pixel data.
 */
export interface GenerateAudioRequest {
  type: "generate";
  payload: {
    /** Unique identifier for this generation job */
    jobId: string;
    /**
     * Grayscale pixel data.
     * - Float32Array with values 0-1 (preferred, no conversion needed)
     * - Uint8Array with values 0-255 (legacy, will be converted internally)
     */
    grayscaleData: Float32Array | Uint8Array;
    /** Width of the image in pixels */
    width: number;
    /** Height of the image in pixels */
    height: number;
    /** Audio conversion parameters (full ConversionParams) */
    params: ConversionParams;
  };
}

/**
 * Request to cancel an in-progress generation job.
 */
export interface CancelJobRequest {
  type: "cancel";
  payload: {
    /** Job ID to cancel */
    jobId: string;
  };
}

/**
 * Union of all messages the main thread can send to the worker.
 */
export type WorkerRequest = GenerateAudioRequest | CancelJobRequest;

/**
 * Progress update from worker during audio generation.
 */
export interface GenerateAudioProgress {
  type: "progress";
  payload: {
    /** Job ID this progress relates to */
    jobId: string;
    /** Progress percentage (0-100) */
    progress: number;
  };
}

/**
 * Successful result from audio generation.
 */
export interface GenerateAudioResult {
  type: "result";
  payload: {
    /** Job ID this result relates to */
    jobId: string;
    /**
     * WAV audio data as ArrayBuffer.
     * This is a transferable object - do not access after posting.
     */
    audioBuffer: ArrayBuffer;
  };
}

/**
 * Error message from worker.
 */
export interface WorkerErrorMessage {
  type: "error";
  payload: {
    /** Job ID this error relates to (if applicable) */
    jobId?: string;
    /** Error message */
    message: string;
    /** Error code for programmatic handling */
    code: "CANCELLED" | "GENERATION_FAILED" | "INVALID_INPUT" | "UNKNOWN";
  };
}

/**
 * Ready message indicating worker is initialized.
 */
export interface WorkerReadyMessage {
  type: "ready";
}

/**
 * Union of all messages the worker can send to the main thread.
 */
export type WorkerResponse =
  | GenerateAudioProgress
  | GenerateAudioResult
  | WorkerErrorMessage
  | WorkerReadyMessage;
