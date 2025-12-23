/**
 * @fileoverview Slider - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-slider with SpectroTrace theming.
 * Supports single and range values with horizontal/vertical orientation.
 *
 * @see https://ui.shadcn.com/docs/components/slider
 */

"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

/**
 * Slider component for selecting numeric values within a range.
 *
 * Used in SpectroTrace's Advanced Mode for adjusting audio conversion
 * parameters like duration, frequency range, and smoothing factor.
 *
 * @param props - Standard Radix Slider props
 * @param props.value - Controlled value(s) as array (e.g., [50] for single, [20, 80] for range)
 * @param props.defaultValue - Uncontrolled default value(s)
 * @param props.min - Minimum selectable value (default: 0)
 * @param props.max - Maximum selectable value (default: 100)
 * @param props.step - Step increment for value changes
 * @param props.onValueChange - Callback fired when value changes: (value: number[]) => void
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Single value slider
 * <Slider value={[50]} onValueChange={(v) => setValue(v[0])} min={0} max={100} />
 *
 * // Range slider (two thumbs)
 * <Slider value={[minFreq, maxFreq]} onValueChange={setFreqRange} />
 * ```
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  // Compute thumb values for rendering
  // The slider supports multiple thumbs (for range selection)
  // We determine how many thumbs to render based on the value array
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
