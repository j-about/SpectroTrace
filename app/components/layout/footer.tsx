/**
 * @fileoverview Footer component for SpectroTrace application.
 *
 * Displays copyright information, license details, Legal Notice link,
 * and external links to GitHub repository and developer website.
 *
 * @module components/layout/footer
 */

import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the Footer component.
 */
interface FooterProps {
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Application footer with copyright and external links.
 *
 * Renders copyright notice with current year, MIT license reference,
 * Legal Notice link, and icon buttons linking to GitHub and developer's
 * personal site.
 */
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn("border-border bg-background border-t py-4", className)}
    >
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="text-muted-foreground text-center text-sm sm:text-left">
          <p>© {currentYear} SpectroTrace · Free & Open Source · MIT License</p>
          <p>Made with ❤️ by Jonathan About</p>
        </div>

        <Link
          href="/legal-notice"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          Legal Notice
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" asChild>
            <a
              href="https://github.com/j-about/SpectroTrace"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <SiGithub className="size-4" />
            </a>
          </Button>

          <Button variant="ghost" size="icon-sm" asChild>
            <a
              href="https://www.jonathan-about.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit developer's website"
            >
              <User className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
