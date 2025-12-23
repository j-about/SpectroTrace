/**
 * @fileoverview Progress - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-progress with SpectroTrace theming.
 * Displays a horizontal progress bar with animated indicator.
 *
 * @see https://ui.shadcn.com/docs/components/progress
 */

"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

/**
 * Progress bar component for displaying completion status.
 *
 * Used in SpectroTrace to show audio generation progress (0-100%).
 * The indicator smoothly animates as the value changes using CSS transitions.
 *
 * @param props - Standard Radix Progress props
 * @param props.value - Current progress value (0-100). Null or undefined shows empty bar.
 * @param props.max - Maximum value (default: 100, rarely changed)
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Show 75% progress
 * <Progress value={75} />
 *
 * // With ARIA attributes for accessibility
 * <Progress
 *   value={generationProgress}
 *   aria-label="Audio generation progress"
 * />
 * ```
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  // Render progress bar with indicator positioned via CSS transform
  // The translateX moves the indicator left based on remaining progress
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
