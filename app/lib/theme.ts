"use client";

/**
 * Night Flight: which scene the cadet is flying under (DESIGN.md, SCREENS.md
 * §Night Flight).
 *
 * A scene change, not an inversion, so it is one class on `<html>` swapping the
 * colour tokens, plus the same name handed to the 3D stages so their backdrop
 * and lighting change with the page.
 *
 * The choice lives in the same stored blob as progress, which means it survives
 * a reload and follows the cadet between screens. Until they choose, the
 * operating system decides; once they do, their choice holds. The class itself
 * is set before React exists by `THEME_BOOT_SCRIPT` - see the note there.
 */
import { useSyncExternalStore } from "react";
import { useProgressSnapshot, invalidateStored } from "./progress";
import { NIGHT_CLASS, writeStored, type Stored } from "./storage";

export type Theme = "paper" | "night";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Pure, so the precedence rule is testable without a DOM. */
export function resolveTheme(stored: Stored, prefersNight: boolean): Theme {
  return stored.theme ?? (prefersNight ? "night" : "paper");
}

function mediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia(DARK_QUERY);
}

/**
 * The OS preference as an external store rather than a read during render: the
 * static export prerenders with no preference at all, and going through
 * `getServerSnapshot` is what lets React hydrate against that HTML and then
 * re-render, instead of reporting a mismatch on every dark-mode machine.
 */
function subscribePrefersNight(onChange: () => void): () => void {
  const mq = mediaQuery();
  mq?.addEventListener("change", onChange);
  return () => mq?.removeEventListener("change", onChange);
}

export function usePrefersNight(): boolean {
  return useSyncExternalStore(
    subscribePrefersNight,
    () => mediaQuery()?.matches === true,
    () => false,
  );
}

export function useTheme(): Theme {
  return resolveTheme(useProgressSnapshot(), usePrefersNight());
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(NIGHT_CLASS, theme === "night");
}

export function setTheme(theme: Theme): void {
  writeStored((prev) => ({ ...prev, theme }));
  // Written straight to the DOM as well as to storage: the class lives outside
  // React's tree, so nothing would otherwise carry the change to the page.
  applyTheme(theme);
  invalidateStored();
}
