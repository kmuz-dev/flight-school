/**
 * localStorage schema (SPEC.md §6). Versioned single key; unknown or corrupt
 * data is discarded silently. All reads are SSR/export-safe.
 */
import type { PlaneId } from "@/content/types";
import type { PaperFormat } from "@/engine/core/types";

const KEY = "flightschool.v1";

/** The class Night Flight keys off, set on `<html>` (globals.css). */
export const NIGHT_CLASS = "night";

/**
 * Read the stored theme and put the class on `<html>` before anything paints.
 *
 * This runs as an inline script at the top of the body, ahead of React, because
 * the alternative is a cream flash on every navigation for a cadet who chose
 * Night Flight: a static export ships one prerendered HTML per route, and no
 * amount of client state can beat first paint. It is the only piece of the
 * stored schema read outside this module, which is why it lives next to the key
 * it reads rather than in the layout that inlines it.
 */
export const THEME_BOOT_SCRIPT =
  `(function(){try{` +
  `var s=JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})||"null");` +
  `var t=s&&s.theme;` +
  `if(t!=="night"&&t!=="paper"){` +
  `t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"night":"paper";}` +
  `if(t==="night")document.documentElement.classList.add(${JSON.stringify(NIGHT_CLASS)});` +
  `}catch(e){}})();`;

export type Stored = {
  progress: Partial<Record<PlaneId, { step: number; updatedAt: string }>>;
  completed: Partial<Record<PlaneId, { at: string }>>;
  locale?: string;
  theme?: "paper" | "night";
  paperChoice?: Partial<Record<PlaneId, PaperFormat>>;
};

const EMPTY: Stored = { progress: {}, completed: {} };

export function readStored(): Stored {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const p = parsed as Partial<Stored>;
    return {
      progress: typeof p.progress === "object" && p.progress !== null ? p.progress : {},
      completed: typeof p.completed === "object" && p.completed !== null ? p.completed : {},
      locale: typeof p.locale === "string" ? p.locale : undefined,
      theme: p.theme === "night" || p.theme === "paper" ? p.theme : undefined,
      paperChoice:
        typeof p.paperChoice === "object" && p.paperChoice !== null ? p.paperChoice : undefined,
    };
  } catch {
    return EMPTY;
  }
}

export function writeStored(update: (prev: Stored) => Stored): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(update(readStored())));
  } catch {
    // Quota/private-mode failures degrade to stateless; never throw into UI.
  }
}
