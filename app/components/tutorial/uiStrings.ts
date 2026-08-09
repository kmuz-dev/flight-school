/**
 * The seam between the flat `UiDictionary` (i18n, owned by the content track)
 * and the typed `TutorialUiStrings` the components consume.
 *
 * `TUTORIAL_UI_KEYS` is the exhaustive list of keys the tutorial screen needs
 * in every locale; the i18n audit picks them up automatically once they exist
 * in the English dictionary. A missing key renders as the key itself, which is
 * loud in QA and never silently substitutes English prose.
 */
import type { UiDictionary } from "@/i18n/types";
import type { TutorialUiStrings } from "./types";

export const TUTORIAL_UI_KEYS = [
  "tutorial.backToHangar",
  "tutorial.exit",
  "tutorial.progressLabel",
  "tutorial.license.easy",
  "tutorial.license.medium",
  "tutorial.license.advanced",
  "tutorial.stageLabel",
  "tutorial.viewHint",
  "tutorial.cameraGroupLabel",
  "tutorial.camera.front",
  "tutorial.camera.threeQuarter",
  "tutorial.camera.top",
  "tutorial.playingFold",
  "tutorial.pausedFold",
  "tutorial.paper.letter",
  "tutorial.paper.a4",
  "tutorial.paper.square",
  "tutorial.paper.index-4x6",
  "tutorial.transportLabel",
  "tutorial.play",
  "tutorial.pause",
  "tutorial.prevStep",
  "tutorial.nextStep",
  "tutorial.replay",
  "tutorial.stepLabel",
  "tutorial.timeReadout",
  "tutorial.scrubLabel",
  "tutorial.stripLabel",
  "tutorial.goToStep",
  "tutorial.stepRegionLabel",
  "tutorial.why",
  "tutorial.foldTerms",
  "tutorial.selfCheck",
  "tutorial.back",
  "tutorial.nextFold",
  "tutorial.finish",
  "tutorial.foldsToWings",
  "tutorial.tipLabel",
] as const;

export function tutorialUiFromDictionary(ui: UiDictionary): TutorialUiStrings {
  const t = (key: string): string => ui[key] ?? key;
  return {
    backToHangar: t("tutorial.backToHangar"),
    exit: t("tutorial.exit"),
    progressLabel: t("tutorial.progressLabel"),
    license: {
      easy: t("tutorial.license.easy"),
      medium: t("tutorial.license.medium"),
      advanced: t("tutorial.license.advanced"),
    },
    stageLabel: t("tutorial.stageLabel"),
    viewHint: t("tutorial.viewHint"),
    cameraGroupLabel: t("tutorial.cameraGroupLabel"),
    camera: {
      front: t("tutorial.camera.front"),
      threeQuarter: t("tutorial.camera.threeQuarter"),
      top: t("tutorial.camera.top"),
    },
    playingFold: t("tutorial.playingFold"),
    pausedFold: t("tutorial.pausedFold"),
    paper: {
      letter: t("tutorial.paper.letter"),
      a4: t("tutorial.paper.a4"),
      square: t("tutorial.paper.square"),
      "index-4x6": t("tutorial.paper.index-4x6"),
    },
    transportLabel: t("tutorial.transportLabel"),
    play: t("tutorial.play"),
    pause: t("tutorial.pause"),
    prevStep: t("tutorial.prevStep"),
    nextStep: t("tutorial.nextStep"),
    replay: t("tutorial.replay"),
    stepLabel: t("tutorial.stepLabel"),
    timeReadout: t("tutorial.timeReadout"),
    scrubLabel: t("tutorial.scrubLabel"),
    stripLabel: t("tutorial.stripLabel"),
    goToStep: t("tutorial.goToStep"),
    stepRegionLabel: t("tutorial.stepRegionLabel"),
    why: t("tutorial.why"),
    foldTerms: t("tutorial.foldTerms"),
    selfCheck: t("tutorial.selfCheck"),
    back: t("tutorial.back"),
    nextFold: t("tutorial.nextFold"),
    finish: t("tutorial.finish"),
    foldsToWings: t("tutorial.foldsToWings"),
    tipLabel: t("tutorial.tipLabel"),
  };
}
