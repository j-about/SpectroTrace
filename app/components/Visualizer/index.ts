/**
 * @fileoverview Visualizer component exports.
 *
 * Re-exports audio visualization components for the SpectroTrace application:
 * - Waveform: WaveSurfer.js-based audio waveform with playback controls
 * - Spectrogram: Dual-panel frequency analysis visualization
 *
 * @module components/Visualizer
 */

export { Waveform, type WaveformProps } from "./Waveform";
export {
  Spectrogram,
  type SpectrogramProps,
  type ColorMapType,
} from "./Spectrogram";
