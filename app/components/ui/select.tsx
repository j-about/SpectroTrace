/**
 * @fileoverview Select - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-select with SpectroTrace theming.
 * Provides accessible dropdown select with keyboard navigation.
 *
 * @see https://ui.shadcn.com/docs/components/select
 */

"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Root select component that manages selection state.
 *
 * Provides context for dropdown selection and coordinates trigger/content.
 * Supports single selection with keyboard navigation.
 *
 * @param props - Standard Radix Select props
 * @param props.value - Controlled selected value
 * @param props.defaultValue - Uncontrolled default selected value
 * @param props.onValueChange - Callback when selection changes: (value: string) => void
 * @param props.open - Controlled open state
 * @param props.onOpenChange - Callback when open state changes
 * @param props.disabled - If true, select is non-interactive
 * @param props.name - Form input name for form submission
 *
 * @example
 * ```tsx
 * <Select value={format} onValueChange={setFormat}>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select format" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="wav">WAV</SelectItem>
 *     <SelectItem value="mp3">MP3</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 */
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

/**
 * Groups related select items with an optional label.
 *
 * Use to organize items into logical categories within the dropdown.
 *
 * @param props - Standard Radix SelectGroup props
 * @param props.children - SelectLabel and SelectItem children
 */
function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

/**
 * Displays the currently selected value in the trigger.
 *
 * Shows placeholder text when no value is selected. Automatically
 * updates to show the selected item's text content.
 *
 * @param props - Standard Radix SelectValue props
 * @param props.placeholder - Text shown when no value is selected
 */
function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/**
 * Button that opens the select dropdown when clicked.
 *
 * Displays the current SelectValue and a chevron icon. Supports two sizes
 * and shows focus/validation states. Includes keyboard support for opening.
 *
 * @param props - Standard Radix SelectTrigger props plus size
 * @param props.size - Button size: "default" (h-9) or "sm" (h-8)
 * @param props.className - Additional CSS classes
 * @param props.children - Should contain SelectValue component
 *
 * @example
 * ```tsx
 * <SelectTrigger size="sm">
 *   <SelectValue placeholder="Choose..." />
 * </SelectTrigger>
 * ```
 */
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/**
 * Dropdown content container with items and scroll buttons.
 *
 * Renders via portal to avoid z-index issues. Includes smooth enter/exit
 * animations and scroll indicators for long lists. Positions relative
 * to the trigger with intelligent placement.
 *
 * @param props - Standard Radix SelectContent props
 * @param props.position - Positioning mode: "item-aligned" (default) or "popper"
 * @param props.align - Alignment when position="popper": "start", "center", "end"
 * @param props.side - Preferred side: "top", "right", "bottom", "left"
 * @param props.className - Additional CSS classes
 * @param props.children - SelectItem, SelectGroup, SelectSeparator children
 *
 * @example
 * ```tsx
 * <SelectContent>
 *   <SelectItem value="1">Option 1</SelectItem>
 *   <SelectItem value="2">Option 2</SelectItem>
 * </SelectContent>
 * ```
 */
function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/**
 * Label for a group of select items.
 *
 * Displays as non-interactive text with muted styling. Use within
 * SelectGroup to label categories of options.
 *
 * @param props - Standard Radix SelectLabel props
 * @param props.className - Additional CSS classes
 * @param props.children - Label text
 */
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

/**
 * Individual selectable option within the dropdown.
 *
 * Displays option text with a checkmark indicator when selected.
 * Supports keyboard navigation and focus highlighting.
 *
 * @param props - Standard Radix SelectItem props
 * @param props.value - Unique value for this option (required)
 * @param props.disabled - If true, item cannot be selected
 * @param props.textValue - Text used for typeahead (defaults to children text)
 * @param props.className - Additional CSS classes
 * @param props.children - Option display text/content
 *
 * @example
 * ```tsx
 * <SelectItem value="wav">
 *   <AudioIcon /> WAV (Lossless)
 * </SelectItem>
 * ```
 */
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/**
 * Visual separator line between select items or groups.
 *
 * Renders as a horizontal line to divide sections of the dropdown.
 *
 * @param props - Standard Radix SelectSeparator props
 * @param props.className - Additional CSS classes
 */
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

/**
 * Scroll indicator button shown at the top of long lists.
 *
 * Appears when content is scrollable and there are items above.
 * Clicking scrolls the list upward.
 *
 * @param props - Standard Radix SelectScrollUpButton props
 * @param props.className - Additional CSS classes
 */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

/**
 * Scroll indicator button shown at the bottom of long lists.
 *
 * Appears when content is scrollable and there are items below.
 * Clicking scrolls the list downward.
 *
 * @param props - Standard Radix SelectScrollDownButton props
 * @param props.className - Additional CSS classes
 */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
