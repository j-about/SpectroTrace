/**
 * @fileoverview How It Works page for SpectroTrace application.
 *
 * Provides an accessible, user-friendly explanation of:
 * - What spectrograms are and how they visualize sound
 * - How additive synthesis works
 * - The image-to-audio conversion process
 * - Tips for achieving the best results
 *
 * @module app/how-it-works/page
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHowToSchema, getBreadcrumbSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = {
  title: "How It Works | SpectroTrace",
  description:
    "Learn how SpectroTrace transforms images into audio using additive synthesis. Discover the science behind spectrograms and image-to-sound conversion.",
  openGraph: {
    title: "How It Works | SpectroTrace",
    description:
      "Learn how SpectroTrace transforms images into audio spectrograms.",
    type: "article",
  },
};

/**
 * How It Works page component.
 *
 * Renders educational content about the spectrogram generation process
 * in a friendly, accessible manner suitable for general audiences.
 */
export default function HowItWorksPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={getHowToSchema()} />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: baseUrl },
          { name: "How It Works", url: `${baseUrl}/how-it-works` },
        ])}
      />

      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h1 className="mb-4 text-center text-2xl font-bold">
            How SpectroTrace Works
          </h1>

          {/* Introduction */}
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-muted-foreground mb-4">
              SpectroTrace uses a clever audio technique to hide images inside
              sound. When you play the generated audio through a spectrogram
              analyzer, the hidden image is revealed. Here&apos;s how it all
              works.
            </p>
          </section>

          {/* The Inspiration */}
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-4 text-lg font-semibold">The Inspiration</h2>
            <p className="text-muted-foreground mb-4">
              This technique has been used by musicians for decades. In the
              1990s, electronic artist Aphex Twin famously hid images in tracks
              like &ldquo;Windowlicker&rdquo; &mdash; including a haunting face
              that only appears when you view the audio through a spectrogram
              analyzer.
            </p>
            <p className="text-muted-foreground">
              I thought this was fascinating, but the leading tool for creating
              spectrogram art, Photosounder, costs around &euro;87 and offers
              many professional features that can feel overwhelming for simple
              experimentation. SpectroTrace was born from a simple idea: make
              this creative technique accessible to everyone, for free, right in
              the browser.
            </p>
          </section>

          {/* What is a Spectrogram */}
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-4 text-lg font-semibold">
              What is a Spectrogram?
            </h2>
            <p className="text-muted-foreground mb-4">
              A spectrogram is a visual way to see sound. It shows three things
              at once:
            </p>
            <ul className="text-muted-foreground mx-auto mb-4 max-w-lg list-inside list-disc space-y-2 text-left">
              <li>
                <strong className="text-foreground">Time</strong> &mdash; moving
                from left to right
              </li>
              <li>
                <strong className="text-foreground">Frequency</strong> &mdash;
                low sounds at the bottom, high sounds at the top
              </li>
              <li>
                <strong className="text-foreground">Loudness</strong> &mdash;
                brighter colors mean louder sounds
              </li>
            </ul>
            <p className="text-muted-foreground">
              Musicians, scientists, and audio engineers use spectrograms to
              analyze sounds. You might have seen them as colorful waveform
              displays in music software.
            </p>
          </section>

          {/* The Conversion Process */}
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-4 text-lg font-semibold">
              The Conversion Process
            </h2>
            <p className="text-muted-foreground mb-4">
              SpectroTrace works by reversing the spectrogram process. Instead
              of turning sound into a picture, it turns a picture into sound:
            </p>
            <ol className="text-muted-foreground mx-auto mb-4 max-w-xl list-inside list-decimal space-y-3 text-left">
              <li>
                <strong className="text-foreground">Image Analysis</strong>{" "}
                &mdash; Your image is converted to grayscale and divided into
                vertical columns (time slices).
              </li>
              <li>
                <strong className="text-foreground">Frequency Mapping</strong>{" "}
                &mdash; Each row of pixels is assigned a musical frequency. The
                top row becomes high-pitched sounds, the bottom row becomes
                low-pitched sounds.
              </li>
              <li>
                <strong className="text-foreground">
                  Brightness to Volume
                </strong>{" "}
                &mdash; Bright pixels create loud sounds, dark pixels create
                quiet sounds (or silence).
              </li>
              <li>
                <strong className="text-foreground">Additive Synthesis</strong>{" "}
                &mdash; All these frequencies are combined using sine waves,
                creating the final audio.
              </li>
            </ol>
          </section>

          {/* What is Additive Synthesis */}
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-4 text-lg font-semibold">
              What is Additive Synthesis?
            </h2>
            <p className="text-muted-foreground mb-4">
              Additive synthesis is a sound creation technique that builds
              complex sounds by combining simple sine waves. Think of it like
              mixing colors &mdash; by combining basic building blocks, you can
              create anything.
            </p>
            <p className="text-muted-foreground">
              For each moment in time, SpectroTrace adds together hundreds or
              thousands of sine waves, each at a different frequency and volume
              based on the corresponding pixel brightness.
            </p>
          </section>

          {/* Tips for Best Results */}
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-4 text-lg font-semibold">
              Tips for Best Results
            </h2>
            <ul className="text-muted-foreground mx-auto max-w-xl list-inside list-disc space-y-2 text-left">
              <li>
                Use high-contrast images &mdash; the clearer the contrast, the
                clearer the result
              </li>
              <li>Simple images work better than complex photos</li>
              <li>Text and logos produce excellent results</li>
              <li>
                Use the crop tool to focus on the most important part of your
                image
              </li>
              <li>
                In Advanced mode, longer durations give more detail but larger
                files
              </li>
            </ul>
          </section>

          {/* Privacy Note */}
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-4 text-lg font-semibold">Privacy and Security</h2>
            <p className="text-muted-foreground">
              All processing happens directly in your browser using JavaScript
              and the Web Audio API. Your images are never uploaded to any
              server. Once you close the page, everything is gone &mdash; I
              never store or see your files.
            </p>
          </section>

          {/* CTA */}
          <section className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Have questions?{" "}
              <Link
                href="/faq"
                className="hover:text-primary underline underline-offset-4"
              >
                Check the FAQ
              </Link>
            </p>
            <Link
              href="/"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 font-medium transition-colors"
            >
              Try It Now
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
