/**
 * @fileoverview Root layout component for SpectroTrace Next.js application.
 *
 * Configures:
 * - HTML metadata (SEO, OpenGraph, Twitter cards)
 * - Viewport settings for mobile
 * - Global providers and components (Toaster, PWA components)
 * - Dark theme by default
 *
 * @module app/layout
 */

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import {
  GoogleTagManagerScript,
  GoogleTagManagerNoScript,
} from "@/components/analytics/GoogleTagManager";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
  title: "SpectroTrace",
  description:
    "🎨🔊 Transform images into audio that reveals the original picture when viewed as a spectrogram. Free & Open Source, offline-capable web application with no account required.",
  authors: [{ name: "Jonathan About", url: "https://www.jonathan-about.com" }],
  creator: "Jonathan About",
  publisher: "Jonathan About",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SpectroTrace",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
    title: "SpectroTrace",
    description:
      "🎨🔊 Transform images into audio that reveals the original picture when viewed as a spectrogram. Free & Open Source, offline-capable web application with no account required.",
    siteName: "SpectroTrace",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpectroTrace",
    description:
      "🎨🔊 Transform images into audio that reveals the original picture when viewed as a spectrogram. Free & Open Source, offline-capable web application with no account required.",
    creator: "@JonathanAbout",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Root layout component wrapping all pages.
 *
 * Provides:
 * - HTML structure with dark theme
 * - Toast notification system (bottom-right position)
 * - Service worker registration for offline capability
 * - PWA install prompt for eligible browsers
 *
 * @param props - Layout props
 * @param props.children - Page content to render
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <GoogleTagManagerScript />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <GoogleTagManagerNoScript />
        {children}
        <Toaster position="bottom-right" richColors />
        <ServiceWorkerRegistrar />
        <InstallPrompt />
      </body>
    </html>
  );
}
