/**
 * @fileoverview Header component for SpectroTrace application.
 *
 * Provides the main navigation header with branding. Optionally includes
 * mode toggle (Basic/Advanced) and tip button when props are provided.
 * Renders as a sticky header with backdrop blur.
 *
 * @module components/layout/header
 */

"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Beer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Application mode controlling the UI complexity level.
 * - "basic": Simplified one-click conversion with default parameters
 * - "advanced": Full parameter controls for custom conversion
 */
export type AppMode = "basic" | "advanced";

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** Current application mode (optional for static pages) */
  mode?: AppMode;
  /** Callback when user switches between Basic and Advanced modes */
  onModeChange?: (mode: AppMode) => void;
  /** Optional callback when tip button is clicked */
  onTipClick?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Application header with mode toggle and navigation.
 *
 * Features:
 * - Sticky positioning with backdrop blur
 * - Tabs component for Basic/Advanced mode switching (when mode/onModeChange provided)
 * - Tip button linking to donation flow (when onTipClick provided)
 *
 * On static pages (like Legal Notice), omit mode props for a simplified header
 * showing only branding and navigation.
 */
export function Header({
  mode,
  onModeChange,
  onTipClick,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur",
        className,
      )}
    >
      <nav
        className="container mx-auto flex h-14 items-center justify-between px-4"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SpectroTrace
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {mode && onModeChange && (
            <Tabs
              value={mode}
              onValueChange={(value) => onModeChange(value as AppMode)}
            >
              <TabsList aria-label="Application mode">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {onTipClick && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Buy me a beer"
                  onClick={onTipClick}
                >
                  <Beer className="size-5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Buy me a beer</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </nav>
    </header>
  );
}
