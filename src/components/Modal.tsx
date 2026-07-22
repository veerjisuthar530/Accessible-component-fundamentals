import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

/**
 * Modal Dialog
 * Implements the W3C ARIA APG "Dialog (Modal)" pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *
 * Requirements covered:
 * - role="dialog" + aria-modal="true" on the dialog element
 * - Accessible name via aria-labelledby (title element)
 * - Focus moves into the dialog when it opens (first focusable, else the dialog itself)
 * - Focus is trapped inside the dialog while open (Tab / Shift+Tab wrap)
 * - Escape closes the dialog
 * - Focus returns to the element that opened the dialog when it closes
 * - Content behind the dialog is hidden from assistive tech via aria-hidden
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, titleId, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Element that had focus before the dialog opened, so we can restore it on close.
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Open: remember the trigger, hide the rest of the page from AT, move focus in.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const rootSiblings = Array.from(document.body.children).filter(
      (el) => el !== dialogRef.current?.closest("[data-modal-root]"),
    );
    const previousOverflow = document.body.style.overflow;

    rootSiblings.forEach((el) => el.setAttribute("aria-hidden", "true"));
    document.body.style.overflow = "hidden";

    const node = dialogRef.current;
    const firstFocusable = node?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? node)?.focus();

    return () => {
      rootSiblings.forEach((el) => el.removeAttribute("aria-hidden"));
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Close: return focus to whatever opened the dialog.
  useEffect(() => {
    if (isOpen) return;
    previouslyFocusedElement.current?.focus();
  }, [isOpen]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    // Focus trap: keep Tab / Shift+Tab cycling within the dialog.
    const node = dialogRef.current;
    if (!node) return;

    const focusable = Array.from(
      node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusable.length === 0) {
      event.preventDefault();
      node.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!active || !node.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div data-modal-root>
      {/* Backdrop: clicking it closes the dialog, same as Escape */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="modal-dialog"
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close dialog">
          Close
        </button>
      </div>
    </div>
  );
}
