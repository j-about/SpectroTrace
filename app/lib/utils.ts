/**
 * @fileoverview Shared utility functions for the SpectroTrace application.
 *
 * This module provides common utilities used across the application,
 * primarily for CSS class name manipulation with Tailwind CSS.
 *
 * @module lib/utils
 * @see {@link https://github.com/lukeed/clsx} - clsx library for class name construction
 * @see {@link https://github.com/dcastil/tailwind-merge} - tailwind-merge for conflict resolution
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single optimized class string.
 *
 * This function merges CSS class names while intelligently handling Tailwind CSS
 * class conflicts. When the same utility category appears multiple times
 * (e.g., "p-2" and "p-4"), the last one wins, preventing style conflicts.
 *
 * The function supports various input types:
 * - Strings: "class1 class2"
 * - Arrays: ["class1", "class2"]
 * - Objects: { class1: true, class2: false }
 * - Nested combinations of the above
 *
 * @param inputs - Variable number of class values to combine. Each input can be
 *                 a string, array, object with boolean values, or nested combination.
 *                 Falsy values (null, undefined, false) are safely ignored.
 *
 * @returns A single space-separated string of optimized class names with
 *          Tailwind conflicts resolved.
 *
 * @example
 * ```typescript
 * // Basic string concatenation
 * cn("px-2", "py-4")
 * // Returns: "px-2 py-4"
 *
 * // Tailwind conflict resolution - last value wins
 * cn("p-2", "p-4")
 * // Returns: "p-4"
 *
 * // Conditional classes with objects
 * cn("base-class", { "active-class": isActive, "disabled-class": isDisabled })
 * // Returns: "base-class active-class" (if isActive is true)
 *
 * // Combining with component props
 * cn("default-styles", className)
 * // Returns: merged classes with user's className taking precedence
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  // Step 1: Use clsx to handle conditional classes, arrays, and objects
  // clsx normalizes various input formats into a single space-separated string
  const clsxResult = clsx(inputs);

  // Step 2: Use tailwind-merge to intelligently resolve Tailwind class conflicts
  // This ensures the last conflicting utility class wins (e.g., "p-2 p-4" → "p-4")
  return twMerge(clsxResult);
}
