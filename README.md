# SpectroTrace

🎨🔊 Transform images into audio that reveals the original picture when viewed as a spectrogram. Free, offline-capable PWA with no account required.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.12.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Technical Architecture](#technical-architecture)
- [Modes](#modes)
- [Conversion Parameters](#conversion-parameters)
- [File Limits](#file-limits)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [PWA \& Offline Support](#pwa--offline-support)
- [Security \& Privacy](#security--privacy)
- [Support the Project](#support-the-project)
- [Tech Stack](#tech-stack)
- [License](#license)

## Features

- Image to audio spectrogram conversion via additive synthesis
- Basic and Advanced modes for different use cases
- Real-time waveform and spectrogram visualization
- Offline-capable PWA with service worker caching
- No accounts, no data uploads
- Optional support via Stripe tipping

## Requirements

- **Node.js**: >= 24.12.0
- **Browser**: Modern browser with Web Audio API support (Chrome, Firefox, Safari, Edge)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/j-about/SpectroTrace.git
cd SpectroTrace

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

| Variable               | Required | Default                 | Description                                                       |
| ---------------------- | -------- | ----------------------- | ----------------------------------------------------------------- |
| `NODE_ENV`             | No       | `development`           | Node environment (`development`, `production`, `test`)            |
| `NEXT_PUBLIC_BASE_URL` | No       | `http://localhost:3000` | Canonical base URL for SEO metadata, sitemaps, and OpenGraph tags |
| `NEXT_PUBLIC_GTM_ID`   | No       | (empty)                 | Google Tag Manager container ID (format: GTM-XXXXXXXX)            |

For production deployment, set `NEXT_PUBLIC_BASE_URL` to your domain (e.g., `https://www.spectrotrace.org`).

### Content Security Policy Extensions

When `NEXT_PUBLIC_GTM_ID` is configured, additional CSP domains can be whitelisted via environment variables. These are useful for Google Analytics, Google Ads, or other third-party services added through GTM.

| Variable                      | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_CSP_CONNECT_SRC` | Additional connection sources (space-separated URLs) |
| `NEXT_PUBLIC_CSP_FONT_SRC`    | Additional font sources (space-separated URLs)       |
| `NEXT_PUBLIC_CSP_FRAME_SRC`   | Additional frame sources (space-separated URLs)      |
| `NEXT_PUBLIC_CSP_IMG_SRC`     | Additional image sources (space-separated URLs)      |
| `NEXT_PUBLIC_CSP_SCRIPT_SRC`  | Additional script sources (space-separated URLs)     |
| `NEXT_PUBLIC_CSP_STYLE_SRC`   | Additional style sources (space-separated URLs)      |

These variables also configure which external domains bypass service worker caching, ensuring analytics and tracking requests are never served from cache.

See [Google's CSP guide](https://developers.google.com/tag-platform/security/guides/csp) for required domains per service.

## Technical Architecture

### Processing Pipeline

```
Image Upload → Validation → Canvas Processing → Grayscale Conversion
                                                        ↓
                                        Float32Array (0-1 per pixel)
                                                        ↓
Web Worker ← Transfer ArrayBuffer ← Main Thread
     ↓
Additive Synthesis → PCM Generation → WAV Encoding → Blob
     ↓
Main Thread ← Transferable ArrayBuffer ← WAV Result
     ↓
Waveform Display + Spectrogram + Download
```

### Web Worker Architecture

Audio generation runs in a dedicated Web Worker to keep the UI responsive:

- **Main Thread**: UI rendering, image processing, playback controls
- **Worker Thread**: Additive synthesis, PCM generation, WAV encoding
- **Communication**: Typed messages with Transferable ArrayBuffer for zero-copy data transfer
- **Cancellation**: Job-based tracking with graceful cancellation support

### Additive Synthesis Algorithm

The core algorithm (`app/lib/audio/generateFromImage.ts`) converts images to audio:

1. Each image column becomes a time slice
2. Each row maps to a frequency (configurable scale)
3. Pixel brightness determines amplitude at that frequency
4. Sinusoids are summed using additive synthesis
5. Output is normalized with headroom to prevent clipping

## Modes

### Basic Mode

Uses default parameters for quick one-click conversion. Best for users who want simple results without configuration.

### Advanced Mode

Full control over all conversion parameters. Access via the mode toggle in the header.

## Conversion Parameters

| Parameter        | Range                          | Default     | Description                           |
| ---------------- | ------------------------------ | ----------- | ------------------------------------- |
| Duration         | 1-60s                          | 8s          | Length of generated audio             |
| Min Frequency    | 20-2000 Hz                     | 50 Hz       | Lowest frequency in output            |
| Max Frequency    | 500-22000 Hz                   | 16000 Hz    | Highest frequency in output           |
| Sample Rate      | 22050/44100/48000 Hz           | 44100 Hz    | Audio sample rate                     |
| Frequency Scale  | logarithmic/linear             | logarithmic | How rows map to frequencies           |
| Brightness Curve | linear/exponential/logarithmic | linear      | How brightness maps to amplitude      |
| Smoothing        | 0-100%                         | 15%         | Reduces abrupt changes between frames |
| Invert Image     | true/false                     | false       | Swap bright/dark interpretation       |

## File Limits

| Limit             | Value                                |
| ----------------- | ------------------------------------ |
| Max File Size     | 50 MB                                |
| Max Resolution    | 8192 x 8192 pixels                   |
| Supported Formats | PNG, JPG, WebP, BMP, SVG, TIFF, HEIC |

Images exceeding the resolution limit are automatically downscaled during processing.

## Project Structure

```
app/
├── page.tsx               # Main application page
├── legal-notice/          # Legal Notice page (LCEN compliance)
├── layout.tsx             # Root layout with PWA integration
├── manifest.ts            # PWA manifest configuration
├── globals.css            # Tailwind CSS theme
│
├── config/
│   └── external-domains.mjs  # Shared GTM/CSP domain configuration
│
├── components/
│   ├── ui/                # shadcn/ui component library
│   ├── layout/            # Header, Footer
│   ├── ImageUpload/       # Image upload with cropper
│   ├── AudioControls/     # Advanced parameter controls
│   ├── Visualizer/        # Waveform and Spectrogram
│   ├── ExportButton/      # WAV download
│   ├── TipPrompt/         # Optional tipping modal
│   ├── pwa/               # Service worker and install prompt
│   └── analytics/         # Google Tag Manager integration
│
├── lib/
│   ├── audio/             # Audio generation and WAV encoding
│   ├── image/             # Image processing utilities
│   └── utils.ts           # Shared utilities
│
├── hooks/                 # Custom React hooks
│   ├── useConversionParams.ts
│   ├── useGeneration.ts
│   └── useAudioWorker.ts
│
├── sw/
│   └── sw.ts              # Service worker (Workbox, bundled via esbuild)
│
└── workers/
    └── audioWorker.ts     # Web Worker for audio generation
```

## Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start development server     |
| `npm run build`        | Build for production         |
| `npm run start`        | Start production server      |
| `npm run lint`         | Run ESLint                   |
| `npm run lint:fix`     | Run ESLint with auto-fix     |
| `npm run type-check`   | Run TypeScript type checking |
| `npm run format`       | Format code with Prettier    |
| `npm run format:check` | Check code formatting        |

## PWA & Offline Support

SpectroTrace works offline after the first visit:

- **Service Worker**: Caches application shell and assets
- **Workbox**: Provides caching strategies and precaching
- **Install Prompt**: Native app installation on supported platforms
- **Standalone Mode**: Full-screen experience when installed

### Service Worker Build Process

The service worker is built separately using esbuild:

- **Source**: `app/sw/sw.ts`
- **Output**: `public/sw.js`
- **Build script**: `scripts/build-sw.mjs`

The `dev` and `build` commands automatically rebuild the service worker. For manual rebuilds:

| Command                 | Purpose                             |
| ----------------------- | ----------------------------------- |
| `npm run build:sw`      | Development build (with sourcemaps) |
| `npm run build:sw:prod` | Production build (minified)         |

#### External Domain Configuration

External domains that bypass service worker caching are configured via environment variables:

- When `NEXT_PUBLIC_GTM_ID` is set, GTM script and connect domains automatically bypass caching
- Additional domains from `NEXT_PUBLIC_CSP_CONNECT_SRC` and `NEXT_PUBLIC_CSP_SCRIPT_SRC` also bypass caching
- This shared configuration (`app/config/external-domains.mjs`) is used by both the CSP headers and service worker

## Security & Privacy

### Privacy Guarantees

- **No user accounts**: No registration or login required
- **Client-side processing**: All image and audio processing happens in your browser
- **No data uploads**: Images and generated audio never leave your device

### Security Headers

| Header                    | Value                                          | Purpose                       |
| ------------------------- | ---------------------------------------------- | ----------------------------- |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | Enforces HTTPS                |
| Content-Security-Policy   | Restrictive CSP                                | Limits resource loading       |
| X-Content-Type-Options    | `nosniff`                                      | Prevents MIME type sniffing   |
| X-Frame-Options           | `DENY`                                         | Prevents clickjacking         |
| Referrer-Policy           | `strict-origin-when-cross-origin`              | Controls referrer info        |
| Permissions-Policy        | `camera=(), geolocation=(), microphone=(self)` | Restricts browser features    |
| X-XSS-Protection          | `1; mode=block`                                | Enables browser XSS filtering |
| X-DNS-Prefetch-Control    | `off`                                          | Disables DNS prefetching      |

### External Dependencies

| Resource           | Domain                     | Purpose                                   |
| ------------------ | -------------------------- | ----------------------------------------- |
| Stripe (optional)  | `buy.stripe.com`           | Tipping (opens in new tab)                |
| Google Tag Manager | `www.googletagmanager.com` | Analytics (optional, disabled by default) |

When GTM is enabled, only core GTM domains are whitelisted by default. Additional domains (Google Analytics, Google Ads, etc.) can be configured via `NEXT_PUBLIC_CSP_*` environment variables.

### Deployment Security

For self-hosted deployments:

- Configure HTTPS with valid certificates
- Enable HTTP to HTTPS redirects
- Use automated certificate renewal (Let's Encrypt)

### Reporting Security Issues

Report vulnerabilities via [GitHub Security Advisories](https://github.com/j-about/SpectroTrace/security/advisories/new). Do not open public issues for security vulnerabilities.

## Support the Project

SpectroTrace is free and open source. If you find it useful, consider leaving a tip via the beer icon in the header. Tips are processed securely through Stripe Payment Links.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9 (strict mode)
- **UI**: React 19, Radix UI, shadcn/ui
- **Styling**: Tailwind CSS 4
- **Audio**: Web Audio API, wavesurfer.js
- **PWA**: Workbox

## License

[MIT](LICENSE)

---

[⬆ Back to top](#spectrotrace)
