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

/**
 * Content Security Policy for SpectroTrace.
 *
 * Base policy (always applied):
 * - All processing is client-side (no server uploads)
 * - Stripe Payment Links are external navigation (not embedded)
 * - blob: and data: URIs needed for audio playback and image processing
 *
 * When NEXT_PUBLIC_GTM_ID is set:
 * - Google Tag Manager core domains are added
 * - Additional domains can be configured via NEXT_PUBLIC_CSP_* env vars
 *
 * @see https://developers.google.com/tag-platform/security/guides/csp
 */

/**
 * CSP directive names used in this configuration.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
 */
type CSPDirectiveName =
  | "base-uri"
  | "connect-src"
  | "default-src"
  | "font-src"
  | "form-action"
  | "frame-ancestors"
  | "frame-src"
  | "img-src"
  | "object-src"
  | "media-src"
  | "script-src"
  | "style-src"
  | "worker-src";

/**
 * Type definition for Content Security Policy directives.
 * Maps directive names to arrays of allowed sources.
 *
 * @example
 * const csp: CSPDirectives = {
 *   "img-src": ["'self'", "data:", "blob:"],
 *   "script-src": ["'self'", "'unsafe-inline'"],
 * };
 */
type CSPDirectives = Record<CSPDirectiveName, string[]>;

/**
 * Extends a CSP directive with sources from an environment variable.
 *
 * Parses space-separated URLs from the environment variable and appends
 * them to the specified directive array.
 *
 * @param csp - The CSP directives object to modify
 * @param directive - The CSP directive name (must be a valid CSPDirectiveName)
 * @param envVar - The environment variable value (space-separated URLs)
 *
 * @example
 * // NEXT_PUBLIC_CSP_SCRIPT_SRC="https://cdn.example.com https://api.example.com"
 * extendCSP(csp, "script-src", process.env.NEXT_PUBLIC_CSP_SCRIPT_SRC);
 */
function extendCSP(
  csp: CSPDirectives,
  directive: CSPDirectiveName,
  envVar: string | undefined,
): void {
  if (envVar) {
    const sources = envVar.split(/\s+/).filter(Boolean);
    csp[directive].push(...sources);
  }
}

/**
 * Builds the CSP header string from a directives object.
 *
 * Filters out empty directives and joins all sources with proper formatting.
 * Automatically appends `upgrade-insecure-requests` directive.
 *
 * @param csp - The CSP directives object
 * @returns The formatted CSP header value
 *
 * @example
 * const policy = buildCSP({
 *   "default-src": ["'self'"],
 *   "script-src": ["'self'", "'unsafe-inline'"],
 * });
 * // Returns: "default-src 'self'; script-src 'self' 'unsafe-inline'; upgrade-insecure-requests"
 */
function buildCSP(csp: CSPDirectives): string {
  return Object.entries(csp)
    .filter(([, values]) => values.length > 0)
    .map(([directive, values]) => `${directive} ${values.join(" ")}`)
    .concat(["upgrade-insecure-requests"])
    .join("; ");
}

/**
 * Base Content Security Policy directives.
 *
 * Security considerations:
 * - `frame-ancestors: 'none'` prevents clickjacking (stricter than X-Frame-Options)
 * - `blob:` needed for audio playback (AudioContext) and image processing
 * - `data:` needed for inline images and audio data URIs
 * - `'unsafe-eval'` required for Web Audio API and dynamic audio processing
 * - `'unsafe-inline'` required for Tailwind CSS and dynamic styles
 * - `worker-src blob:` required for Service Worker and audio worklets
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
const csp: CSPDirectives = {
  "base-uri": ["'self'"],
  "connect-src": ["'self'"],
  "default-src": ["'self'"],
  "font-src": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "frame-src": [],
  "img-src": ["'self'", "data:", "blob:"],
  "media-src": ["'self'", "blob:"],
  "object-src": ["'none'"],
  "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "worker-src": ["'self'", "blob:"],
};

/**
 * Google Tag Manager CSP configuration.
 *
 * Only added when NEXT_PUBLIC_GTM_ID is set.
 *
 * Additional domains can be configured via NEXT_PUBLIC_CSP_* environment variables.
 *
 * @see https://developers.google.com/tag-platform/security/guides/csp
 */
if (process.env.NEXT_PUBLIC_GTM_ID) {
  csp["connect-src"].push(
    "https://www.googletagmanager.com",
    "https://www.google.com",
  );
  csp["font-src"].push("https://fonts.gstatic.com");
  csp["img-src"].push(
    "https://www.googletagmanager.com",
    "https://googletagmanager.com",
    "https://ssl.gstatic.com",
    "https://www.gstatic.com",
  );
  csp["script-src"].push(
    "https://www.googletagmanager.com",
    "https://googletagmanager.com",
    "https://tagmanager.google.com",
  );
  csp["style-src"].push(
    "https://googletagmanager.com",
    "https://tagmanager.google.com",
    "https://fonts.googleapis.com",
  );

  // Extended sources from environment variables (only with GTM)
  extendCSP(csp, "connect-src", process.env.NEXT_PUBLIC_CSP_CONNECT_SRC);
  extendCSP(csp, "font-src", process.env.NEXT_PUBLIC_CSP_FONT_SRC);
  extendCSP(csp, "frame-src", process.env.NEXT_PUBLIC_CSP_FRAME_SRC);
  extendCSP(csp, "img-src", process.env.NEXT_PUBLIC_CSP_IMG_SRC);
  extendCSP(csp, "script-src", process.env.NEXT_PUBLIC_CSP_SCRIPT_SRC);
  extendCSP(csp, "style-src", process.env.NEXT_PUBLIC_CSP_STYLE_SRC);
}

/** Compiled Content Security Policy header value. */
const ContentSecurityPolicy = buildCSP(csp);

/**
 * Next.js Configuration for SpectroTrace.
 *
 * Application configuration with:
 * - Docker support (standalone output for containerized deployments)
 * - Security headers (CSP, HSTS, XSS protection, etc.)
 * - Performance optimizations (compression)
 * - Build optimizations (console removal in production)
 *
 * **Docker:**
 * Standalone output mode creates a minimal build with only necessary files,
 * significantly reducing Docker image size and deployment complexity.
 *
 * **Security:**
 * CSP allows 'unsafe-eval' for Web Audio API and 'unsafe-inline'
 * for dynamic styles (Tailwind CSS).
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig: NextConfig = {
  /**
   * Standalone output for Docker deployments.
   *
   * Creates a minimal build with only required dependencies,
   * includes a built-in Node.js server, and reduces image size.
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/output
   */
  output: "standalone",

  /**
   * Enable React Strict Mode for additional runtime checks.
   *
   * Helps identify potential problems in components during development.
   */
  reactStrictMode: true,

  /**
   * Remove X-Powered-By header for security.
   *
   * Hides Next.js version information from response headers.
   */
  poweredByHeader: false,

  /**
   * Enable response compression.
   *
   * Gzip/Brotli compression reduces payload sizes by ~70%.
   */
  compress: true,

  /**
   * Image optimization configuration.
   *
   * Disabled because all image processing (spectrogram generation)
   * is done client-side via Canvas API. No server-side optimization needed.
   */
  images: {
    unoptimized: true,
  },

  /**
   * SWC compiler options.
   *
   * Uses Rust-based SWC compiler for faster builds.
   * Removes console.* calls in production (except error and warn).
   */
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  /**
   * Security headers configuration.
   *
   * Applied to all routes. Implements defense-in-depth security:
   * - HSTS: Forces HTTPS for 1 year with subdomain and preload support
   * - CSP: Controls resource loading and script execution
   * - X-Frame-Options: Prevents clickjacking (backup for CSP frame-ancestors)
   * - X-Content-Type-Options: Prevents MIME sniffing
   * - Referrer-Policy: Controls referrer information leakage
   * - Permissions-Policy: Restricts browser feature access
   *
   * @returns Array of header configurations for all paths
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          /**
           * HTTP Strict Transport Security (HSTS).
           *
           * Forces HTTPS for 1 year (31536000 seconds).
           * Includes subdomains and enables HSTS preload list eligibility.
           * Note: HTTPS termination handled by reverse proxy (nginx/Caddy).
           *
           * @see https://hstspreload.org/
           */
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          /**
           * Content-Security-Policy.
           *
           * Primary security control for resource loading.
           * Dynamically built based on environment configuration.
           *
           * @see buildCSP function for directive details
           */
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          /**
           * X-Content-Type-Options.
           *
           * Prevents MIME type sniffing attacks by forcing browsers
           * to respect the declared Content-Type.
           */
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          /**
           * X-Frame-Options (legacy clickjacking protection).
           *
           * DENY prevents embedding in any frame.
           * This is a backup for older browsers; CSP frame-ancestors is primary.
           */
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          /**
           * Referrer-Policy.
           *
           * Sends full referrer for same-origin requests,
           * only origin for cross-origin HTTPS requests,
           * and nothing for downgrade (HTTPS to HTTP).
           */
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          /**
           * Permissions-Policy.
           *
           * Restricts access to browser features:
           * - camera: disabled (not needed)
           * - geolocation: disabled (not needed)
           * - microphone: self only (required for audio recording)
           */
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(self)",
          },
          /**
           * X-XSS-Protection (legacy XSS filter).
           *
           * Enables browser XSS filtering with blocking mode.
           * Deprecated in modern browsers; CSP is the primary protection.
           */
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          /**
           * X-DNS-Prefetch-Control.
           *
           * Disables DNS prefetching for privacy.
           * Prevents browsers from preemptively resolving external domains.
           */
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
        ],
      },
      /**
       * Service Worker specific headers for PWA support.
       *
       * - Content-Type: Ensures correct MIME type for JavaScript
       * - Cache-Control: Forces revalidation to ensure SW updates propagate
       * - Service-Worker-Allowed: Allows SW to control the entire origin
       */
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
