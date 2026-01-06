/**
 * @fileoverview FAQ page for SpectroTrace application.
 *
 * Provides comprehensive answers to frequently asked questions about
 * the application, organized by category with an accessible accordion
 * interface and JSON-LD structured data for rich search results.
 *
 * @module app/faq/page
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/seo/schemas";
import { FAQ_DATA } from "@/lib/seo/faq-data";
import { FAQAccordion } from "@/components/faq";

export const metadata: Metadata = {
  title: "FAQ | SpectroTrace",
  description:
    "Frequently asked questions about SpectroTrace image-to-audio converter. Learn about spectrograms, additive synthesis, supported formats, and privacy.",
  openGraph: {
    title: "FAQ | SpectroTrace",
    description: "Find answers to common questions about SpectroTrace.",
    type: "website",
  },
};

/**
 * FAQ page component.
 *
 * Renders categorized FAQ sections with expandable accordion panels.
 * Includes JSON-LD structured data for enhanced search visibility.
 */
export default function FAQPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  // Prepare FAQ data for JSON-LD schema
  const faqSchemaData = FAQ_DATA.map(({ question, answer }) => ({
    question,
    answer,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={getFAQSchema(faqSchemaData)} />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "FAQ", url: `${baseUrl}/faq` },
        ])}
      />

      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h1 className="mb-4 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-center">
            Find answers to common questions about SpectroTrace. Can&apos;t find
            what you&apos;re looking for?{" "}
            <a
              href="mailto:contact@spectrotrace.org"
              className="hover:text-primary underline underline-offset-4"
            >
              Contact me
            </a>
            .
          </p>

          <div className="mx-auto max-w-3xl">
            {/* General Questions */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">General</h2>
              <FAQAccordion
                items={FAQ_DATA.filter((f) => f.category === "general")}
              />
            </section>

            {/* Technical Questions */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Technical</h2>
              <FAQAccordion
                items={FAQ_DATA.filter((f) => f.category === "technical")}
              />
            </section>

            {/* Usage Questions */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Usage</h2>
              <FAQAccordion
                items={FAQ_DATA.filter((f) => f.category === "usage")}
              />
            </section>

            {/* Privacy Questions */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">
                Privacy and Security
              </h2>
              <FAQAccordion
                items={FAQ_DATA.filter((f) => f.category === "privacy")}
              />
            </section>
          </div>

          {/* Navigation Links */}
          <section className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Want to learn more about the technology?{" "}
              <Link
                href="/how-it-works"
                className="hover:text-primary underline underline-offset-4"
              >
                How It Works
              </Link>
            </p>
            <Link
              href="/"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 font-medium transition-colors"
            >
              Try SpectroTrace
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
