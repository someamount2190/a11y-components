import { useEffect } from "react";

/**
 * Calls `handler` when a pointer event occurs outside every referenced element.
 * Accepts multiple refs so a popover and its trigger can be treated as one unit
 * (clicking the trigger should not count as "outside").
 */
export function useOnClickOutside(
  refs: Array<React.RefObject<HTMLElement>>,
  handler: (event: PointerEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: PointerEvent) => {
      const target = event.target as Node;
      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) handler(event);
    };
    // pointerdown fires before focus changes, which avoids flicker on close.
    document.addEventListener("pointerdown", listener, true);
    return () => document.removeEventListener("pointerdown", listener, true);
  }, [refs, handler, enabled]);
}
