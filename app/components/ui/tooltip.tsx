/**
 * @fileoverview Tooltip - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-tooltip with SpectroTrace theming.
 * Provides accessible tooltips with arrow and animations.
 *
 * @see https://ui.shadcn.com/docs/components/tooltip
 */

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * Provider component that configures tooltip behavior for descendants.
 *
 * Sets up the tooltip context with shared configuration like delay timing.
 * In SpectroTrace, this is automatically included within each Tooltip component.
 *
 * @param props - Standard Radix TooltipProvider props
 * @param props.delayDuration - Time in ms before tooltip appears (default: 0 for instant)
 * @param props.skipDelayDuration - Time in ms before delay resets when moving between triggers
 * @param props.disableHoverableContent - If true, tooltip closes when hovering content
 *
 * @example
 * ```tsx
 * // Wrap app for shared tooltip config
 * <TooltipProvider delayDuration={300}>
 *   <App />
 * </TooltipProvider>
 * ```
 */
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

/**
 * Root tooltip component that manages open/closed state.
 *
 * Automatically wraps itself with TooltipProvider for convenience.
 * Controls visibility and coordinates trigger/content relationship.
 *
 * @param props - Standard Radix Tooltip props
 * @param props.open - Controlled open state
 * @param props.defaultOpen - Uncontrolled initial open state
 * @param props.onOpenChange - Callback when open state changes
 * @param props.children - Must include TooltipTrigger and TooltipContent
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Tooltip text</TooltipContent>
 * </Tooltip>
 * ```
 */
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

/**
 * Element that triggers the tooltip to appear on hover/focus.
 *
 * By default, renders as a button. Use asChild prop to render
 * tooltip trigger behavior on a custom element.
 *
 * @param props - Standard Radix TooltipTrigger props
 * @param props.asChild - If true, merges props onto child element
 * @param props.children - The trigger element content
 *
 * @example
 * ```tsx
 * // Default button trigger
 * <TooltipTrigger>?</TooltipTrigger>
 *
 * // Custom trigger element
 * <TooltipTrigger asChild>
 *   <InfoIcon className="cursor-help" />
 * </TooltipTrigger>
 * ```
 */
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * The tooltip popup content that appears when triggered.
 *
 * Renders via portal to avoid z-index/overflow issues. Includes an arrow
 * pointing to the trigger and smooth animations for enter/exit transitions.
 * Uses inverted colors (foreground bg, background text) for visibility.
 *
 * @param props - Standard Radix TooltipContent props
 * @param props.sideOffset - Distance from trigger in pixels (default: 0)
 * @param props.side - Preferred side: "top" | "right" | "bottom" | "left"
 * @param props.align - Alignment: "start" | "center" | "end"
 * @param props.className - Additional CSS classes
 * @param props.children - Tooltip message content
 *
 * @example
 * ```tsx
 * <TooltipContent side="top" sideOffset={5}>
 *   Click to generate audio from your image
 * </TooltipContent>
 * ```
 */
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
