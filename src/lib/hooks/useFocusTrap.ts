import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");

function isHidden(el: HTMLElement): boolean {
  // Walk ancestors for `hidden` / aria-hidden. Visibility/display is checked
  // via computed style, falling back gracefully where layout is unavailable.
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node.hidden || node.getAttribute("aria-hidden") === "true") return true;
    const style = typeof window.getComputedStyle === "function"
      ? window.getComputedStyle(node)
      : null;
    if (style && (style.display === "none" || style.visibility === "hidden")) {
      return true;
    }
  }
  return false;
}

/** Returns the focusable descendants of `root` in DOM order, skipping hidden ones. */
export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => {
    if (el.hasAttribute("disabled")) return false;
    if ((el as HTMLInputElement).type === "hidden") return false;
    return !isHidden(el);
  });
}

export interface FocusTrapOptions {
  /** Whether the trap is currently active. */
  active: boolean;
  /**
   * Element to focus when the trap activates. Defaults to the first focusable
   * element, falling back to the container itself.
   */
  initialFocus?: React.RefObject<HTMLElement>;
  /**
   * Where to return focus when the trap deactivates. Defaults to whatever was
   * focused immediately before activation (captured automatically).
   */
  returnFocus?: React.RefObject<HTMLElement>;
}

/**
 * Traps keyboard focus within `containerRef` while `active`.
 *
 * - Moves focus into the container on activation.
 * - Wraps Tab / Shift+Tab at the boundaries so focus never escapes.
 * - Restores focus to the previously focused element on deactivation, which is
 *   what screen-reader and keyboard users expect when a dialog closes.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  { active, initialFocus, returnFocus }: FocusTrapOptions,
): void {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Defer initial focus until after the element is painted.
    const focusInitial = () => {
      const target =
        initialFocus?.current ?? getFocusable(container)[0] ?? container;
      target.focus();
    };
    focusInitial();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        // Nothing to focus — keep focus pinned on the container.
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;

      if (event.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !container.contains(activeEl)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      const restoreTarget = returnFocus?.current ?? previouslyFocused.current;
      // Guard against restoring focus to a node that was removed from the DOM.
      if (restoreTarget && document.contains(restoreTarget)) {
        restoreTarget.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
