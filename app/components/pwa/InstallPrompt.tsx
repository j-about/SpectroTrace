/**
 * @fileoverview PWA install prompt component for SpectroTrace.
 *
 * Provides cross-platform install prompts:
 * - Native beforeinstallprompt for Chrome/Edge
 * - Manual instructions for iOS Safari
 *
 * Respects user dismissal with localStorage persistence.
 * @module components/pwa/InstallPrompt
 */

"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Browser event fired when PWA installation is available.
 * Extended Event interface with PWA-specific properties.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/** LocalStorage key for tracking install prompt dismissal */
const INSTALL_DISMISSED_KEY = "spectrotrace-install-dismissed";

/** Number of days to suppress install prompt after dismissal */
const DISMISS_DURATION_DAYS = 7;

/**
 * Check if app is running in standalone/installed mode.
 *
 * @returns true if app is installed as PWA
 */
function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

/**
 * Check if device is running iOS.
 *
 * @returns true if iOS device detected
 */
function getIsIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  );
}

/**
 * Subscribe to standalone display mode changes.
 *
 * @param callback - Function to call when standalone mode changes
 * @returns Cleanup function to remove listener
 */
function subscribeToStandalone(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

/**
 * No-op subscription for iOS detection.
 * User agent string never changes during a session, so there is nothing to subscribe to.
 * Required by useSyncExternalStore API but effectively unused.
 *
 * @returns No-op cleanup function
 */
function subscribeToIOS(): () => void {
  return () => {};
}

/**
 * Server-side snapshot for SSR compatibility.
 *
 * @returns false - assume not standalone during SSR
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * PWA installation prompt with platform-specific behavior.
 *
 * Shows after a short delay to avoid being too aggressive on first visit.
 * On iOS, displays manual "Add to Home Screen" instructions.
 * On other platforms, triggers the native browser install prompt.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Use useSyncExternalStore for standalone detection to avoid hydration mismatch
  const isStandalone = useSyncExternalStore(
    subscribeToStandalone,
    getIsStandalone,
    getServerSnapshot,
  );

  // Use useSyncExternalStore for iOS detection to avoid hydration mismatch
  const isIOS = useSyncExternalStore(
    subscribeToIOS,
    getIsIOS,
    getServerSnapshot,
  );

  useEffect(() => {
    // Don't proceed if already in standalone mode
    if (isStandalone) return;

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt, 10));
      const daysSinceDismiss =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < DISMISS_DURATION_DAYS) {
        return; // Don't show prompt if dismissed recently
      }
    }

    // For iOS, show manual install instructions after a delay
    if (getIsIOS()) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    function handleBeforeInstallPrompt(e: BeforeInstallPromptEvent) {
      e.preventDefault();
      setDeferredPrompt(e);
      // Delay showing to not be too aggressive on first visit
      setTimeout(() => setIsVisible(true), 2000);
    }

    function handleAppInstalled() {
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.removeItem(INSTALL_DISMISSED_KEY);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsVisible(false);
      }
      // Clear the prompt regardless of outcome
      setDeferredPrompt(null);
    } catch (error) {
      // Install prompt can fail if user dismissed, browser policy, etc.
      console.warn("Install prompt failed:", error);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
  }, []);

  // Don't render if already installed or not eligible
  if (isStandalone || (!deferredPrompt && !isIOS) || !isVisible) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="Install application"
      className={cn(
        "fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md",
        "border-border bg-card rounded-lg border p-4 shadow-lg",
        "animate-in slide-in-from-bottom-4 duration-300",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-lg p-2">
          <Download className="text-primary size-5" aria-hidden="true" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-card-foreground font-semibold">
            Install SpectroTrace
          </h3>
          <p className="text-muted-foreground text-sm">
            {isIOS
              ? "Tap the share button and select 'Add to Home Screen' for the best experience."
              : "Install for quick access and offline use. No app store needed."}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {!isIOS && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleDismiss}
          >
            Not now
          </Button>
          <Button size="sm" className="flex-1" onClick={handleInstallClick}>
            Install
          </Button>
        </div>
      )}

      {isIOS && (
        <div className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
          <span>Tap</span>
          <span
            className="bg-muted inline-flex size-6 items-center justify-center rounded"
            aria-label="Share icon"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </span>
          <span>then &quot;Add to Home Screen&quot;</span>
        </div>
      )}
    </div>
  );
}
