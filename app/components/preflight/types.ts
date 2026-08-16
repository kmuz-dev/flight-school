/**
 * View-model types for Preflight (SCREENS.md §2).
 *
 * Everything the screen states about a plane is derived from its structure -
 * step count, crease mix, paper - so the spec table cannot drift from the fold
 * sequence the cadet is about to follow.
 */
import type { PlaneStructure, Rating, RatingKey, Tier } from "@/content/types";
import type { PlanesDictionary, UiDictionary } from "@/i18n/types";
import type { PlaneId } from "@/content/types";
import type { PaperPickerStrings } from "./PaperPicker";
import type { AircraftPresentation } from "@/content/presentation";
import { getAircraftPresentation } from "@/content/presentation";

/** The two sheets a plane's own sequence can be authored against. */
export type AuthoredFormat = "letter-a4" | "square";

export type CreaseMix = { readonly valley: number; readonly mountain: number };

export type PreflightView = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly throwTip: string;
  /** The plane's default folding tip, shown in the mono strip under the CTA. */
  readonly tip: string;
  readonly tier: Tier;
  readonly stepCount: number;
  readonly ratings: Readonly<Record<RatingKey, Rating>>;
  /** Authored planes only: the composed prep+plane form is never shown here. */
  readonly paperFormat: AuthoredFormat;
  readonly creases: CreaseMix;
  /** Build-time engine render, behind the live viewer. */
  readonly svg: string;
  readonly presentation: AircraftPresentation;
  readonly structure: PlaneStructure;
};

export type PreflightUiStrings = {
  readonly skipToContent: string;
  readonly backToHangar: string;
  readonly backToHangarShort: string;
  readonly eyebrow: string;
  readonly localePickerLabel: string;
  readonly orbitHint: string;
  readonly viewerLabel: string;
  readonly inspect3d: string;
  readonly showArtwork: string;
  readonly loading3d: string;
  readonly resetView: string;
  readonly unavailable3d: string;
  readonly retry3d: string;
  readonly artworkAlt: string;
  readonly flightProfile: string;
  readonly rating: Readonly<Record<RatingKey, string>>;
  /** "{label}: {value} out of 5". */
  readonly ratingGauge: string;
  readonly tier: Readonly<Record<Tier, string>>;
  readonly getYourPaper: string;
  readonly paper: string;
  readonly weight: string;
  readonly folds: string;
  readonly creases: string;
  readonly paperValue: Readonly<Record<AuthoredFormat, string>>;
  readonly weightValue: string;
  /** "{count} folds". */
  readonly foldsValue: string;
  readonly creasesAllValley: string;
  /** "{valley} valley, {mountain} mountain". */
  readonly creasesMix: string;
  readonly throwTip: string;
  readonly paperPicker: PaperPickerStrings;
  readonly startFolding: string;
  /** "Resume at step {step}". */
  readonly resume: string;
  readonly tipLabel: string;
};

export const PREFLIGHT_UI_KEYS = [
  "nav.backToHangar",
  "nav.backToHangarShort",
  "preflight.eyebrow",
  "a11y.localePicker",
  "a11y.skipToContent",
  "preflight.orbitHint",
  "preflight.viewerLabel",
  "preflight.inspect3d",
  "preflight.showArtwork",
  "preflight.loading3d",
  "preflight.resetView",
  "preflight.unavailable3d",
  "preflight.retry3d",
  "preflight.artworkAlt",
  "preflight.flightProfile",
  "preflight.getYourPaper",
  "preflight.paper",
  "preflight.weight",
  "preflight.folds",
  "preflight.creases",
  "preflight.paperValue.letter-a4",
  "preflight.paperValue.square",
  "preflight.paperQuestion",
  "preflight.paperChoice.a4",
  "preflight.paperChoice.letter",
  "preflight.paperChoice.square",
  "preflight.paperChoice.index-4x6",
  "preflight.paperNeedsPrep",
  "preflight.paperNoPrep",
  "preflight.paperResetsProgress",
  "preflight.weightValue",
  "preflight.foldsValue",
  "preflight.creasesAllValley",
  "preflight.creasesMix",
  "preflight.throwTip",
  "preflight.startFolding",
  "preflight.resume",
  "rating.speed",
  "rating.distance",
  "rating.airtime",
  "rating.ease",
  "rating.gauge",
  "tier.easy",
  "tier.medium",
  "tier.advanced",
  "tutorial.tipLabel",
] as const;

export function preflightUiFromDictionary(ui: UiDictionary): PreflightUiStrings {
  const t = (key: string): string => ui[key] ?? key;
  return {
    skipToContent: t("a11y.skipToContent"),
    backToHangar: t("nav.backToHangar"),
    backToHangarShort: t("nav.backToHangarShort"),
    eyebrow: t("preflight.eyebrow"),
    localePickerLabel: t("a11y.localePicker"),
    orbitHint: t("preflight.orbitHint"),
    viewerLabel: t("preflight.viewerLabel"),
    inspect3d: t("preflight.inspect3d"),
    showArtwork: t("preflight.showArtwork"),
    loading3d: t("preflight.loading3d"),
    resetView: t("preflight.resetView"),
    unavailable3d: t("preflight.unavailable3d"),
    retry3d: t("preflight.retry3d"),
    artworkAlt: t("preflight.artworkAlt"),
    flightProfile: t("preflight.flightProfile"),
    rating: {
      speed: t("rating.speed"),
      distance: t("rating.distance"),
      airtime: t("rating.airtime"),
      ease: t("rating.ease"),
    },
    ratingGauge: t("rating.gauge"),
    tier: {
      easy: t("tier.easy"),
      medium: t("tier.medium"),
      advanced: t("tier.advanced"),
    },
    getYourPaper: t("preflight.getYourPaper"),
    paper: t("preflight.paper"),
    weight: t("preflight.weight"),
    folds: t("preflight.folds"),
    creases: t("preflight.creases"),
    paperValue: {
      "letter-a4": t("preflight.paperValue.letter-a4"),
      square: t("preflight.paperValue.square"),
    },
    weightValue: t("preflight.weightValue"),
    foldsValue: t("preflight.foldsValue"),
    creasesAllValley: t("preflight.creasesAllValley"),
    creasesMix: t("preflight.creasesMix"),
    throwTip: t("preflight.throwTip"),
    paperPicker: {
      question: t("preflight.paperQuestion"),
      label: {
        a4: t("preflight.paperChoice.a4"),
        letter: t("preflight.paperChoice.letter"),
        square: t("preflight.paperChoice.square"),
        "index-4x6": t("preflight.paperChoice.index-4x6"),
      },
      needsPrep: t("preflight.paperNeedsPrep"),
      noPrep: t("preflight.paperNoPrep"),
      resetsProgress: t("preflight.paperResetsProgress"),
    },
    startFolding: t("preflight.startFolding"),
    resume: t("preflight.resume"),
    tipLabel: t("tutorial.tipLabel"),
  };
}

/** How many creases of each hand the sequence asks for. Folds only; a flip or
 * a crease-and-unfold is not a new crease the cadet has to judge. */
export function creaseMix(structure: PlaneStructure): CreaseMix {
  let valley = 0;
  let mountain = 0;
  for (const step of structure.steps) {
    if (step.action.type !== "fold") continue;
    if (step.action.direction === "mountain") mountain += 1;
    else valley += 1;
  }
  return { valley, mountain };
}

export function buildPreflightView(
  structure: PlaneStructure,
  dict: PlanesDictionary,
  svg: string,
): PreflightView | null {
  const strings = dict.planes[structure.id as PlaneId];
  if (!strings) return null;
  return {
    id: structure.id,
    name: strings.name,
    description: strings.description,
    throwTip: strings.throwTip,
    tip: strings.tips.default ?? "",
    tier: structure.tier,
    stepCount: structure.steps.length,
    ratings: structure.ratings,
    paperFormat: structure.paper.format as AuthoredFormat,
    creases: creaseMix(structure),
    svg,
    presentation: getAircraftPresentation(structure.id),
    structure,
  };
}
