/**
 * @fileoverview Tabs - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-tabs with SpectroTrace theming.
 * Provides accessible tabbed navigation with keyboard support.
 *
 * @see https://ui.shadcn.com/docs/components/tabs
 */

"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * Root tabs container component that manages tab state.
 *
 * Provides context for tab selection and coordinates TabsList/TabsContent.
 * Renders as a flex column with gap between list and content panels.
 *
 * @param props - Standard Radix Tabs props
 * @param props.value - Controlled active tab value
 * @param props.defaultValue - Uncontrolled default active tab
 * @param props.onValueChange - Callback when active tab changes: (value: string) => void
 * @param props.orientation - Tab orientation: "horizontal" | "vertical"
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="waveform">
 *   <TabsList>
 *     <TabsTrigger value="waveform">Waveform</TabsTrigger>
 *     <TabsTrigger value="spectrogram">Spectrogram</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="waveform">...</TabsContent>
 *   <TabsContent value="spectrogram">...</TabsContent>
 * </Tabs>
 * ```
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

/**
 * Container for tab triggers with muted background styling.
 *
 * Renders as an inline-flex container that holds TabsTrigger components.
 * Styled with rounded corners and muted background to group triggers visually.
 *
 * @param props - Standard Radix TabsList props
 * @param props.loop - If true, keyboard navigation loops from last to first
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <TabsList>
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 * ```
 */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Individual tab button that activates its associated content panel.
 *
 * Renders as a button with active/inactive visual states. Active state
 * shows elevated background with shadow; inactive shows transparent.
 * Supports keyboard navigation (Arrow keys, Home, End).
 *
 * @param props - Standard Radix TabsTrigger props
 * @param props.value - Unique value that links this trigger to TabsContent
 * @param props.disabled - If true, tab cannot be selected
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <TabsTrigger value="settings" disabled={!hasAccess}>
 *   <GearIcon /> Settings
 * </TabsTrigger>
 * ```
 */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Content panel that displays when its associated tab is active.
 *
 * Only renders children when the matching TabsTrigger is selected.
 * Uses flex-1 to fill available space in the parent Tabs container.
 *
 * @param props - Standard Radix TabsContent props
 * @param props.value - Value that links this content to a TabsTrigger
 * @param props.forceMount - If true, content stays in DOM when inactive (for animations)
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <TabsContent value="waveform">
 *   <Waveform data={audioData} />
 * </TabsContent>
 * ```
 */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
