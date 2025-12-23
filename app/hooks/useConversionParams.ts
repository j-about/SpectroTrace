"use client";

/**
 * @fileoverview Hook for managing audio conversion parameters state.
 *
 * This hook provides reducer-based state management for the Advanced Mode
 * audio conversion parameters. It includes automatic validation and
 * sanitization to ensure parameter values are always within valid ranges.
 *
 * **State Management:**
 * Uses React's useReducer for predictable state updates:
 * - SET_PARAMS: Replace all parameters at once (e.g., from a preset)
 * - UPDATE_PARAM: Update a single parameter value
 * - RESET: Return to default parameters
 *
 * **Validation:**
 * All parameter updates are automatically:
 * 1. Sanitized (clamped to valid ranges)
 * 2. Validated (checked for cross-field constraints like minFreq < maxFreq)
 * 3. Tracked for dirty state (has the user modified defaults?)
 *
 * **Usage Pattern:**
 * ```typescript
 * const [state, actions] = useConversionParams();
 *
 * // Update a single param
 * actions.updateParam('duration', 10);
 *
 * // Check for errors
 * if (state.errors.length > 0) {
 *   console.log(state.errors);
 * }
 *
 * // Reset to defaults
 * actions.reset();
 * ```
 *
 * @module hooks/useConversionParams
 * @see {@link module:lib/audio/types} - ConversionParams type and validation functions
 * @see {@link module:components/AudioControls/AdvancedControlsPanel} - UI that uses this hook
 */

import { useCallback, useReducer } from "react";
import type { ConversionParams } from "@/lib/audio/types";
import {
  DEFAULT_CONVERSION_PARAMS,
  sanitizeConversionParams,
  validateConversionParams,
  type ValidationError,
} from "@/lib/audio/types";

/**
 * Action types for the conversion params reducer.
 */
type ConversionParamsAction =
  | { type: "SET_PARAMS"; payload: ConversionParams }
  | {
      type: "UPDATE_PARAM";
      payload: { key: keyof ConversionParams; value: unknown };
    }
  | { type: "RESET" };

/**
 * State shape for the conversion params hook.
 */
export interface ConversionParamsState {
  params: ConversionParams;
  errors: ValidationError[];
  isDirty: boolean;
}

/**
 * Reducer for managing conversion parameters state.
 */
function conversionParamsReducer(
  state: ConversionParamsState,
  action: ConversionParamsAction,
): ConversionParamsState {
  switch (action.type) {
    case "SET_PARAMS": {
      const sanitized = sanitizeConversionParams(action.payload);
      const errors = validateConversionParams(sanitized);
      return {
        params: sanitized,
        errors,
        isDirty: true,
      };
    }

    case "UPDATE_PARAM": {
      const { key, value } = action.payload;
      const newParams = { ...state.params, [key]: value };
      const sanitized = sanitizeConversionParams(newParams);
      const errors = validateConversionParams(sanitized);
      return {
        params: sanitized,
        errors,
        isDirty: true,
      };
    }

    case "RESET": {
      return {
        params: DEFAULT_CONVERSION_PARAMS,
        errors: [],
        isDirty: false,
      };
    }

    default:
      return state;
  }
}

/**
 * Initial state for conversion params.
 */
const initialState: ConversionParamsState = {
  params: DEFAULT_CONVERSION_PARAMS,
  errors: [],
  isDirty: false,
};

/**
 * Actions returned by the useConversionParams hook.
 */
export interface ConversionParamsActions {
  /** Set all parameters at once (e.g., from a preset) */
  setParams: (params: ConversionParams) => void;
  /** Update a single parameter */
  updateParam: <K extends keyof ConversionParams>(
    key: K,
    value: ConversionParams[K],
  ) => void;
  /** Reset all parameters to defaults */
  reset: () => void;
}

/**
 * Hook for managing conversion parameters state.
 * Provides validation and sanitization of parameter values.
 *
 * @param initialParams - Optional initial parameters (defaults to DEFAULT_CONVERSION_PARAMS)
 * @returns Tuple of [state, actions]
 */
export function useConversionParams(
  initialParams?: Partial<ConversionParams>,
): [ConversionParamsState, ConversionParamsActions] {
  const [state, dispatch] = useReducer(
    conversionParamsReducer,
    initialParams
      ? {
          params: sanitizeConversionParams({
            ...DEFAULT_CONVERSION_PARAMS,
            ...initialParams,
          }),
          errors: [],
          isDirty: false,
        }
      : initialState,
  );

  const setParams = useCallback((params: ConversionParams) => {
    dispatch({ type: "SET_PARAMS", payload: params });
  }, []);

  const updateParam = useCallback(
    <K extends keyof ConversionParams>(key: K, value: ConversionParams[K]) => {
      dispatch({ type: "UPDATE_PARAM", payload: { key, value } });
    },
    [],
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return [state, { setParams, updateParam, reset }];
}
