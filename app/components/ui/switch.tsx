/**
 * @fileoverview Switch - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-switch with SpectroTrace theming.
 * Provides accessible toggle switch for boolean states.
 *
 * @see https://ui.shadcn.com/docs/components/switch
 */

"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

/**
 * Toggle switch component for boolean on/off states.
 *
 * Renders as a sliding toggle with a thumb indicator. The thumb animates
 * between left (off) and right (on) positions. Uses primary color when
 * checked, muted input color when unchecked.
 *
 * @param props - Standard Radix Switch props
 * @param props.checked - Controlled checked state (true = on)
 * @param props.defaultChecked - Uncontrolled default checked state
 * @param props.onCheckedChange - Callback when state changes: (checked: boolean) => void
 * @param props.disabled - If true, switch is non-interactive and dimmed
 * @param props.required - If true, switch must be checked for form submission
 * @param props.name - Form input name for form submission
 * @param props.value - Form input value when checked
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Controlled switch
 * <Switch
 *   checked={isAdvancedMode}
 *   onCheckedChange={setIsAdvancedMode}
 *   aria-label="Toggle advanced mode"
 * />
 *
 * // With label
 * <div className="flex items-center gap-2">
 *   <Switch id="loop" />
 *   <Label htmlFor="loop">Loop playback</Label>
 * </div>
 * ```
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
