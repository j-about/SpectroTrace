/**
 * @fileoverview Label - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-label with SpectroTrace theming.
 * Handles disabled and peer-disabled styling automatically.
 *
 * @see https://ui.shadcn.com/docs/components/label
 */

"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

/**
 * Accessible label component for form controls.
 *
 * Associates text labels with form inputs using the htmlFor prop.
 * Automatically handles disabled state styling when paired with
 * disabled inputs (via peer-disabled) or disabled groups (via group-data).
 *
 * @param props - Standard Radix Label props (extends native label)
 * @param props.htmlFor - ID of the form element this label describes
 * @param props.className - Additional CSS classes
 * @param props.children - Label text content
 *
 * @example
 * ```tsx
 * // Basic label with input
 * <div className="grid gap-1.5">
 *   <Label htmlFor="duration">Duration (seconds)</Label>
 *   <Input id="duration" type="number" />
 * </div>
 *
 * // With icon
 * <Label htmlFor="freq">
 *   <FrequencyIcon /> Frequency Range
 * </Label>
 * ```
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
