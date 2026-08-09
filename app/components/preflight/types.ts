/**
 * View-model types for Preflight (SCREENS.md §2): Stitch's visual frame
 * carrying Claude Design's information set.
 *
 * Everything the screen states about a plane is derived from its structure -
 * step count, crease mix, paper - so the spec table cannot drift from the fold
 * sequence the cadet is about to follow.
 */
import type { PlaneStructure, Rating, Tier } from "@/content/types";
import type { PlanesDictionary, UiDictionary } from "@/i18n/types";
import type { PlaneId } from "@/content/types";
import type { RatingKey } from "@/components/hangar/types";
import type { PaperPickerStrings } from "./PaperPicker";

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
  /** Position in the catalog, for the manifest line. 1-based. */
  readonly index: number;
  readonly total: number;
  /** Build-time engine render, behind the live viewer. */
  readonly svg: string;
  readonly structure: PlaneStructure;
};

export type PreflightUiStrings = {
  readonly backToHangar: string;
  readonly eyebrow: string;
  readonly orbitHint: string;
  readonly specimen: string;
  readonly viewerLabel: string;
  readonly flightProfile: string;
  readonly rating: Readonly<Record<RatingKey, string>>;
  /** "{label}: {value} out of 5". */
  readonly ratingGauge: string;
  readonly license: Readonly<Record<Tier, string>>;
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
  /** "Aircraft {index} of {total} on the hangar floor". */
  readonly manifestLine: string;
  readonly tipLabel: string;
};

export const PREFLIGHT_UI_KEYS = [
  "nav.backToHangar",
  "preflight.eyebrow",
  "preflight.orbitHint",
  "preflight.specimen",
  "preflight.viewerLabel",
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
  "preflight.weightValue",
  "preflight.foldsValue",
  "preflight.creasesAllValley",
  "preflight.creasesMix",
  "preflight.throwTip",
  "preflight.startFolding",
  "preflight.resume",
  "preflight.manifestLine",
  "rating.speed",
  "rating.distance",
  "rating.airtime",
  "rating.ease",
  "rating.gauge",
  "tutorial.license.easy",
  "tutorial.license.medium",
  "tutorial.license.advanced",
  "tutorial.tipLabel",
] as const;

export function preflightUiFromDictionary(ui: UiDictionary): PreflightUiStrings {
  const t = (key: string): string => ui[key] ?? key;
  return {
    backToHangar: t("nav.backToHangar"),
    eyebrow: t("preflight.eyebrow"),
    orbitHint: t("preflight.orbitHint"),
    specimen: t("preflight.specimen"),
    viewerLabel: t("preflight.viewerLabel"),
    flightProfile: t("preflight.flightProfile"),
    rating: {
      speed: t("rating.speed"),
      distance: t("rating.distance"),
      airtime: t("rating.airtime"),
      ease: t("rating.ease"),
    },
    ratingGauge: t("rating.gauge"),
    license: {
      easy: t("tutorial.license.easy"),
      medium: t("tutorial.license.medium"),
      advanced: t("tutorial.license.advanced"),
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
    },
    startFolding: t("preflight.startFolding"),
    resume: t("preflight.resume"),
    manifestLine: t("preflight.manifestLine"),
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
  catalogIds: readonly string[],
  svg: string,
): PreflightView | null {
  const strings = dict.planes[structure.id as PlaneId];
  if (!strings) return null;
  const index = catalogIds.indexOf(structure.id);
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
    index: index >= 0 ? index + 1 : 1,
    total: catalogIds.length,
    svg,
    structure,
  };
}
