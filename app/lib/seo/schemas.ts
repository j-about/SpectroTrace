/**
 * @fileoverview JSON-LD schema generators for SpectroTrace SEO.
 *
 * Provides factory functions for creating schema.org structured data
 * to enhance search engine visibility and enable rich results.
 *
 * @module lib/seo/schemas
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/**
 * Generates WebSite schema for the root page.
 *
 * @see https://schema.org/WebSite
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SpectroTrace",
    url: BASE_URL,
    description:
      "🎨🔊 Transform images into audio that reveals the original picture when viewed as a spectrogram. Free & Open Source, offline-capable web application with no account required.",
    publisher: {
      "@type": "Person",
      name: "Jonathan About",
      url: "https://www.jonathan-about.com",
    },
  };
}

/**
 * Generates Person schema for the developer.
 *
 * @see https://schema.org/Person
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jonathan About",
    url: "https://www.jonathan-about.com",
    sameAs: [
      "https://www.linkedin.com/in/jonathan-about/",
      "https://github.com/j-about",
      "https://codepen.io/j_about",
      "https://knowledge.jonathan-about.com/",
      "https://x.com/JonathanAbout",
    ],
  };
}

/**
 * Generates SoftwareApplication schema for the PWA.
 *
 * @see https://schema.org/SoftwareApplication
 */
export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SpectroTrace",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web Browser)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Image to audio spectrogram conversion",
      "Offline-capable PWA",
      "No account required",
      "Client-side processing",
      "Multiple audio parameter controls",
    ],
  };
}

/**
 * Generates BreadcrumbList schema for navigation.
 *
 * @param items - Array of breadcrumb items with name and URL
 * @see https://schema.org/BreadcrumbList
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generates FAQPage schema from FAQ items.
 *
 * @param faqs - Array of FAQ items with question and answer
 * @see https://schema.org/FAQPage
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates HowTo schema for the conversion process.
 *
 * @see https://schema.org/HowTo
 */
export function getHowToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Convert an Image to Audio Spectrogram",
    description:
      "Learn how to transform any image into audio that reveals the original picture when analyzed with a spectrogram viewer.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        name: "Upload Your Image",
        text: "Select an image from your device. Supported formats include PNG, JPG, WebP, BMP, SVG, TIFF, and HEIC.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Crop and Adjust",
        text: "Optionally crop your image to focus on specific areas. The cropped region will be converted to audio.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Configure Settings (Optional)",
        text: "In Advanced mode, adjust duration, frequency range, sample rate, and other parameters for fine-tuned results.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Generate Audio",
        text: "Click the Generate Audio button to convert your image using additive synthesis.",
        position: 4,
      },
      {
        "@type": "HowToStep",
        name: "Download and View",
        text: "Download the WAV file and open it in any spectrogram analyzer (like Audacity or Sonic Visualiser) to see your original image.",
        position: 5,
      },
    ],
    tool: {
      "@type": "HowToTool",
      name: "SpectroTrace Web Application",
    },
  };
}
