/**
 * @fileoverview JSON-LD structured data component for SEO.
 *
 * Provides a type-safe component for injecting schema.org structured data
 * into pages for enhanced search engine visibility.
 *
 * @module components/seo/JsonLd
 */

/**
 * Props for the JsonLd component.
 */
interface JsonLdProps {
  /** The structured data object to inject as JSON-LD */
  data: Record<string, unknown>;
}

/**
 * Injects JSON-LD structured data into the page head.
 *
 * @example
 * ```tsx
 * <JsonLd data={{
 *   "@context": "https://schema.org",
 *   "@type": "WebSite",
 *   name: "SpectroTrace"
 * }} />
 * ```
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
