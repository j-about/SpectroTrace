/**
 * @fileoverview Shared external domain configuration.
 *
 * Centralizes domain allowlists for:
 * - Content Security Policy (CSP) headers
 * - Service Worker NetworkOnly routing
 *
 * When NEXT_PUBLIC_GTM_ID is set, base GTM domains are automatically included.
 * Additional domains can be added via NEXT_PUBLIC_CSP_* environment variables.
 *
 * @module config/external-domains
 * @see https://developers.google.com/tag-platform/security/guides/csp
 */

/**
 * Base GTM domains (always included when GTM is enabled).
 *
 * These are the core Google infrastructure domains required for
 * Google Tag Manager and Google Analytics to function properly.
 * Used by next.config.ts for CSP header generation.
 *
 * @see https://developers.google.com/tag-platform/security/guides/csp
 */
export const GTM_BASE_DOMAINS = {
  connect: ["https://www.googletagmanager.com", "https://www.google.com"],
  font: ["https://fonts.gstatic.com"],
  img: [
    "https://www.googletagmanager.com",
    "https://googletagmanager.com",
    "https://ssl.gstatic.com",
    "https://www.gstatic.com",
  ],
  script: [
    "https://www.googletagmanager.com",
    "https://googletagmanager.com",
    "https://tagmanager.google.com",
  ],
  style: [
    "https://googletagmanager.com",
    "https://tagmanager.google.com",
    "https://fonts.googleapis.com",
  ],
};

/**
 * Domains that must bypass service worker caching (NetworkOnly).
 *
 * Only script and connect domains need NetworkOnly strategy:
 * - Script domains: GTM container must load fresh to ensure latest version
 * - Connect domains: Analytics beacons should not be cached
 *
 * Font, image, and style domains can be safely cached.
 *
 * @see https://developer.chrome.com/docs/workbox/caching-resources-during-runtime
 */
const SW_BYPASS_DIRECTIVES = ["connect", "script"];

/**
 * Parses space-separated URLs from an environment variable.
 *
 * @param {string | undefined} envVar - The environment variable value
 * @returns {string[]} Array of parsed URLs
 */
function parseEnvUrls(envVar) {
  return envVar ? envVar.split(/\s+/).filter(Boolean) : [];
}

/**
 * Extracts hostname from a URL, returning null if invalid.
 *
 * @param {string} url - The URL to parse
 * @returns {string | null} The hostname or null if parsing fails
 */
function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Builds the complete list of external domain hostnames for service worker bypass.
 *
 * Only includes domains that require NetworkOnly strategy:
 * - GTM script domains (must load fresh)
 * - GTM connect domains (analytics beacons)
 * - NEXT_PUBLIC_CSP_CONNECT_SRC and NEXT_PUBLIC_CSP_SCRIPT_SRC domains
 *
 * @returns {string[]} Array of hostnames to bypass caching
 */
export function getExternalDomains() {
  const domains = new Set();

  // Add GTM script and connect domains if GTM is enabled
  if (process.env.NEXT_PUBLIC_GTM_ID) {
    SW_BYPASS_DIRECTIVES.forEach((directive) => {
      GTM_BASE_DOMAINS[directive]?.forEach((url) => {
        const host = extractHostname(url);
        if (host) domains.add(host);
      });
    });
  }

  // Add domains from CSP environment variables (only script and connect)
  const cspEnvVars = [
    process.env.NEXT_PUBLIC_CSP_CONNECT_SRC,
    process.env.NEXT_PUBLIC_CSP_SCRIPT_SRC,
  ];

  cspEnvVars.forEach((envVar) => {
    parseEnvUrls(envVar).forEach((url) => {
      const host = extractHostname(url);
      if (host) domains.add(host);
    });
  });

  return Array.from(domains);
}
