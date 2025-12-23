/**
 * @fileoverview Dialog - shadcn/ui wrapper component.
 *
 * Wraps @radix-ui/react-dialog with SpectroTrace theming.
 * Provides modal dialogs with overlay, animations, and close button.
 *
 * @see https://ui.shadcn.com/docs/components/dialog
 */

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Root dialog component that manages open/closed state.
 *
 * Provides context for modal dialogs with overlay backdrop.
 * Controls visibility and coordinates trigger/content relationship.
 *
 * @param props - Standard Radix Dialog props
 * @param props.open - Controlled open state
 * @param props.defaultOpen - Uncontrolled default open state
 * @param props.onOpenChange - Callback when open state changes: (open: boolean) => void
 * @param props.modal - If true (default), blocks interaction outside dialog
 *
 * @example
 * ```tsx
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogTrigger asChild>
 *     <Button>Open Dialog</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Confirm Action</DialogTitle>
 *     </DialogHeader>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * Element that opens the dialog when clicked.
 *
 * By default renders as a button. Use asChild to render trigger
 * behavior on a custom element.
 *
 * @param props - Standard Radix DialogTrigger props
 * @param props.asChild - If true, merges props onto child element
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Portal container that renders dialog outside the DOM hierarchy.
 *
 * Ensures dialog renders at document root to avoid z-index and
 * overflow issues. Used internally by DialogContent.
 *
 * @param props - Standard Radix DialogPortal props
 * @param props.container - Custom container element (default: document.body)
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Button that closes the dialog when clicked.
 *
 * Can be used anywhere within the dialog. DialogContent includes
 * a built-in close button, but this can be used for custom close triggers.
 *
 * @param props - Standard Radix DialogClose props
 * @param props.asChild - If true, merges props onto child element
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * Semi-transparent backdrop behind the dialog.
 *
 * Covers the viewport with a dark overlay to focus attention on the dialog.
 * Clicking the overlay closes the dialog (unless modal behavior is disabled).
 * Includes fade animations for smooth transitions.
 *
 * @param props - Standard Radix DialogOverlay props
 * @param props.className - Additional CSS classes
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The dialog panel that contains the main content.
 *
 * Renders centered in the viewport via fixed positioning and transforms.
 * Includes the overlay backdrop, enter/exit animations, and an optional
 * close button in the top-right corner. Traps focus within the dialog.
 *
 * @param props - Standard Radix DialogContent props plus showCloseButton
 * @param props.showCloseButton - If true (default), shows X button in top-right
 * @param props.className - Additional CSS classes
 * @param props.children - Dialog content (typically DialogHeader, body, DialogFooter)
 *
 * @example
 * ```tsx
 * <DialogContent showCloseButton={false}>
 *   <DialogHeader>
 *     <DialogTitle>Custom Dialog</DialogTitle>
 *   </DialogHeader>
 *   <p>Dialog body content here...</p>
 *   <DialogFooter>
 *     <DialogClose asChild>
 *       <Button>Close</Button>
 *     </DialogClose>
 *   </DialogFooter>
 * </DialogContent>
 * ```
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * Header section of the dialog for title and description.
 *
 * Renders as a flex column with centered text on mobile, left-aligned
 * on larger screens. Contains DialogTitle and optionally DialogDescription.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Usually DialogTitle and DialogDescription
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

/**
 * Footer section of the dialog for action buttons.
 *
 * Renders buttons in column-reverse on mobile (primary at bottom) and
 * row layout on larger screens (primary at right). Standard placement
 * for Cancel/Confirm button pairs.
 *
 * @param props - Standard div props
 * @param props.className - Additional CSS classes
 * @param props.children - Action buttons
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Accessible title for the dialog.
 *
 * Renders as a heading with semibold styling. Required for accessibility
 * as it provides the dialog's accessible name via aria-labelledby.
 *
 * @param props - Standard Radix DialogTitle props
 * @param props.className - Additional CSS classes
 * @param props.children - Title text
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * Accessible description for the dialog.
 *
 * Provides additional context below the title with muted styling.
 * Linked to the dialog via aria-describedby for screen readers.
 *
 * @param props - Standard Radix DialogDescription props
 * @param props.className - Additional CSS classes
 * @param props.children - Description text
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
