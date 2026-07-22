import { useId, useState, type ReactNode } from "react";

/**
 * Disclosure
 * Implements the W3C ARIA APG "Disclosure (Show/Hide)" pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *
 * Requirements covered:
 * - A single native <button> controls visibility (Space/Enter come for free
 *   from using a real button element instead of a div with a click handler)
 * - aria-expanded reflects open/closed state
 * - aria-controls points to the id of the controlled content region
 * - Content is removed from the accessibility tree and tab order when
 *   collapsed via the `hidden` attribute (also removes it from layout)
 */

interface DisclosureProps {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Disclosure({ summary, children, defaultOpen = false }: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className="disclosure">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span> {summary}
      </button>
      <div id={contentId} hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
}
