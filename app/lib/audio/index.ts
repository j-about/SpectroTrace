/**
 * @fileoverview Audio generation module barrel exports.
 *
 * This module serves as the public API for SpectroTrace's audio generation system.
 * It re-exports all types, functions, and constants from the audio submodules.
 *
 * **Core Functionality:**
 * - **types.ts**: Parameter definitions, validation, and Worker message contracts
 * - **generateFromImage.ts**: Additive synthesis algorithm (image → PCM audio)
 * - **wavEncoder.ts**: WAV file encoding (PCM → WAV binary format)
 *
 * **Usage:**
 * ```typescript
 * import {
 *   ConversionParams,
 *   DEFAULT_CONVERSION_PARAMS,
 *   generatePCM,
 *   encodeWavStereo,
 * } from "@/lib/audio";
 * ```
 *
 * @module lib/audio
 * @see {@link module:lib/audio/types} - Type definitions and validation
 * @see {@link module:lib/audio/generateFromImage} - Audio synthesis engine
 * @see {@link module:lib/audio/wavEncoder} - WAV file encoding
 */

// =============================================================================
// Type definitions and validation functions
// =============================================================================
export * from "./types";

// =============================================================================
// Audio synthesis engine
// =============================================================================
export * from "./generateFromImage";

// =============================================================================
// WAV file encoding utilities
// =============================================================================
export * from "./wavEncoder";
