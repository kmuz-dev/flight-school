import type { UiDictionary } from "@/i18n/types";

export type FlightUiStrings = {
  readonly label: string;
  readonly title: string;
  readonly lockedTitle: string;
  readonly lockedBody: string;
  readonly loading: string;
  readonly unavailableTitle: string;
  readonly unavailableBody: string;
  readonly launchHint: string;
  readonly keyboardHint: string;
  readonly touchHint: string;
  readonly tiltHint: string;
  readonly enableTilt: string;
  readonly recalibrateTilt: string;
  readonly tiltUnavailable: string;
  readonly time: string;
  readonly best: string;
  readonly closePasses: string;
  readonly chain: string;
  readonly pause: string;
  readonly pausedTitle: string;
  readonly resume: string;
  readonly restart: string;
  readonly mute: string;
  readonly unmute: string;
  readonly reduceMotion: string;
  readonly fullMotion: string;
  readonly crashedTitle: string;
  readonly crashedBody: string;
  readonly timedOutTitle: string;
  readonly timedOutBody: string;
  readonly finishedTitle: string;
  readonly finishedBody: string;
  readonly flyAgain: string;
  readonly returnToHangar: string;
  readonly startFolding: string;
  readonly resumeFolding: string;
  readonly gust: string;
  readonly closePass: string;
  readonly bestTime: string;
  readonly bestClosePasses: string;
  readonly bestChain: string;
  readonly noBest: string;
  readonly era: Readonly<Record<"1950s" | "1980s" | "today", string>>;
};

export const FLIGHT_UI_KEYS = [
  "flight.label", "flight.title", "flight.lockedTitle", "flight.lockedBody",
  "flight.loading", "flight.unavailableTitle", "flight.unavailableBody",
  "flight.launchHint", "flight.keyboardHint", "flight.touchHint", "flight.tiltHint",
  "flight.enableTilt", "flight.recalibrateTilt", "flight.tiltUnavailable",
  "flight.time", "flight.best", "flight.closePasses", "flight.chain", "flight.pause",
  "flight.pausedTitle", "flight.resume", "flight.restart", "flight.mute", "flight.unmute",
  "flight.reduceMotion", "flight.fullMotion", "flight.crashedTitle", "flight.crashedBody",
  "flight.timedOutTitle", "flight.timedOutBody", "flight.finishedTitle", "flight.finishedBody",
  "flight.flyAgain", "flight.returnToHangar", "flight.startFolding", "flight.resumeFolding",
  "flight.gust", "flight.closePass", "flight.bestTime", "flight.bestClosePasses",
  "flight.bestChain", "flight.noBest", "flight.era.1950s", "flight.era.1980s", "flight.era.today",
] as const;

export function flightUiFromDictionary(ui: UiDictionary): FlightUiStrings {
  const t = (key: string): string => ui[key] ?? key;
  return {
    label: t("flight.label"), title: t("flight.title"), lockedTitle: t("flight.lockedTitle"),
    lockedBody: t("flight.lockedBody"), loading: t("flight.loading"),
    unavailableTitle: t("flight.unavailableTitle"), unavailableBody: t("flight.unavailableBody"),
    launchHint: t("flight.launchHint"), keyboardHint: t("flight.keyboardHint"),
    touchHint: t("flight.touchHint"), tiltHint: t("flight.tiltHint"),
    enableTilt: t("flight.enableTilt"), recalibrateTilt: t("flight.recalibrateTilt"),
    tiltUnavailable: t("flight.tiltUnavailable"), time: t("flight.time"), best: t("flight.best"),
    closePasses: t("flight.closePasses"), chain: t("flight.chain"), pause: t("flight.pause"),
    pausedTitle: t("flight.pausedTitle"), resume: t("flight.resume"), restart: t("flight.restart"),
    mute: t("flight.mute"), unmute: t("flight.unmute"), reduceMotion: t("flight.reduceMotion"),
    fullMotion: t("flight.fullMotion"), crashedTitle: t("flight.crashedTitle"),
    crashedBody: t("flight.crashedBody"), timedOutTitle: t("flight.timedOutTitle"),
    timedOutBody: t("flight.timedOutBody"), finishedTitle: t("flight.finishedTitle"),
    finishedBody: t("flight.finishedBody"), flyAgain: t("flight.flyAgain"),
    returnToHangar: t("flight.returnToHangar"), startFolding: t("flight.startFolding"),
    resumeFolding: t("flight.resumeFolding"), gust: t("flight.gust"), closePass: t("flight.closePass"),
    bestTime: t("flight.bestTime"), bestClosePasses: t("flight.bestClosePasses"),
    bestChain: t("flight.bestChain"), noBest: t("flight.noBest"),
    era: { "1950s": t("flight.era.1950s"), "1980s": t("flight.era.1980s"), today: t("flight.era.today") },
  };
}
