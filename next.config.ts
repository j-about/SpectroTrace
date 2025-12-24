/**
 * @fileoverview Next.js configuration for SpectroTrace.
 *
 * Configures:
 * - Standalone output for Docker deployment
 * - Comprehensive security headers (CSP, HSTS, etc.)
 * - Service worker headers for PWA support
 * - Image optimization disabled (client-side processing)
 *
 * @module next.config
 */

import type { NextConfig } from "next";

// Content Security Policy for SpectroTrace
// - All processing is client-side (no server uploads)
// - Stripe Payment Links are external navigation (not embedded)
// - blob: and data: URIs needed for audio playback and image processing
// - Google Tag Manager domains for analytics (when NEXT_PUBLIC_GTM_ID is set)
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://tagmanager.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://www.googletagmanager.com;
  media-src 'self' blob:;
  font-src 'self';
  connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
  worker-src 'self' blob:;
  frame-src https://www.googletagmanager.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\n/g, "")
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    // All image processing is local/client-side, no need for Next.js image optimization
    unoptimized: true,
  },
  async headers() {
    return [
      // Security headers for all routes
      {
        source: "/(.*)",
        headers: [
          // HSTS - enforce HTTPS for 1 year with subdomains
          // Note: HTTPS termination handled by reverse proxy (nginx/Caddy)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(self)",
          },
          // Prevent XSS attacks (legacy header, CSP is primary protection)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Prevent DNS prefetching for privacy
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
        ],
      },
      // Service worker specific headers
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
