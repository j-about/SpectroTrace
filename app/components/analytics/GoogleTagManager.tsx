/**
 * @fileoverview Google Tag Manager integration components for analytics.
 *
 * Provides GTM script injection following Google's official implementation:
 * - Head script for dataLayer initialization and GTM loader
 * - Body noscript fallback for non-JavaScript environments
 *
 * @module components/analytics/GoogleTagManager
 */

import Script from "next/script";

/**
 * Google Tag Manager container ID from environment variables.
 * When undefined or empty, GTM components render nothing.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Google Tag Manager head script component.
 *
 * Injects the GTM loader script as high as possible in the document.
 * Uses `afterInteractive` strategy to load after page becomes interactive,
 * preventing render-blocking while ensuring GTM loads early.
 *
 * @returns GTM script element or null if GTM_ID is not configured
 *
 * @example
 * // In app/layout.tsx <head> section:
 * <GoogleTagManagerScript />
 */
export function GoogleTagManagerScript() {
  if (!GTM_ID) {
    return null;
  }

  return (
    <Script
      id="gtm-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `,
      }}
    />
  );
}

/**
 * Google Tag Manager noscript fallback component.
 *
 * Provides tracking for users with JavaScript disabled via an iframe.
 * Should be placed immediately after the opening <body> tag.
 *
 * @returns GTM noscript iframe element or null if GTM_ID is not configured
 *
 * @example
 * // In app/layout.tsx <body> section:
 * <body>
 *   <GoogleTagManagerNoScript />
 *   {children}
 * </body>
 */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
