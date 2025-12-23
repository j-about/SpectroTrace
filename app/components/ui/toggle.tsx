/**
 * @fileoverview Toggle - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-toggle with SpectroTrace theming.
 * Provides a pressable button that toggles between states.
 *
 * Variants: default, outline
 * Sizes: default, sm, lg
 *
 * @see https://ui.shadcn.com/docs/components/toggle
 */

"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Toggle button component for binary on/off states.
 *
 * Renders as an accessible toggle button that maintains pressed state.
 * Used in SpectroTrace for toggling options like advanced mode settings.
 * Visual state changes based on data-state attribute (on/off).
 *
 * @param props - Standard Radix Toggle props plus variant and size
 * @param props.pressed - Controlled pressed state (true = on, false = off)
 * @param props.defaultPressed - Uncontrolled initial pressed state
 * @param props.onPressedChange - Callback when pressed state changes: (pressed: boolean) => void
 * @param props.variant - Visual style: "default" (transparent) or "outline" (bordered)
 * @param props.size - Button size: "default" (h-9), "sm" (h-8), "lg" (h-10)
 * @param props.disabled - If true, toggle is non-interactive and dimmed
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Controlled toggle
 * <Toggle pressed={isEnabled} onPressedChange={setIsEnabled}>
 *   <BoldIcon />
 * </Toggle>
 *
 * // With outline variant
 * <Toggle variant="outline" defaultPressed>
 *   Loop
 * </Toggle>
 * ```
 */
function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
