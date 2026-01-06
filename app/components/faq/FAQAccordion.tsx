/**
 * @fileoverview FAQ Accordion component.
 *
 * Renders FAQ items in an accessible accordion format.
 * Used on the FAQ page to display categorized questions and answers.
 *
 * @module components/faq/FAQAccordion
 */

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQItem } from "@/lib/seo/faq-data";

/**
 * Props for the FAQAccordion component.
 */
interface FAQAccordionProps {
  /** Array of FAQ items to display */
  items: FAQItem[];
}

/**
 * Renders a list of FAQ items in an accordion format.
 *
 * Each question is displayed as a collapsible panel trigger,
 * with the answer revealed when expanded.
 *
 * @example
 * ```tsx
 * <FAQAccordion items={faqData.filter(f => f.category === "general")} />
 * ```
 */
export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
