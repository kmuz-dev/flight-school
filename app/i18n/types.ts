/**
 * Dictionary shapes (SPEC.md §5). English is source of truth; other locales
 * are translated dictionaries merged over English so missing keys fall back.
 * The i18n audit script fails CI listing missing keys per locale.
 */
import type { PlaneId } from "@/content/types";

/** Site chrome: nav, buttons, labels, a11y strings. Flat key map. */
export type UiDictionary = Readonly<Record<string, string>>;

export type PlaneStrings = {
  readonly name: string;
  /** One-paragraph flight description (kid-clear). */
  readonly description: string;
  readonly throwTip: string;
  /** Step id -> short placard title, e.g. "Fold the top corners in". */
  readonly titles: Readonly<Record<string, string>>;
  /** Step id -> instruction text. Every step id must be present (validated). */
  readonly steps: Readonly<Record<string, string>>;
  /** Step id -> optional explanation rendered beneath the folding action. */
  readonly explanations: Readonly<Record<string, string>>;
  /** Per-step or per-plane folding tips for the tip bar. */
  readonly tips: Readonly<Record<string, string>>;
};

export type GlossaryEntry = {
  readonly term: string;
  readonly definition: string;
};

export type PlanesDictionary = {
  /**
   * Partial by design: the catalog grows plane by plane. A content test asserts
   * every plane in the registry has an entry here, so the gap that matters (a
   * plane shipping without prose) still fails the build.
   */
  readonly planes: Partial<Readonly<Record<PlaneId, PlaneStrings>>>;
  /** Fold-term glossary (valley-fold, mountain-fold, crease, ...). */
  readonly glossary: Readonly<Record<string, GlossaryEntry>>;
};
