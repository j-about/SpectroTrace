/**
 * @fileoverview Toaster - shadcn/ui wrapper component.
 *
 * Wraps Sonner toast library with SpectroTrace theming.
 * Provides styled toast notifications for success, error, and info states.
 *
 * @see https://ui.shadcn.com/docs/components/sonner
 */

"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toaster component for displaying toast notifications.
 *
 * Provides styled toast messages for user feedback including
 * success, error, and informational notifications.
 *
 * @param props - Sonner Toaster props
 * @param props.position - Toast position (default: bottom-right)
 * @param props.expand - Whether to expand toasts
 * @param props.richColors - Enable rich color variations
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <Toaster />
 *
 * // Usage anywhere
 * import { toast } from 'sonner';
 * toast.success('Audio generated!');
 * toast.error('Generation failed');
 * ```
 */
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      data-slot="toaster"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error:
            "group-[.toaster]:bg-destructive group-[.toaster]:text-white group-[.toaster]:border-destructive",
          success:
            "group-[.toaster]:bg-green-600 group-[.toaster]:text-white group-[.toaster]:border-green-600",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
