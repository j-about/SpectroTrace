/**
 * @fileoverview Legal Notice page for SpectroTrace application.
 *
 * Displays mandatory legal information as required by French LCEN
 * (Loi pour la Confiance dans l'Économie Numérique) including:
 * - Website owner identification and contact details
 * - Business registration numbers (RCS, SIREN)
 * - Hosting provider information
 * - Privacy policy and GDPR compliance information
 * - Terms of Use governing service usage
 *
 * @module app/legal-notice/page
 */

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Legal Notice | SpectroTrace",
  description:
    "Legal information, mandatory disclosures, privacy policy, and terms of use for SpectroTrace website",
};

/**
 * Legal Notice page component.
 *
 * Renders legally required information about the website owner,
 * hosting provider, and privacy policy in a simple, accessible format
 * using semantic HTML.
 */
export default function LegalNoticePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="mb-8 text-2xl font-bold">Legal Notice</h1>

          {/* Website Owner Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Website Owner</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-muted-foreground text-sm">Name</dt>
                <dd>Jonathan About</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">Address</dt>
                <dd>
                  11 Rue du Faubourg Saint Martin
                  <br />
                  75010 Paris, France
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">Email</dt>
                <dd>
                  <a
                    href="mailto:contact@spectrotrace.org"
                    className="hover:text-primary underline underline-offset-4"
                  >
                    contact@spectrotrace.org
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">Phone</dt>
                <dd>
                  <a
                    href="tel:+33183644580"
                    className="hover:text-primary underline underline-offset-4"
                  >
                    +33 1 83 64 45 80
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">RCS</dt>
                <dd>835137456 R.C.S. Paris</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">SIREN</dt>
                <dd>835137456</dd>
              </div>
            </dl>
          </section>

          {/* Hosting Provider Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Hosting Provider</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-muted-foreground text-sm">Company</dt>
                <dd>OVH SAS</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">Address</dt>
                <dd>
                  2 Rue Kellermann
                  <br />
                  59100 Roubaix, France
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">Phone</dt>
                <dd>
                  <a
                    href="tel:+33972101007"
                    className="hover:text-primary underline underline-offset-4"
                  >
                    +33 9 72 10 10 07
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          {/* Privacy Policy Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Privacy Policy</h2>

            <div className="space-y-6">
              {/* Data Controller */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Data Controller
                </h3>
                <p>
                  The data controller is Jonathan About, as identified in the
                  Website Owner section above.
                </p>
              </div>

              {/* Data Processing */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Data Processing
                </h3>
                <p>
                  This website uses third-party services for statistics,
                  marketing, and/or other purposes. These services may collect
                  data about your browsing activity in accordance with their own
                  privacy policies.
                </p>
              </div>

              {/* Legal Basis */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Legal Basis
                </h3>
                <p>
                  Data processing by third-party services is based on your
                  consent, which you can provide or withdraw at any time via the
                  consent banner.
                </p>
              </div>

              {/* Cookie Management */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Cookie Management
                </h3>
                <p>
                  You can view detailed information about cookies and manage
                  your preferences through the &quot;Details&quot; tab in the
                  consent banner. You may modify your choices at any time by
                  clicking the cookie settings button.
                </p>
              </div>

              {/* Your Rights */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Your Rights
                </h3>
                <p>
                  To exercise your data protection rights, please contact the
                  respective third-party services directly through their privacy
                  policies, or withdraw your consent at any time via the consent
                  banner.
                </p>
              </div>
            </div>
          </section>

          {/* Terms of Use Section */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Terms of Use</h2>

            <div className="space-y-6">
              {/* Acceptance of Terms */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Acceptance of Terms
                </h3>
                <p>
                  By accessing or using SpectroTrace, you agree to be bound by
                  these Terms of Use and all applicable laws and regulations. If
                  you do not agree with any of these terms, you are prohibited
                  from using or accessing this service. Your continued use of
                  the service following the posting of any changes to these
                  terms constitutes acceptance of those changes.
                </p>
              </div>

              {/* Description of Service */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Description of Service
                </h3>
                <p>
                  SpectroTrace is a web application that converts images into
                  audio files using spectrogram technology. The generated audio,
                  when viewed through a spectrogram analyzer, reveals the
                  original image. All processing is performed entirely
                  client-side within your web browser using JavaScript and the
                  Web Audio API. No image data, audio files, or conversion
                  results are transmitted to or stored on my servers.
                </p>
              </div>

              {/* Intellectual Property */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Intellectual Property
                </h3>
                <p>
                  SpectroTrace is open-source software released under the MIT
                  License. You are free to use, copy, modify, merge, publish,
                  distribute, sublicense, and/or sell copies of the software,
                  subject to the terms of the MIT License. The source code is
                  available at{" "}
                  <a
                    href="https://github.com/j-about/SpectroTrace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary underline underline-offset-4"
                  >
                    github.com/j-about/SpectroTrace
                  </a>
                  . You retain full ownership and all intellectual property
                  rights to any images you upload and any audio files generated
                  from those images.
                </p>
              </div>

              {/* User Responsibilities */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  User Responsibilities
                </h3>
                <p>
                  You are solely responsible for the content you process using
                  SpectroTrace. You agree not to use the service to process,
                  convert, or generate content that: (a) infringes upon the
                  intellectual property rights of any third party; (b) is
                  illegal, harmful, threatening, abusive, harassing, defamatory,
                  or otherwise objectionable; (c) contains malicious code or is
                  designed to harm computer systems; or (d) violates any
                  applicable local, national, or international law. You assume
                  full responsibility for ensuring you have the necessary rights
                  to use any images you upload.
                </p>
              </div>

              {/* Limitations of Liability */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Limitations of Liability
                </h3>
                <p>
                  SpectroTrace is provided &quot;as is&quot; and &quot;as
                  available&quot; without any warranties of any kind, either
                  express or implied, including but not limited to warranties of
                  merchantability, fitness for a particular purpose, or
                  non-infringement. In no event shall Jonathan About, the owner
                  and operator of SpectroTrace, be liable for any direct,
                  indirect, incidental, special, consequential, or punitive
                  damages arising out of or related to your use of, or inability
                  to use, the service. This includes, without limitation,
                  damages for loss of data, profits, or other intangible losses.
                </p>
              </div>

              {/* Service Availability */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Service Availability
                </h3>
                <p>
                  I do not guarantee that SpectroTrace will be available at all
                  times or without interruption. The service may be temporarily
                  unavailable due to maintenance, updates, server issues, or
                  circumstances beyond my control. I reserve the right to
                  modify, suspend, or discontinue the service at any time
                  without prior notice. I shall not be liable to you or any
                  third party for any modification, suspension, or
                  discontinuation of the service.
                </p>
              </div>

              {/* Local Processing and Data */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Local Processing and Data
                </h3>
                <p>
                  All image-to-audio conversion processing occurs locally in
                  your web browser. Your images and generated audio files are
                  never uploaded to, stored on, or transmitted through my
                  servers. As a result, I cannot recover, retrieve, or restore
                  any files you process. You are solely responsible for saving
                  and backing up any generated audio files before closing your
                  browser session. By using the offline capabilities of this
                  Progressive Web App, you acknowledge that cached application
                  files are stored locally on your device.
                </p>
              </div>

              {/* Modifications to Terms */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Modifications to Terms
                </h3>
                <p>
                  I reserve the right to modify these Terms of Use at any time.
                  Any changes will be effective immediately upon posting to this
                  page. The date of the last modification will be indicated at
                  the top of this section. I encourage you to review these terms
                  periodically. Your continued use of SpectroTrace after any
                  modifications constitutes your acceptance of the updated
                  terms.
                </p>
              </div>

              {/* Governing Law and Jurisdiction */}
              <div>
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Governing Law and Jurisdiction
                </h3>
                <p>
                  These Terms of Use shall be governed by and construed in
                  accordance with the laws of France, without regard to its
                  conflict of law provisions. Any disputes arising out of or
                  relating to these terms or your use of SpectroTrace shall be
                  subject to the exclusive jurisdiction of the courts of Paris,
                  France. By using this service, you consent to the personal
                  jurisdiction of such courts and waive any objections based on
                  venue or inconvenient forum.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
