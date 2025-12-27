/**
 * @fileoverview Legal Notice page for SpectroTrace application.
 *
 * Displays mandatory legal information as required by French LCEN
 * (Loi pour la Confiance dans l'Économie Numérique) including:
 * - Website owner identification and contact details
 * - Business registration numbers (RCS, SIREN)
 * - Hosting provider information
 *
 * @module app/legal-notice/page
 */

import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Legal Notice | SpectroTrace",
  description:
    "Legal information and mandatory disclosures for SpectroTrace website",
};

/**
 * Legal Notice page component.
 *
 * Renders legally required information about the website owner and
 * hosting provider in a simple, accessible format using semantic HTML.
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
          <section>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
