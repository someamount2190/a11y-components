import { useEffect } from "react";

/**
 * Locks body scroll while `locked` is true, compensating for the scrollbar
 * width so the page behind a modal does not shift. Reference-counted so
 * nested locks (e.g. a dialog opening another dialog) restore correctly.
 */
let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const { body, documentElement } = document;

    if (lockCount === 0) {
      const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
      previousOverflow = body.style.overflow;
      previousPaddingRight = body.style.paddingRight;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        const current = parseInt(window.getComputedStyle(body).paddingRight, 10) || 0;
        body.style.paddingRight = `${current + scrollbarWidth}px`;
      }
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [locked]);
}
