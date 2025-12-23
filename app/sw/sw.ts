/// <reference lib="webworker" />

/**
 * @fileoverview SpectroTrace Service Worker - Offline-First PWA Support.
 *
 * This service worker enables offline functionality and improved performance
 * by caching application assets using Workbox v7. It implements a multi-tiered
 * caching strategy optimized for a single-page application.
 *
 * **Caching Strategies by Resource Type:**
 *
 * | Resource Type | Strategy | Cache Duration | Rationale |
 * |---------------|----------|----------------|-----------|
 * | HTML Pages | NetworkFirst | 24 hours | Fresh content when online |
 * | JS/CSS | StaleWhileRevalidate | 7 days | Fast loads, background updates |
 * | Fonts | CacheFirst | 1 year | Rarely change |
 * | Images | CacheFirst | 30 days | Reduce bandwidth |
 * | Next.js Static | CacheFirst | 1 year | Hashed filenames |
 * | WAV Files | NetworkOnly | Never | User-generated, not cached |
 * | External APIs | NetworkOnly | Never | Stripe, analytics |
 *
 * **Offline Behavior:**
 * When the network is unavailable, the service worker returns cached responses.
 * If a navigation request fails and no cache exists, it falls back to the
 * cached homepage (single-page app behavior).
 *
 * **Update Strategy:**
 * Uses `skipWaiting()` and `clientsClaim()` for immediate activation of new
 * service worker versions. Old version caches are cleaned up automatically.
 *
 * @module sw/sw
 * @see {@link module:components/pwa/ServiceWorkerRegistrar} - Registers this worker
 * @see {@link https://developer.chrome.com/docs/workbox/} - Workbox documentation
 */

import { clientsClaim, setCacheNameDetails } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

// =============================================================================
// Cache Configuration
// =============================================================================

/**
 * Configure custom cache names with application prefix.
 * This helps identify SpectroTrace caches in browser dev tools
 * and prevents conflicts with other applications on the same origin.
 */
setCacheNameDetails({
  prefix: "spectrotrace",
  suffix: "v1",
  precache: "precache",
  runtime: "runtime",
});

// =============================================================================
// Service Worker Lifecycle
// =============================================================================

/**
 * Skip the waiting phase and activate immediately.
 * This ensures users get the latest service worker without needing to close all tabs.
 * Combined with clientsClaim(), this provides immediate updates.
 */
self.skipWaiting();

/**
 * Claim all open clients immediately after activation.
 * This allows the new service worker to control all open tabs without a page reload.
 */
clientsClaim();

/**
 * Remove caches from previous service worker versions.
 * Workbox tracks which caches it manages and cleans up old ones automatically.
 */
cleanupOutdatedCaches();

// =============================================================================
// Precache Configuration
// =============================================================================

/**
 * Precache critical app shell assets.
 * These are cached during service worker installation and served instantly.
 *
 * Note: In a production build with workbox-build, this manifest would be
 * auto-generated with file hashes. For now, we use revision strings and
 * rely on runtime caching for most assets (works well with Next.js).
 */
precacheAndRoute([
  { url: "/", revision: "1" },
  { url: "/manifest.webmanifest", revision: "1" },
]);

// ============================================
// Runtime Caching Strategies
// ============================================

// Navigation requests - NetworkFirst for HTML pages
// Ensures users get fresh content when online, cached when offline
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "spectrotrace-pages-v1",
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 25,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  }),
);

// Static JS and CSS - StaleWhileRevalidate
// Serve from cache immediately, update in background
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "spectrotrace-assets-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  }),
);

// Fonts - CacheFirst (fonts rarely change)
registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: "spectrotrace-fonts-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  }),
);

// Images and icons - CacheFirst with expiration
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "spectrotrace-images-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// Next.js static files (_next/static) - CacheFirst
registerRoute(
  ({ url }) => url.pathname.startsWith("/_next/static/"),
  new CacheFirst({
    cacheName: "spectrotrace-next-static-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year (hashed filenames)
      }),
    ],
  }),
);

// ============================================
// Exclusions - Do NOT cache these
// ============================================

// WAV exports and large user files - NetworkOnly
// These are generated client-side and should not be cached
registerRoute(
  ({ url }) =>
    url.pathname.endsWith(".wav") ||
    url.pathname.includes("/api/") ||
    url.pathname.includes("blob:"),
  new NetworkOnly(),
);

// External API calls (like Stripe for tips) - NetworkOnly
registerRoute(
  ({ url }) =>
    !url.origin.includes(self.location.origin) &&
    (url.origin.includes("stripe.com") ||
      url.origin.includes("api.") ||
      url.origin.includes("analytics")),
  new NetworkOnly(),
);

// ============================================
// Offline Fallback
// ============================================

// Set up offline fallback for navigation requests
setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    // Return cached homepage as fallback
    const cache = await caches.open("spectrotrace-pages-v1");
    const cachedResponse = await cache.match("/");
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  // For other requests, just return an error response
  return Response.error();
});

// ============================================
// Service Worker Lifecycle Events
// ============================================

self.addEventListener("install", () => {
  console.log("Service Worker: Installing...");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old versioned caches
            return (
              cacheName.startsWith("spectrotrace-") &&
              !cacheName.endsWith("-v1")
            );
          })
          .map((cacheName) => {
            console.log("Service Worker: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }),
      );
    }),
  );
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
