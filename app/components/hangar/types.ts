/**
 * View-model types for the Hangar (SCREENS.md §1).
 *
 * Same rule as the tutorial module: components hold no prose. `HangarUiStrings`
 * carries chrome copy lifted out of the flat `UiDictionary`; `HangarPlaneView`
 * carries one aircraft's already-resolved name, numbers and engine render, so
 * the bay never reaches into the content registry or a dictionary itself.
 */
import type { AircraftPresentation } from "@/content/presentation";
import type { PlaneStructure, Tier } from "@/content/types";
import type { UiDictionary } from "@/i18n/types";

export type HangarPlaneView = {
  readonly id: string;
  readonly name: string;
  readonly tier: Tier;
  readonly stepCount: number;
  /** Finished-aircraft SVG from the fold engine, generated at build time. */
  readonly svg: string;
  /** Beauty artwork and the canonical display angle, resolved on the server. */
  readonly presentation: AircraftPresentation;
  /** Preflight, which is where the bay's primary action goes. */
  readonly href: string;
  /** Kept so the bay can mount a live engine without a second lookup. */
  readonly structure: PlaneStructure;
};

export type HangarUiStrings = {
  readonly skipToContent: string;
  readonly brand: string;
  readonly localePickerLabel: string;
  /** "Wings: {count}". */
  readonly navWings: string;
  /** "A flight academy for paper - {count} aircraft on the floor". */
  readonly eyebrow: string;
  readonly subtitle: string;
  /** "{count} folds". */
  readonly folds: string;
  readonly wingsEarned: string;
  readonly startFolding: string;
  /** "Resume at step {step}". */
  readonly resume: string;
  readonly tier: Readonly<Record<Tier, string>>;
  readonly bayHint: string;
  readonly chooseAircraft: string;
  readonly previousAircraft: string;
  readonly nextAircraft: string;
  /** "{name}, wings earned" - the dot's own name. */
  readonly dotEarned: string;
  /** "{name}, {tier}, {count} folds" - what the live region announces. */
  readonly announce: string;
  /** "Inspect {name} in 3D". */
  readonly inspect3d: string;
  readonly showArtwork: string;
  readonly loading3d: string;
  readonly resetView: string;
  readonly unavailable3d: string;
  readonly retry3d: string;
};

export const HANGAR_UI_KEYS = [
  "brand.name",
  "nav.wings",
  "a11y.localePicker",
  "a11y.skipToContent",
  "hangar.subtitle",
  "hangar.eyebrow",
  "hangar.folds",
  "hangar.wingsEarned",
  "hangar.bayHint",
  "hangar.chooseAircraft",
  "hangar.previousAircraft",
  "hangar.nextAircraft",
  "hangar.dotEarned",
  "hangar.announce",
  "hangar.preview",
  "preflight.showArtwork",
  "preflight.loading3d",
  "preflight.resetView",
  "preflight.unavailable3d",
  "preflight.retry3d",
  "preflight.startFolding",
  "preflight.resume",
  "tier.easy",
  "tier.medium",
  "tier.advanced",
] as const;

/** A missing key renders as the key itself: loud in QA, never silent English. */
export function hangarUiFromDictionary(ui: UiDictionary): HangarUiStrings {
  const t = (key: string): string => ui[key] ?? key;
  return {
    skipToContent: t("a11y.skipToContent"),
    brand: t("brand.name"),
    localePickerLabel: t("a11y.localePicker"),
    navWings: t("nav.wings"),
    eyebrow: t("hangar.eyebrow"),
    subtitle: t("hangar.subtitle"),
    folds: t("hangar.folds"),
    wingsEarned: t("hangar.wingsEarned"),
    startFolding: t("preflight.startFolding"),
    resume: t("preflight.resume"),
    tier: {
      easy: t("tier.easy"),
      medium: t("tier.medium"),
      advanced: t("tier.advanced"),
    },
    bayHint: t("hangar.bayHint"),
    chooseAircraft: t("hangar.chooseAircraft"),
    previousAircraft: t("hangar.previousAircraft"),
    nextAircraft: t("hangar.nextAircraft"),
    dotEarned: t("hangar.dotEarned"),
    announce: t("hangar.announce"),
    inspect3d: t("hangar.preview"),
    showArtwork: t("preflight.showArtwork"),
    loading3d: t("preflight.loading3d"),
    resetView: t("preflight.resetView"),
    unavailable3d: t("preflight.unavailable3d"),
    retry3d: t("preflight.retry3d"),
  };
}

/**
 * Which aircraft the bay opens on, once storage has actually been read.
 *
 * The first one the cadet has not finished, which answers three cases with one
 * rule: a new cadet lands on the Dart because it is first on the difficulty
 * ladder, a returning cadet lands on the aircraft they were up to rather than
 * having to arrow past the ones they have already folded, and a cadet who has
 * finished all six lands back on the Dart because there is no unfinished one to
 * find. That last case is the reason for the `?? 0` rather than an error: the
 * fleet being complete is a success, not a state with nothing to show.
 */
export function firstUnfinishedIndex(
  planes: readonly HangarPlaneView[],
  isComplete: (planeId: string) => boolean,
): number {
  const index = planes.findIndex((plane) => !isComplete(plane.id));
  return index === -1 ? 0 : index;
}
