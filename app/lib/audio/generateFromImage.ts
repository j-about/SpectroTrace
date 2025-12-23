/**
 * @fileoverview Image-to-audio conversion engine for SpectroTrace.
 *
 * This module implements the core additive synthesis algorithm that converts
 * grayscale spectrogram images into audio. When the generated audio is viewed
 * as a spectrogram, it reveals the original input image.
 *
 * **How It Works:**
 * The algorithm treats the image as a time-frequency representation:
 * - **X-axis (columns)**: Time progression (left to right)
 * - **Y-axis (rows)**: Frequency bins (high frequencies at top, low at bottom)
 * - **Brightness**: Amplitude of each frequency component
 *
 * For each time slice (column), the algorithm:
 * 1. Extracts brightness values for all frequency bins (rows)
 * 2. Maps brightness to amplitude using the configured curve
 * 3. Generates sine waves at each frequency with the calculated amplitude
 * 4. Sums all sine waves to produce the audio sample
 *
 * **Additive Synthesis:**
 * This is a form of additive synthesis where the output signal is the sum
 * of multiple sinusoids: `output(t) = Σ amplitude[f] × sin(2π × f × t)`
 *
 * **Performance Optimizations:**
 * - Phase increments are precomputed for each frequency
 * - Near-zero amplitudes are skipped to reduce computation
 * - Large images are automatically subsampled
 * - Runs in a Web Worker to avoid blocking the UI thread
 *
 * @module lib/audio/generateFromImage
 * @see {@link module:workers/audioWorker} - Runs this algorithm in background
 * @see {@link module:lib/audio/types} - ConversionParams configuration
 * @see {@link https://en.wikipedia.org/wiki/Additive_synthesis} - Synthesis theory
 */

import type {
  FrequencyScale,
  BrightnessCurve,
  ConversionParams,
} from "./types";
import { DEFAULT_CONVERSION_PARAMS } from "./types";

// Re-export types for convenience
export type { FrequencyScale, BrightnessCurve };

// =============================================================================
// Types and Configuration
// =============================================================================

/**
 * Configuration for basic-mode image-to-audio synthesis.
 * Uses the internal format with smoothing as a 0-1 factor.
 */
export interface BasicModeConfig {
  /** Duration of the output audio in seconds */
  duration: number;
  /** Minimum frequency in Hz (bottom of spectrogram) */
  minFreq: number;
  /** Maximum frequency in Hz (top of spectrogram) */
  maxFreq: number;
  /** Sample rate in Hz */
  sampleRate: number;
  /** Frequency scale for row-to-frequency mapping */
  frequencyScale: FrequencyScale;
  /** Brightness curve for intensity-to-amplitude mapping */
  brightnessCurve: BrightnessCurve;
  /** Whether to invert the image (bright becomes quiet) */
  invertImage: boolean;
  /** Temporal smoothing factor (0-1, where 0 is no smoothing) */
  smoothing: number;
}

/**
 * Default configuration for Basic Mode.
 * These values are optimized for general spectrogram conversion.
 */
export const BASIC_MODE_DEFAULTS: BasicModeConfig = {
  duration: DEFAULT_CONVERSION_PARAMS.duration,
  minFreq: DEFAULT_CONVERSION_PARAMS.minFreq,
  maxFreq: DEFAULT_CONVERSION_PARAMS.maxFreq,
  sampleRate: DEFAULT_CONVERSION_PARAMS.sampleRate,
  frequencyScale: DEFAULT_CONVERSION_PARAMS.frequencyScale,
  brightnessCurve: DEFAULT_CONVERSION_PARAMS.brightnessCurve,
  invertImage: DEFAULT_CONVERSION_PARAMS.invertImage,
  smoothing: DEFAULT_CONVERSION_PARAMS.smoothing / 100, // Convert percentage to 0-1
};

/**
 * Convert ConversionParams (UI format with smoothing 0-100) to BasicModeConfig (internal format with smoothing 0-1).
 */
export function toBasicModeConfig(params: ConversionParams): BasicModeConfig {
  return {
    duration: params.duration,
    minFreq: params.minFreq,
    maxFreq: params.maxFreq,
    sampleRate: params.sampleRate,
    frequencyScale: params.frequencyScale,
    brightnessCurve: params.brightnessCurve,
    invertImage: params.invertImage,
    smoothing: params.smoothing / 100, // Convert percentage to 0-1
  };
}

/**
 * Input data for audio generation.
 * Grayscale values should be normalized to [0, 1] range.
 */
export interface AudioGenerationInput {
  /** Grayscale pixel data in row-major order (Float32Array with values 0-1) */
  data: Float32Array;
  /** Width of the image in pixels */
  width: number;
  /** Height of the image in pixels */
  height: number;
}

/**
 * Progress callback type for reporting generation progress.
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Cancellation check callback type.
 * Returns true if generation should be cancelled.
 */
export type CancellationCheck = () => boolean;

/**
 * Options for audio generation including callbacks.
 */
export interface GenerationOptions {
  /** Callback for progress updates (0-100) */
  onProgress?: ProgressCallback;
  /** Callback to check if generation should be cancelled */
  isCancelled?: CancellationCheck;
}

// =============================================================================
// Frequency Mapping
// =============================================================================

/**
 * Compute frequencies for each image row using logarithmic scaling.
 *
 * Maps row indices to log-spaced frequency values between minFreq and maxFreq.
 * Row 0 (top of image) maps to maxFreq, row height-1 (bottom) maps to minFreq.
 * This follows the convention that higher frequencies appear at the top.
 *
 * Formula: f(y) = minFreq * (maxFreq / minFreq)^(1 - y / (height - 1))
 *
 * @param height - Number of rows (frequency bins)
 * @param minFreq - Minimum frequency in Hz
 * @param maxFreq - Maximum frequency in Hz
 * @returns Float32Array of frequencies for each row
 */
export function computeRowFrequenciesLog(
  height: number,
  minFreq: number,
  maxFreq: number,
): Float32Array {
  if (height <= 0) {
    return new Float32Array(0);
  }

  if (height === 1) {
    // Single row gets the geometric mean of min and max
    return new Float32Array([Math.sqrt(minFreq * maxFreq)]);
  }

  const frequencies = new Float32Array(height);
  const ratio = maxFreq / minFreq;

  for (let y = 0; y < height; y++) {
    // t=0 at row 0 (top) gives maxFreq, t=1 at row height-1 (bottom) gives minFreq
    const t = 1 - y / (height - 1);
    frequencies[y] = minFreq * Math.pow(ratio, t);
  }

  return frequencies;
}

/**
 * Compute frequencies for each image row using linear scaling.
 *
 * Maps row indices to linearly-spaced frequency values between minFreq and maxFreq.
 * Row 0 (top of image) maps to maxFreq, row height-1 (bottom) maps to minFreq.
 *
 * @param height - Number of rows (frequency bins)
 * @param minFreq - Minimum frequency in Hz
 * @param maxFreq - Maximum frequency in Hz
 * @returns Float32Array of frequencies for each row
 */
export function computeRowFrequenciesLinear(
  height: number,
  minFreq: number,
  maxFreq: number,
): Float32Array {
  if (height <= 0) {
    return new Float32Array(0);
  }

  if (height === 1) {
    return new Float32Array([(minFreq + maxFreq) / 2]);
  }

  const frequencies = new Float32Array(height);
  const range = maxFreq - minFreq;

  for (let y = 0; y < height; y++) {
    // Linear interpolation: top row (y=0) = maxFreq, bottom row = minFreq
    const t = y / (height - 1);
    frequencies[y] = maxFreq - t * range;
  }

  return frequencies;
}

/**
 * Compute row frequencies based on the specified scale type.
 *
 * @param height - Number of rows (frequency bins)
 * @param minFreq - Minimum frequency in Hz
 * @param maxFreq - Maximum frequency in Hz
 * @param scale - Frequency scale type
 * @returns Float32Array of frequencies for each row
 */
export function computeRowFrequencies(
  height: number,
  minFreq: number,
  maxFreq: number,
  scale: FrequencyScale,
): Float32Array {
  return scale === "logarithmic"
    ? computeRowFrequenciesLog(height, minFreq, maxFreq)
    : computeRowFrequenciesLinear(height, minFreq, maxFreq);
}

// =============================================================================
// Brightness/Amplitude Mapping
// =============================================================================

/**
 * Apply brightness curve to convert pixel intensity to amplitude.
 *
 * @param value - Input brightness value (0-1)
 * @param curve - Brightness curve type
 * @param invert - Whether to invert the value
 * @returns Amplitude value (0-1)
 */
export function applyBrightnessCurve(
  value: number,
  curve: BrightnessCurve,
  invert: boolean,
): number {
  // Apply inversion first if needed
  const v = invert ? 1 - value : value;

  switch (curve) {
    case "linear":
      return v;
    case "exponential":
      // Quadratic curve for more dramatic contrast
      return v * v;
    case "logarithmic":
      // Logarithmic curve for more gradual rolloff
      // Using log(1 + x * 9) / log(10) to map [0,1] to [0,1]
      return Math.log(1 + v * 9) / Math.log(10);
    default:
      return v;
  }
}

// =============================================================================
// Temporal Smoothing
// =============================================================================

/**
 * Apply temporal smoothing to column amplitudes.
 * Uses linear interpolation between current and previous column values.
 *
 * @param current - Current column amplitudes
 * @param previous - Previous column amplitudes (modified in place to become new "previous")
 * @param factor - Smoothing factor (0 = no smoothing, 1 = full smoothing)
 */
export function applyTemporalSmoothing(
  current: Float32Array,
  previous: Float32Array,
  factor: number,
): void {
  if (factor <= 0) return;

  const blend = Math.min(1, Math.max(0, factor));

  for (let i = 0; i < current.length; i++) {
    // Lerp: current = current * (1 - blend) + previous * blend
    const smoothed = current[i] * (1 - blend) + previous[i] * blend;
    previous[i] = current[i]; // Store unsmoothed for next iteration
    current[i] = smoothed;
  }
}

// =============================================================================
// Subsampling for Large Images
// =============================================================================

/**
 * Threshold for applying automatic subsampling (pixels).
 */
const SUBSAMPLE_THRESHOLD = 2000 * 2000;

/**
 * Maximum target pixels after subsampling for very large images.
 */
const MAX_TARGET_PIXELS = 2000 * 2000;

/**
 * Minimum amplitude threshold for including a frequency bin in synthesis.
 * Values below this are skipped for performance.
 */
const MIN_AMPLITUDE_THRESHOLD = 0.001;

/**
 * Calculate subsampling factors for large images.
 *
 * @param width - Image width
 * @param height - Image height
 * @returns Object with stepX and stepY subsampling factors
 */
function calculateSubsamplingFactors(
  width: number,
  height: number,
): { stepX: number; stepY: number } {
  const totalPixels = width * height;

  if (totalPixels <= SUBSAMPLE_THRESHOLD) {
    return { stepX: 1, stepY: 1 };
  }

  // Calculate factor needed to reduce to target
  const factor = Math.sqrt(totalPixels / MAX_TARGET_PIXELS);
  const step = Math.ceil(factor);

  return { stepX: step, stepY: step };
}

// =============================================================================
// PCM Normalization
// =============================================================================

/**
 * Safety margin for normalization to avoid clipping.
 */
const NORMALIZATION_HEADROOM = 0.9;

/**
 * Normalize PCM audio buffer to prevent clipping.
 * Scales all samples so the peak amplitude is at NORMALIZATION_HEADROOM.
 *
 * @param buffer - Audio buffer to normalize (modified in place)
 */
export function normalizePCM(buffer: Float32Array): void {
  if (buffer.length === 0) return;

  // Find peak amplitude
  let peak = 0;
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i]);
    if (abs > peak) peak = abs;
  }

  // Handle silent buffer
  if (peak === 0) return;

  // Calculate and apply normalization gain
  const gain = NORMALIZATION_HEADROOM / peak;

  // Only normalize if we need to scale down (peak > headroom)
  // or if peak is very small (amplify quiet signals)
  if (peak > NORMALIZATION_HEADROOM || peak < 0.1) {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] *= gain;
    }
  }
}

// =============================================================================
// Main Synthesis Function
// =============================================================================

/**
 * Progress reporting interval (columns processed between progress updates).
 */
const PROGRESS_INTERVAL = 10;

/**
 * Generate PCM audio from grayscale image data using additive synthesis.
 *
 * This is the main entry point for the audio generation algorithm.
 * It processes the image column by column (time axis) and sums sinusoids
 * at frequencies determined by the row positions (frequency axis).
 *
 * @param input - Image data with width, height, and grayscale values
 * @param config - Synthesis configuration (merged with defaults)
 * @param options - Generation options (progress callback, cancellation check)
 * @returns Float32Array of mono PCM samples
 * @throws Error if cancelled or if input is invalid
 */
export function generatePCM(
  input: AudioGenerationInput,
  config: Partial<BasicModeConfig> = {},
  options: GenerationOptions = {},
): Float32Array {
  // Merge config with defaults
  const cfg: BasicModeConfig = { ...BASIC_MODE_DEFAULTS, ...config };
  const { onProgress, isCancelled } = options;

  const { data, width, height } = input;

  // Validate input
  if (data.length !== width * height) {
    throw new Error(
      `Data size mismatch: expected ${width * height}, got ${data.length}`,
    );
  }

  if (width <= 0 || height <= 0) {
    throw new Error("Image dimensions must be positive");
  }

  const {
    duration,
    minFreq,
    maxFreq,
    sampleRate,
    frequencyScale,
    brightnessCurve,
    invertImage,
    smoothing,
  } = cfg;

  // Calculate total samples
  const totalSamples = Math.floor(sampleRate * duration);

  // Calculate subsampling factors for large images
  const { stepX, stepY } = calculateSubsamplingFactors(width, height);
  const effectiveWidth = Math.ceil(width / stepX);
  const effectiveHeight = Math.ceil(height / stepY);

  // Precompute frequencies for each row
  const rowFrequencies = computeRowFrequencies(
    effectiveHeight,
    minFreq,
    maxFreq,
    frequencyScale,
  );

  // Precompute phase increments for each frequency (2 * PI * f / sampleRate)
  const phaseIncrements = new Float32Array(effectiveHeight);
  for (let y = 0; y < effectiveHeight; y++) {
    phaseIncrements[y] = (2 * Math.PI * rowFrequencies[y]) / sampleRate;
  }

  // Initialize phase array (tracks phase for each frequency bin)
  const phases = new Float32Array(effectiveHeight);

  // Initialize output buffer
  const output = new Float32Array(totalSamples);

  // Amplitude arrays for smoothing
  const currentAmplitudes = new Float32Array(effectiveHeight);
  const previousAmplitudes = new Float32Array(effectiveHeight);

  // Calculate samples per column (may be fractional)
  const samplesPerColumn = totalSamples / effectiveWidth;

  // Process each column (time slice)
  for (let x = 0; x < effectiveWidth; x++) {
    // Check for cancellation
    if (isCancelled && isCancelled()) {
      throw new Error("CANCELLED");
    }

    // Report progress periodically
    if (onProgress && x % PROGRESS_INTERVAL === 0) {
      onProgress((x / effectiveWidth) * 100);
    }

    // Calculate source column index with subsampling
    const srcX = x * stepX;

    // Extract amplitudes for this column
    for (let y = 0; y < effectiveHeight; y++) {
      const srcY = y * stepY;
      const pixelIndex = srcY * width + srcX;
      const brightness = data[pixelIndex];

      // Apply brightness curve and inversion
      currentAmplitudes[y] = applyBrightnessCurve(
        brightness,
        brightnessCurve,
        invertImage,
      );
    }

    // Apply temporal smoothing (skip first column)
    if (x > 0 && smoothing > 0) {
      applyTemporalSmoothing(currentAmplitudes, previousAmplitudes, smoothing);
    } else {
      // Initialize previous amplitudes for first column
      previousAmplitudes.set(currentAmplitudes);
    }

    // Calculate start and end sample indices for this column
    const startSample = Math.floor(x * samplesPerColumn);
    const endSample = Math.min(
      Math.floor((x + 1) * samplesPerColumn),
      totalSamples,
    );

    // Generate samples for this time slice using additive synthesis
    for (let s = startSample; s < endSample; s++) {
      let sampleValue = 0;

      // Sum sine waves for all frequency bins
      for (let y = 0; y < effectiveHeight; y++) {
        const amplitude = currentAmplitudes[y];

        // Skip near-zero amplitudes for performance
        if (amplitude > MIN_AMPLITUDE_THRESHOLD) {
          sampleValue += amplitude * Math.sin(phases[y]);
        }

        // Update phase (must always update to maintain continuity)
        phases[y] += phaseIncrements[y];

        // Wrap phase to prevent overflow (keep in [0, 2π])
        if (phases[y] > 2 * Math.PI) {
          phases[y] -= 2 * Math.PI;
        }
      }

      output[s] = sampleValue;
    }
  }

  // Normalize to prevent clipping
  normalizePCM(output);

  // Final progress update
  if (onProgress) {
    onProgress(100);
  }

  return output;
}

/**
 * Merge partial configuration with defaults.
 * Utility function for creating complete configs from partial options.
 *
 * @param partial - Partial configuration options
 * @returns Complete configuration with defaults applied
 */
export function createBasicModeConfig(
  partial: Partial<BasicModeConfig> = {},
): BasicModeConfig {
  return { ...BASIC_MODE_DEFAULTS, ...partial };
}
