/**
 * @fileoverview Service worker registration component for PWA offline capability.
 * @module components/pwa/ServiceWorkerRegistrar
 */

"use client";

import { useEffect } from "react";

/**
 * Registers and manages the service worker for offline capability.
 *
 * This component:
 * - Registers /sw.js on mount in production environment only
 * - Checks for service worker updates periodically
 * - Listens for new service worker installations
 *
 * Renders nothing - this is a side-effect-only component.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then((registration) => {
          // Check for updates periodically
          registration.update();

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker installed while an older one controls the page.
                  // The new version will activate on next page load.
                  // Intentionally not prompting user to refresh - updates apply naturally.
                }
              });
            }
          });
        })
        .catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.warn("Service worker registration failed:", error);
          }
        });
    }
  }, []);

  return null;
}
