/**
 * @fileoverview Type definitions for the ExportButton component.
 *
 * This module defines the props for the audio download/export functionality.
 * The ExportButton allows users to download their generated audio as a WAV file.
 *
 * @module components/ExportButton/types
 * @see {@link module:components/ExportButton} - Main export button component
 * @see {@link module:lib/audio/wavEncoder} - Generates WAV files for download
 */

/**
 * Props for the ExportButton component.
 *
 * The ExportButton renders a download button that saves the generated
 * WAV audio to the user's device. The button is disabled when no audio
 * is available or when explicitly disabled via props.
 */
export interface ExportButtonProps {
  /** WAV audio blob to download. Button is disabled when null. */
  wavBlob: Blob | null;
  /** Timestamp when the audio was generated. Used for filename. */
  generatedAt?: Date;
  /** Whether the button should be disabled regardless of wavBlob state. */
  disabled?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Callback fired when download completes successfully. */
  onDownloadComplete?: () => void;
}
