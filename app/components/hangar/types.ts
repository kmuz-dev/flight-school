/**
 * View-model types for the Hangar (SCREENS.md §1).
 *
 * Same rule as the tutorial module: components hold no prose. `HangarUiStrings`
 * carries chrome copy lifted out of the flat `UiDictionary`; `HangarPlaneView`
 * carries one plane's already-resolved name, numbers and engine render, so the
 * card never reaches into the content registry or a dictionary itself.
 */
import type { PlaneStructure, Rating, Tier } from "@/content/types";
import type { UiDictionary } from "@/i18n/types";

export type RatingKey = "speed" | "distance" | "airtime" | "ease";

export const RATING_KEYS: readonly RatingKey[] = ["speed", "distance", "airtime", "ease"];

export type HangarPlaneView = {
  readonly id: string;
  readonly name: string;
  readonly tier: Tier;
  readonly stepCount: number;
  readonly ratings: Readonly<Record<RatingKey, Rating>>;
  /** Finished-plane SVG from the fold engine, generated at build time. */
  readonly svg: string;
  readonly href: string;
  /** Kept so a woken card can mount a live engine without a second lookup. */
  readonly structure: PlaneStructure;
};

export type HangarUiStrings = {
  readonly brand: string;
  readonly navHangar: string;
  readonly navLogbook: string;
  /** "{count} wings". */
  readonly navWings: string;
  readonly title: string;
  readonly subtitle: string;
  /** "... {count} aircraft on the floor". */
  readonly eyebrow: string;
  readonly fleetOverview: string;
  readonly steps: string;
  readonly wingsEarned: string;
  readonly filterAll: string;
  readonly filterLabel: string;
  readonly tier: Readonly<Record<Tier, string>>;
  /** "Preview {name} in 3D". */
  readonly preview: string;
  readonly empty: string;
  readonly footerLine: string;
  readonly rating: Readonly<Record<RatingKey, string>>;
  /** "{label}: {value} out of 5". */
  readonly ratingGauge: string;
};

export const HANGAR_UI_KEYS = [
  "brand.name",
  "nav.hangar",
  "nav.logbook",
  "nav.wings",
  "hangar.title",
  "hangar.subtitle",
  "hangar.eyebrow",
  "hangar.fleetOverview",
  "hangar.steps",
  "hangar.wingsEarned",
  "hangar.filterAll",
  "hangar.filterLabel",
  "hangar.preview",
  "hangar.empty",
  "hangar.footerLine",
  "tier.easy",
  "tier.medium",
  "tier.advanced",
  "rating.speed",
  "rating.distance",
  "rating.airtime",
  "rating.ease",
  "rating.gauge",
] as const;

/** A missing key renders as the key itself: loud in QA, never silent English. */
export function hangarUiFromDictionary(ui: UiDictionary): HangarUiStrings {
  const t = (key: string): string => ui[key] ?? key;
  return {
    brand: t("brand.name"),
    navHangar: t("nav.hangar"),
    navLogbook: t("nav.logbook"),
    navWings: t("nav.wings"),
    title: t("hangar.title"),
    subtitle: t("hangar.subtitle"),
    eyebrow: t("hangar.eyebrow"),
    fleetOverview: t("hangar.fleetOverview"),
    steps: t("hangar.steps"),
    wingsEarned: t("hangar.wingsEarned"),
    filterAll: t("hangar.filterAll"),
    filterLabel: t("hangar.filterLabel"),
    tier: {
      easy: t("tier.easy"),
      medium: t("tier.medium"),
      advanced: t("tier.advanced"),
    },
    preview: t("hangar.preview"),
    empty: t("hangar.empty"),
    footerLine: t("hangar.footerLine"),
    rating: {
      speed: t("rating.speed"),
      distance: t("rating.distance"),
      airtime: t("rating.airtime"),
      ease: t("rating.ease"),
    },
    ratingGauge: t("rating.gauge"),
  };
}
