"use client";

/**
 * Does this cadet want motion?
 *
 * Most of the site answers that in CSS, and the fold engine reads the query
 * itself. The Hangar bay cannot do either: its aircraft are positioned by
 * JavaScript on every frame, so the preference has to reach the code computing
 * those frames.
 *
 * Through `useSyncExternalStore` rather than a `useEffect` + `useState` pair,
 * because the static export prerenders with no preference at all: going through
 * `getServerSnapshot` is what lets React hydrate against that HTML and then
 * re-render, instead of reporting a mismatch on every machine that asked for
 * reduced motion.
 */
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function mediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia(QUERY);
}

function subscribe(onChange: () => void): () => void {
  const mq = mediaQuery();
  mq?.addEventListener("change", onChange);
  return () => mq?.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => mediaQuery()?.matches === true,
    () => false,
  );
}
