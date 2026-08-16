/**
 * View-model types for Wings earned (SCREENS.md §4).
 *
 * The screen shows only what localStorage can actually prove: how many folds
 * the sequence had, the date the wings were issued, and how many wings the
 * cadet holds. The mockup's fold-time and replay counters are not recorded
 * anywhere, so they are not shown - and neither is a certificate, a licence
 * number, or a credential of any kind. Flight School is not an authority that
 * can certify anybody; it teaches a fold. The wings are the reward, they are
 * real because the cadet folded the plane, and that is the whole claim.
 */
import type { PlaneStructure, Tier } from "@/content/types";
import type { PlaneId } from "@/content/types";
import type { PlanesDictionary, UiDictionary } from "@/i18n/types";
import type { AircraftPresentation } from "@/content/presentation";

export type FleetEntry = {
  readonly id: string;
  readonly name: string;
  readonly tier: Tier;
  readonly stepCount: number;
  readonly href: string;
};

export type CompletionView = {
  readonly id: string;
  readonly name: string;
  readonly tier: Tier;
  readonly stepCount: number;
  /** Build-time engine render, shown if the beauty art will not load. */
  readonly svg: string;
  readonly presentation: AircraftPresentation;
  /** The catalog in order, so "next in the hangar" is a real pointer. */
  readonly fleet: readonly FleetEntry[];
};

export type CompletionUiStrings = {
  readonly wingsLabel: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly stamp: string;
  readonly brand: string;
  readonly rewardIssued: string;
  /** "{tier} wings". */
  readonly wingsBadge: string;
  readonly tier: Readonly<Record<Tier, string>>;
  readonly returnToHangar: string;
  readonly foldAgain: string;
  readonly statsLabel: string;
  readonly statFolds: string;
  readonly statEarned: string;
  readonly statWings: string;
  readonly nextInHangar: string;
  /** "{folds} folds, {tier}". */
  readonly nextMeta: string;
  readonly foldNextPlane: string;
  readonly allComplete: string;
  readonly artworkAlt: string;
  /** The direct-visit state: these wings have not been earned. */
  readonly notEarnedTitle: string;
  /** "{name} has not been folded yet..." */
  readonly notEarnedBody: string;
  readonly startFolding: string;
  /** "Resume at step {step}". */
  readonly resume: string;
};

export const COMPLETION_UI_KEYS = [
  "brand.name",
  "completion.wingsLabel",
  "completion.eyebrow",
  "completion.title",
  "completion.body",
  "completion.stamp",
  "completion.rewardIssued",
  "completion.wingsBadge",
  "completion.returnToHangar",
  "completion.foldAgain",
  "completion.statsLabel",
  "completion.statFolds",
  "completion.statEarned",
  "completion.statWings",
  "completion.nextInHangar",
  "completion.nextMeta",
  "completion.foldNextPlane",
  "completion.allComplete",
  "completion.notEarnedTitle",
  "completion.notEarnedBody",
  "preflight.artworkAlt",
  "preflight.startFolding",
  "preflight.resume",
  "tier.easy",
  "tier.medium",
  "tier.advanced",
] as const;

export function completionUiFromDictionary(ui: UiDictionary): CompletionUiStrings {
  const t = (key: string): string => ui[key] ?? key;
  return {
    wingsLabel: t("completion.wingsLabel"),
    eyebrow: t("completion.eyebrow"),
    title: t("completion.title"),
    body: t("completion.body"),
    stamp: t("completion.stamp"),
    brand: t("brand.name"),
    rewardIssued: t("completion.rewardIssued"),
    wingsBadge: t("completion.wingsBadge"),
    tier: {
      easy: t("tier.easy"),
      medium: t("tier.medium"),
      advanced: t("tier.advanced"),
    },
    returnToHangar: t("completion.returnToHangar"),
    foldAgain: t("completion.foldAgain"),
    statsLabel: t("completion.statsLabel"),
    statFolds: t("completion.statFolds"),
    statEarned: t("completion.statEarned"),
    statWings: t("completion.statWings"),
    nextInHangar: t("completion.nextInHangar"),
    nextMeta: t("completion.nextMeta"),
    foldNextPlane: t("completion.foldNextPlane"),
    allComplete: t("completion.allComplete"),
    artworkAlt: t("preflight.artworkAlt"),
    notEarnedTitle: t("completion.notEarnedTitle"),
    notEarnedBody: t("completion.notEarnedBody"),
    startFolding: t("preflight.startFolding"),
    resume: t("preflight.resume"),
  };
}

export function buildFleet(
  planes: Readonly<Record<string, PlaneStructure>>,
  dict: PlanesDictionary,
  hrefFor: (planeId: string) => string,
): FleetEntry[] {
  return Object.values(planes).flatMap((structure) => {
    const strings = dict.planes[structure.id as PlaneId];
    if (!strings) return [];
    return [
      {
        id: structure.id,
        name: strings.name,
        tier: structure.tier,
        stepCount: structure.steps.length,
        href: hrefFor(structure.id),
      },
    ];
  });
}
