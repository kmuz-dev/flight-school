/**
 * View-model types for Wings earned (SCREENS.md §4).
 *
 * The secondary strip below the certificate shows only what localStorage can
 * actually prove: how many folds the sequence had, the date the wings were
 * issued, and how many wings the cadet holds. The mockup's fold-time and
 * replay counters are not recorded anywhere, so they are not shown.
 */
import type { PlaneStructure, Tier } from "@/content/types";
import type { PlaneId } from "@/content/types";
import type { PlanesDictionary, UiDictionary } from "@/i18n/types";

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
  /** Build-time engine render of the finished plane, behind the stamp. */
  readonly svg: string;
  /** The catalog in order, so "next in the hangar" is a real pointer. */
  readonly fleet: readonly FleetEntry[];
};

export type CompletionUiStrings = {
  readonly certificateLabel: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly certified: string;
  readonly brand: string;
  readonly rewardIssued: string;
  /** "{tier} wings". */
  readonly wingsBadge: string;
  readonly tier: Readonly<Record<Tier, string>>;
  readonly license: Readonly<Record<Tier, string>>;
  readonly returnToHangar: string;
  readonly foldAgain: string;
  readonly statsLabel: string;
  readonly statFolds: string;
  readonly statCertified: string;
  readonly statWings: string;
  readonly nextInHangar: string;
  /** "{folds} folds, {license}". */
  readonly nextMeta: string;
  readonly foldNextPlane: string;
  readonly allComplete: string;
};

export const COMPLETION_UI_KEYS = [
  "brand.name",
  "completion.certificateLabel",
  "completion.eyebrow",
  "completion.title",
  "completion.body",
  "completion.certified",
  "completion.rewardIssued",
  "completion.wingsBadge",
  "completion.returnToHangar",
  "completion.foldAgain",
  "completion.statsLabel",
  "completion.statFolds",
  "completion.statCertified",
  "completion.statWings",
  "completion.nextInHangar",
  "completion.nextMeta",
  "completion.foldNextPlane",
  "completion.allComplete",
  "tier.easy",
  "tier.medium",
  "tier.advanced",
  "tutorial.license.easy",
  "tutorial.license.medium",
  "tutorial.license.advanced",
] as const;

export function completionUiFromDictionary(ui: UiDictionary): CompletionUiStrings {
  const t = (key: string): string => ui[key] ?? key;
  return {
    certificateLabel: t("completion.certificateLabel"),
    eyebrow: t("completion.eyebrow"),
    title: t("completion.title"),
    body: t("completion.body"),
    certified: t("completion.certified"),
    brand: t("brand.name"),
    rewardIssued: t("completion.rewardIssued"),
    wingsBadge: t("completion.wingsBadge"),
    tier: {
      easy: t("tier.easy"),
      medium: t("tier.medium"),
      advanced: t("tier.advanced"),
    },
    license: {
      easy: t("tutorial.license.easy"),
      medium: t("tutorial.license.medium"),
      advanced: t("tutorial.license.advanced"),
    },
    returnToHangar: t("completion.returnToHangar"),
    foldAgain: t("completion.foldAgain"),
    statsLabel: t("completion.statsLabel"),
    statFolds: t("completion.statFolds"),
    statCertified: t("completion.statCertified"),
    statWings: t("completion.statWings"),
    nextInHangar: t("completion.nextInHangar"),
    nextMeta: t("completion.nextMeta"),
    foldNextPlane: t("completion.foldNextPlane"),
    allComplete: t("completion.allComplete"),
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
