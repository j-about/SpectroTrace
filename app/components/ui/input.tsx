/**
 * @fileoverview Input - shadcn/ui wrapper component.
 *
 * Wraps native input element with consistent styling.
 * Supports file inputs, focus states, and validation styling.
 *
 * @see https://ui.shadcn.com/docs/components/input
 */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Text input component with consistent styling and validation states.
 *
 * Wraps native input element with SpectroTrace theming. Supports all
 * standard input types including text, number, email, password, and file.
 * File inputs have special styling for the file selector button.
 *
 * @param props - Standard HTML input props
 * @param props.type - Input type: "text", "number", "email", "password", "file", etc.
 * @param props.placeholder - Placeholder text shown when empty
 * @param props.disabled - If true, input is non-interactive and dimmed
 * @param props.aria-invalid - If true, shows destructive/error styling
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Text input
 * <Input
 *   type="text"
 *   placeholder="Enter a name..."
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 *
 * // Number input with validation
 * <Input
 *   type="number"
 *   min={1}
 *   max={30}
 *   aria-invalid={duration < 1}
 * />
 *
 * // File input
 * <Input type="file" accept="image/*" />
 * ```
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
