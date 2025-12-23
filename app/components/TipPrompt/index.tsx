/**
 * @fileoverview Tip/donation prompt modal component.
 *
 * Displays after successful audio download, offering preset tip amounts
 * via Stripe Payment Links. Respects session-based suppression and
 * handles offline scenarios gracefully.
 * @module components/TipPrompt
 */

"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Beer, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** SessionStorage key for tracking tip prompt dismissal */
const TIP_HIDDEN_KEY = "spectrotrace-tip-hidden";

/** Stripe Payment Link URLs for each tip amount */
const TIP_URLS = {
  "€3": "https://buy.stripe.com/fZufZgeEwe754uIgqo6Ri00",
  "€5": "https://buy.stripe.com/00w7sKbsk6ED1iw3DC6Ri01",
  "€10": "https://buy.stripe.com/cNi8wOcwoe75e5i7TS6Ri02",
  custom: "https://buy.stripe.com/8x228q9kc8ML0esa206Ri03",
} as const;

/**
 * Check if browser is currently online.
 *
 * @returns true if online, false if offline
 */
function getIsOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

/**
 * Subscribe to online/offline status changes.
 *
 * @param callback - Function to call when status changes
 * @returns Cleanup function to remove listeners
 */
function subscribeToOnline(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Server-side snapshot for SSR compatibility.
 *
 * @returns true - assume online during SSR
 */
function getServerSnapshot(): boolean {
  return true;
}

interface TipPromptProps {
  /** Whether a download was successfully completed */
  downloadCompleted: boolean;
  /** Whether the modal is explicitly opened (e.g., from footer) */
  isOpen?: boolean;
  /** Callback when the prompt is dismissed */
  onDismiss?: () => void;
}

/**
 * TipPrompt modal component that appears after a successful download.
 * Shows preset tip amounts that link to Stripe Payment Links.
 * Respects session-based suppression and offline detection.
 */
export function TipPrompt({
  downloadCompleted,
  isOpen = false,
  onDismiss,
}: TipPromptProps) {
  const [showFromDownload, setShowFromDownload] = useState(false);

  // Track online status to avoid showing when offline
  const isOnline = useSyncExternalStore(
    subscribeToOnline,
    getIsOnline,
    getServerSnapshot,
  );

  // Show offline toast when explicitly opened from footer while offline
  useEffect(() => {
    if (isOpen && !isOnline) {
      toast.warning("Tips require an internet connection");
      onDismiss?.();
    }
  }, [isOpen, isOnline, onDismiss]);

  // Show prompt when download completes and conditions are met
  useEffect(() => {
    if (!downloadCompleted) return;
    if (!isOnline) return;

    // Check if already hidden this session
    const isHidden = sessionStorage.getItem(TIP_HIDDEN_KEY);
    if (isHidden) return;

    // Small delay to not interrupt the download experience
    const timer = setTimeout(() => {
      setShowFromDownload(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [downloadCompleted, isOnline]);

  // Compute final visibility: either from download flow or explicit open (when online)
  const isVisible = showFromDownload || (isOpen && isOnline);

  const handleDismiss = useCallback(() => {
    setShowFromDownload(false);
    sessionStorage.setItem(TIP_HIDDEN_KEY, "1");
    onDismiss?.();
  }, [onDismiss]);

  const handleTipClick = useCallback(
    (url: string) => {
      // Open Stripe Payment Link in new tab
      window.open(url, "_blank", "noopener,noreferrer");
      handleDismiss();
    },
    [handleDismiss],
  );

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="bg-primary/10 mx-auto mb-2 rounded-full p-3">
            <Beer className="text-primary size-6" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center">Buy me a beer!</DialogTitle>
          <DialogDescription className="text-center">
            If SpectroTrace has been helpful, consider leaving a small tip.
            Completely optional.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
          <Button
            variant="outline"
            className="flex flex-col gap-1 py-6"
            onClick={() => handleTipClick(TIP_URLS["€3"])}
          >
            <span className="text-lg font-semibold">€3</span>
            <ExternalLink
              className="text-muted-foreground size-3"
              aria-hidden="true"
            />
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-1 py-6"
            onClick={() => handleTipClick(TIP_URLS["€5"])}
          >
            <span className="text-lg font-semibold">€5</span>
            <ExternalLink
              className="text-muted-foreground size-3"
              aria-hidden="true"
            />
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-1 py-6"
            onClick={() => handleTipClick(TIP_URLS["€10"])}
          >
            <span className="text-lg font-semibold">€10</span>
            <ExternalLink
              className="text-muted-foreground size-3"
              aria-hidden="true"
            />
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-1 py-6"
            onClick={() => handleTipClick(TIP_URLS.custom)}
          >
            <span className="text-lg font-semibold">Custom</span>
            <ExternalLink
              className="text-muted-foreground size-3"
              aria-hidden="true"
            />
          </Button>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="ghost" onClick={handleDismiss}>
            No thanks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
