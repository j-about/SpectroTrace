/**
 * @fileoverview Button - shadcn/ui wrapper component.
 *
 * Wraps native button element with class-variance-authority for variants.
 * Supports polymorphic rendering via asChild prop (Radix Slot).
 *
 * Variants: default, destructive, outline, secondary, ghost, link
 * Sizes: default, sm, lg, icon, icon-sm
 *
 * @see https://ui.shadcn.com/docs/components/button
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Button component with multiple visual variants and sizes.
 *
 * Supports polymorphic rendering via the `asChild` prop, which allows
 * the button to render as a different element (e.g., a link) while
 * maintaining button styling and behavior.
 *
 * @param props - Standard button props plus variant, size, and asChild
 * @param props.variant - Visual style variant: default, destructive, outline, secondary, ghost, link
 * @param props.size - Button size: default, sm, lg, icon, icon-sm
 * @param props.asChild - If true, renders children as the root element via Radix Slot
 * @param props.className - Additional CSS classes to merge with defaults
 *
 * @example
 * ```tsx
 * // Standard button
 * <Button onClick={handleClick}>Click me</Button>
 *
 * // Destructive action
 * <Button variant="destructive">Delete</Button>
 *
 * // As a link (polymorphic rendering)
 * <Button asChild>
 *   <a href="/somewhere">Go somewhere</a>
 * </Button>
 * ```
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  // Determine root component based on asChild prop
  // When asChild is true, Slot merges props onto the child element
  // This enables polymorphic rendering (e.g., button styled as link)
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
