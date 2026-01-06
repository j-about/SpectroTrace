/**
 * @fileoverview FAQ data for SpectroTrace.
 *
 * Centralized FAQ content used for both the FAQ page UI
 * and JSON-LD structured data generation.
 *
 * @module lib/seo/faq-data
 */

/**
 * FAQ item with question, answer, and category.
 */
export interface FAQItem {
  /** The question text */
  question: string;
  /** The answer text */
  answer: string;
  /** Category for grouping FAQs */
  category: "general" | "technical" | "usage" | "privacy";
}

/**
 * All FAQ items for SpectroTrace.
 */
export const FAQ_DATA: FAQItem[] = [
  // General Questions
  {
    question: "What is SpectroTrace?",
    answer:
      "SpectroTrace is a free web application that converts images into audio files. When you play the generated audio through a spectrogram analyzer, the original image is revealed. It's a fun way to hide pictures in sound!",
    category: "general",
  },
  {
    question: "Is SpectroTrace free to use?",
    answer:
      "Yes, SpectroTrace is completely free and open source under the MIT license. You can use it as much as you want without any cost or limitations.",
    category: "general",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is needed. Just visit the website and start converting images immediately. There's no sign-up, no login, and no personal information required.",
    category: "general",
  },
  {
    question: "What is a spectrogram?",
    answer:
      "A spectrogram is a visual representation of sound that shows frequency (pitch) on the vertical axis and time on the horizontal axis, with color or brightness indicating loudness. It lets you see the hidden patterns in any audio.",
    category: "general",
  },
  {
    question: "Why was SpectroTrace created?",
    answer:
      "I discovered that some electronic musicians, like Aphex Twin, had been hiding images in their tracks since the 1990s — visible only through spectrogram analysis. The leading tool for this, Photosounder, costs around €87 and offers many professional features. I wanted something simpler: a free, intuitive tool that lets anyone experiment with this fascinating technique in seconds, right in the browser.",
    category: "general",
  },

  // Technical Questions
  {
    question: "How does the image-to-audio conversion work?",
    answer:
      "SpectroTrace uses additive synthesis to convert images. Each column of pixels becomes a moment in time, each row maps to a frequency, and pixel brightness determines volume. These are combined into sine waves that form the final audio.",
    category: "technical",
  },
  {
    question: "What audio format is generated?",
    answer:
      "SpectroTrace generates standard WAV audio files at configurable sample rates (22050Hz, 44100Hz, or 48000Hz). WAV is uncompressed and works with virtually all audio software and spectrogram analyzers.",
    category: "technical",
  },
  {
    question: "What is additive synthesis?",
    answer:
      "Additive synthesis builds complex sounds by combining simple sine waves at different frequencies and amplitudes. It's based on the mathematical principle that any sound can be created by adding together pure tones.",
    category: "technical",
  },
  {
    question: "Why do some images work better than others?",
    answer:
      "High-contrast images with clear shapes work best because brightness differences translate to volume differences in the audio. Detailed photos may appear blurry in the spectrogram, while simple graphics, text, and logos produce crisp results.",
    category: "technical",
  },

  // Usage Questions
  {
    question: "What image formats are supported?",
    answer:
      "SpectroTrace supports PNG, JPG, WebP, BMP, SVG, TIFF, and HEIC formats. Maximum file size is 50MB and maximum resolution is 8192x8192 pixels. Larger images are automatically downscaled.",
    category: "usage",
  },
  {
    question: "How do I view the hidden image in the audio?",
    answer:
      "Download the generated WAV file and open it in any spectrogram viewer or audio analysis software. Popular free options include Audacity, Sonic Visualiser, or online spectrogram tools. The image will appear as you play the audio.",
    category: "usage",
  },
  {
    question: "What's the difference between Basic and Advanced modes?",
    answer:
      "Basic mode uses optimized default settings for quick, one-click conversion. Advanced mode gives you full control over duration, frequency range, sample rate, brightness curves, and smoothing for fine-tuned results.",
    category: "usage",
  },
  {
    question: "Can I use SpectroTrace offline?",
    answer:
      "Yes! SpectroTrace is a Progressive Web App (PWA) that works offline after your first visit. You can even install it on your device for a native app-like experience.",
    category: "usage",
  },

  // Privacy Questions
  {
    question: "Are my images uploaded to a server?",
    answer:
      "No. All image processing happens entirely in your web browser using JavaScript and the Web Audio API. Your images never leave your device - they're processed locally and I never see or store them.",
    category: "privacy",
  },
  {
    question: "What data does SpectroTrace collect?",
    answer:
      "SpectroTrace does not collect any personal data or image data. If analytics are enabled (optional), standard anonymous website analytics may be collected. See the Privacy Policy in the Legal Notice for full details.",
    category: "privacy",
  },
  {
    question: "Is my generated audio stored anywhere?",
    answer:
      "No. Generated audio exists only in your browser memory until you download it or close the page. Nothing is uploaded, stored, or transmitted to any server.",
    category: "privacy",
  },
];
