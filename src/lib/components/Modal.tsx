import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useScrollLock } from "../hooks/useScrollLock";
import "./Modal.css";

export interface ModalProps {
  /** Whether the modal is open. The modal renders nothing when closed. */
  open: boolean;
  /** Called when the user requests to close (Escape, overlay click, or close button). */
  onClose: () => void;
  /** Accessible title; rendered as the dialog heading and wired to aria-labelledby. */
  title: React.ReactNode;
  /** Optional supporting text wired to aria-describedby. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Footer region, typically action buttons. */
  footer?: React.ReactNode;
  /** Element to focus first; defaults to the first focusable element. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Close when the overlay (backdrop) is clicked. Default true. */
  closeOnOverlayClick?: boolean;
  /** Hide the built-in close button (e.g. for forced-choice dialogs). Default false. */
  hideCloseButton?: boolean;
}

/**
 * Accessible modal dialog.
 *
 * Implements the WAI-ARIA dialog (modal) pattern:
 * - role="dialog" + aria-modal, labelled by its title and described by its body.
 * - Focus is trapped inside and restored to the trigger on close.
 * - Escape closes; background scroll is locked; background content is inert to AT.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  initialFocusRef,
  closeOnOverlayClick = true,
  hideCloseButton = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useScrollLock(open);
  useFocusTrap(dialogRef, { active: open, initialFocus: initialFocusRef });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const onOverlayPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Only close on a click that both starts and ends on the overlay itself,
      // so dragging a text selection out of the dialog doesn't dismiss it.
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose],
  );

  if (!open) return null;

  return createPortal(
    <div className="a11y-modal-overlay" onPointerDown={onOverlayPointerDown}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="a11y-modal"
        tabIndex={-1}
      >
        <header className="a11y-modal__header">
          <h2 id={titleId} className="a11y-modal__title">
            {title}
          </h2>
          {!hideCloseButton && (
            <button
              type="button"
              className="a11y-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </header>
        {description && (
          <p id={descId} className="a11y-modal__description">
            {description}
          </p>
        )}
        <div className="a11y-modal__body">{children}</div>
        {footer && <footer className="a11y-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
