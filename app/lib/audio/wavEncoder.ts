/**
 * @fileoverview WAV encoding utilities for SpectroTrace.
 *
 * This module implements 16-bit stereo PCM WAV file generation with proper
 * RIFF/WAVE headers. It converts floating-point PCM audio data into a binary
 * WAV file format that can be played in any audio player.
 *
 * **WAV Format Overview:**
 * The WAV file format uses the RIFF (Resource Interchange File Format) container:
 * ```
 * RIFF Header (12 bytes):  "RIFF" + fileSize + "WAVE"
 * fmt Chunk (24 bytes):    Audio format metadata
 * data Chunk (variable):   "data" + dataSize + PCM samples
 * ```
 *
 * **Stereo Conversion:**
 * The encoder takes mono audio and duplicates it to both channels (L/R)
 * for stereo output. This ensures compatibility with all audio players
 * while keeping the file size reasonable.
 *
 * **Sample Format:**
 * - Input: Float32Array with values in [-1.0, 1.0] range
 * - Output: 16-bit signed integer PCM in little-endian byte order
 *
 * @module lib/audio/wavEncoder
 * @see {@link module:workers/audioWorker} - Uses encodeWavStereo after synthesis
 * @see {@link module:components/ExportButton} - Downloads generated WAV files
 * @see {@link https://www.mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html} - WAV format spec
 */

// =============================================================================
// Constants
// =============================================================================

/**
 * WAV file header size in bytes.
 * 44 bytes for standard PCM WAV (RIFF + fmt + data headers).
 */
const WAV_HEADER_SIZE = 44;

/**
 * Number of channels for stereo output.
 */
const NUM_CHANNELS = 2;

/**
 * Bits per sample for 16-bit PCM.
 */
const BITS_PER_SAMPLE = 16;

/**
 * Bytes per sample (16-bit = 2 bytes).
 */
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Write a string to a DataView at the specified offset.
 * Used for writing chunk identifiers like "RIFF", "WAVE", "fmt ", "data".
 *
 * @param view - DataView to write to
 * @param offset - Byte offset to start writing
 * @param str - ASCII string to write
 */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Clamp a float sample to the valid range [-1, 1].
 *
 * @param sample - Input sample value
 * @returns Clamped sample value
 */
function clampSample(sample: number): number {
  return Math.max(-1, Math.min(1, sample));
}

/**
 * Convert a float sample [-1, 1] to a 16-bit signed integer.
 * Uses proper scaling to maximize dynamic range.
 *
 * @param sample - Float sample in range [-1, 1]
 * @returns 16-bit signed integer
 */
function floatToInt16(sample: number): number {
  const clamped = clampSample(sample);
  // Scale: negative values to [-32768, 0], positive to [0, 32767]
  return clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
}

// =============================================================================
// Main Encoder Function
// =============================================================================

/**
 * Encode mono Float32Array PCM data into a stereo 16-bit PCM WAV file.
 *
 * This function takes mono audio data and produces a stereo WAV file by
 * duplicating the mono channel into both left and right channels.
 *
 * WAV file structure:
 * - RIFF header (12 bytes): "RIFF", file size, "WAVE"
 * - fmt chunk (24 bytes): format info (PCM, channels, sample rate, etc.)
 * - data chunk (8 bytes + data): "data", data size, PCM samples
 *
 * @param monoData - Mono PCM samples as Float32Array (values in range [-1, 1])
 * @param sampleRate - Sample rate in Hz (e.g., 44100, 48000)
 * @returns ArrayBuffer containing the complete WAV file
 *
 * @example
 * ```ts
 * const pcmData = new Float32Array([0.1, -0.2, 0.3, ...]);
 * const wavBuffer = encodeWavStereo(pcmData, 44100);
 * const blob = new Blob([wavBuffer], { type: 'audio/wav' });
 * ```
 */
export function encodeWavStereo(
  monoData: Float32Array,
  sampleRate: number,
): ArrayBuffer {
  const numSamples = monoData.length;
  const blockAlign = NUM_CHANNELS * BYTES_PER_SAMPLE;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * NUM_CHANNELS * BYTES_PER_SAMPLE;
  const fileSize = WAV_HEADER_SIZE + dataSize;

  // Allocate buffer for the entire WAV file
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // =========================================================================
  // RIFF Header (12 bytes)
  // =========================================================================

  // ChunkID: "RIFF" (4 bytes)
  writeString(view, 0, "RIFF");

  // ChunkSize: file size - 8 (excludes "RIFF" and this field) (4 bytes, little-endian)
  view.setUint32(4, fileSize - 8, true);

  // Format: "WAVE" (4 bytes)
  writeString(view, 8, "WAVE");

  // =========================================================================
  // fmt Subchunk (24 bytes total: 8 byte header + 16 byte content)
  // =========================================================================

  // Subchunk1ID: "fmt " (4 bytes) - note the trailing space
  writeString(view, 12, "fmt ");

  // Subchunk1Size: 16 for PCM (4 bytes, little-endian)
  view.setUint32(16, 16, true);

  // AudioFormat: 1 for PCM (2 bytes, little-endian)
  view.setUint16(20, 1, true);

  // NumChannels: 2 for stereo (2 bytes, little-endian)
  view.setUint16(22, NUM_CHANNELS, true);

  // SampleRate: samples per second (4 bytes, little-endian)
  view.setUint32(24, sampleRate, true);

  // ByteRate: sampleRate * numChannels * bytesPerSample (4 bytes, little-endian)
  view.setUint32(28, byteRate, true);

  // BlockAlign: numChannels * bytesPerSample (2 bytes, little-endian)
  view.setUint16(32, blockAlign, true);

  // BitsPerSample: 16 (2 bytes, little-endian)
  view.setUint16(34, BITS_PER_SAMPLE, true);

  // =========================================================================
  // data Subchunk (8 byte header + PCM data)
  // =========================================================================

  // Subchunk2ID: "data" (4 bytes)
  writeString(view, 36, "data");

  // Subchunk2Size: numSamples * numChannels * bytesPerSample (4 bytes, little-endian)
  view.setUint32(40, dataSize, true);

  // =========================================================================
  // PCM Sample Data (starting at byte 44)
  // =========================================================================

  // Write samples: duplicate each mono sample to both left and right channels
  let offset = WAV_HEADER_SIZE;
  for (let i = 0; i < numSamples; i++) {
    const int16Sample = floatToInt16(monoData[i]);

    // Left channel (2 bytes, little-endian)
    view.setInt16(offset, int16Sample, true);
    offset += BYTES_PER_SAMPLE;

    // Right channel (2 bytes, little-endian) - same as left (duplicated)
    view.setInt16(offset, int16Sample, true);
    offset += BYTES_PER_SAMPLE;
  }

  return buffer;
}

// =============================================================================
// Filename Generation
// =============================================================================

/**
 * Generate a filesystem-safe filename for WAV export.
 * Format: SpectroTrace_YYYYMMDD_HHmmss.wav
 *
 * @param date - Date to use for timestamp (defaults to current date)
 * @returns Filename string
 *
 * @example
 * ```ts
 * generateWavFilename(new Date('2024-03-15T14:30:45'))
 * // Returns: "SpectroTrace_20240315_143045.wav"
 * ```
 */
export function generateWavFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `SpectroTrace_${year}${month}${day}_${hours}${minutes}${seconds}.wav`;
}
