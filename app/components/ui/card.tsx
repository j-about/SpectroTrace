/**
 * @fileoverview Card - shadcn/ui wrapper component.
 *
 * Provides a composable card layout with header, content, footer sections.
 * Uses native div elements with SpectroTrace theming.
 *
 * @see https://ui.shadcn.com/docs/components/card
 */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card container component with elevated styling.
 *
 * Provides a bordered container with rounded corners, shadow, and
 * card-specific background color. Use with CardHeader, CardContent,
 * and CardFooter for structured layouts.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Card sections (CardHeader, CardContent, CardFooter)
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Audio Settings</CardTitle>
 *     <CardDescription>Configure audio generation parameters</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <Slider ... />
 *   </CardContent>
 * </Card>
 * ```
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Card header section for title, description, and optional action.
 *
 * Uses CSS Grid to position title/description on the left and optional
 * CardAction on the right. Supports container queries via @container.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Usually CardTitle, CardDescription, and optionally CardAction
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardTitle>Export Options</CardTitle>
 *   <CardDescription>Choose your download format</CardDescription>
 *   <CardAction>
 *     <Button variant="ghost" size="icon-sm">
 *       <SettingsIcon />
 *     </Button>
 *   </CardAction>
 * </CardHeader>
 * ```
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Card title component with semibold styling.
 *
 * Renders the main heading for a card section. Placed within CardHeader.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Title text
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * Card description component with muted styling.
 *
 * Renders secondary descriptive text below the card title.
 * Uses smaller font size and muted foreground color.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Description text
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/**
 * Card action slot positioned in the top-right of CardHeader.
 *
 * Uses CSS Grid positioning to place action buttons or icons
 * in the header's right column, spanning both title and description rows.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Action elements (buttons, icons)
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Main content area of a card with horizontal padding.
 *
 * Contains the primary card content between header and footer.
 * Inherits the gap from parent Card for consistent spacing.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Card body content
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

/**
 * Card footer section for actions or supplementary content.
 *
 * Renders at the bottom of the card with flex layout for action buttons.
 * Adds top padding when preceded by a border element.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Footer content (typically buttons)
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
