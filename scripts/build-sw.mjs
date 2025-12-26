#!/usr/bin/env node
/**
 * Build script for SpectroTrace Service Worker
 * Bundles Workbox modules into a single file using esbuild
 *
 * Run with: node scripts/build-sw.mjs
 * Production: NODE_ENV=production node scripts/build-sw.mjs
 */

import * as esbuild from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getExternalDomains } from "../app/config/external-domains.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

async function buildServiceWorker() {
  const isProd = process.env.NODE_ENV === "production";
  const externalDomains = getExternalDomains();

  console.log(
    `Building service worker (${isProd ? "production" : "development"})...`
  );
  console.log(
    `External domains for SW bypass: ${externalDomains.join(", ") || "(none)"}`
  );

  const result = await esbuild.build({
    entryPoints: [join(rootDir, "app/sw/sw.ts")],
    bundle: true,
    outfile: join(rootDir, "public/sw.js"),
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    minify: isProd,
    sourcemap: isProd ? false : "inline",
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        isProd ? "production" : "development"
      ),
      SW_EXTERNAL_DOMAINS: JSON.stringify(externalDomains),
    },
    treeShaking: true,
    logLevel: "info",
    metafile: true,
  });

  const analysis = await esbuild.analyzeMetafile(result.metafile, {
    verbose: false,
  });
  console.log("\nBundle analysis:");
  console.log(analysis);

  console.log("\nService worker built successfully!");
}

buildServiceWorker().catch((error) => {
  console.error("Failed to build service worker:", error);
  process.exit(1);
});
