/**
 * View-model types for the tutorial screen (SCREENS.md §3).
 *
 * Every user-visible string on this screen arrives through one of these types.
 * Components never contain prose: `TutorialUiStrings` carries chrome copy
 * (built from the flat `UiDictionary`) and `TutorialStepView` carries the
 * per-step prose (built from `PlaneStrings` + the glossary).
 */
import type { PaperFormat, CameraHint } from "@/engine/core/types";

export type CameraPreset = NonNullable<CameraHint["preset"]>;

export const CAMERA_PRESETS: readonly CameraPreset[] = ["front", "threeQuarter", "top"];

/** How a fold term is drawn in the FOLD TERMS list. Derived from the term key. */
export type CreaseIconVariant = "valley" | "mountain" | "line";

export type GlossaryItemView = {
  readonly key: string;
  readonly term: string;
  readonly definition: string;
  readonly icon: CreaseIconVariant;
};

export type TutorialStepView = {
  /** Engine/content step id, e.g. "dart.step-04". */
  readonly id: string;
  /** 0-based position in the sequence. */
  readonly index: number;
  /** Archivo Narrow caps headline for the rail. */
  readonly title: string;
  /** Kid-clear instruction paragraph (renders at 18px minimum). */
  readonly instruction: string;
  /** Optional rationale rendered as the instruction's second paragraph. */
  readonly explanation?: string;
  /** Tip bar copy: per-step when the step declares one, per-plane otherwise. */
  readonly tip?: string;
  /** Red mono label drawn over the stage, e.g. "VALLEY FOLD". */
  readonly annotationLabel?: string;
  readonly glossary: readonly GlossaryItemView[];
};

/**
 * Chrome copy for the tutorial screen. Templates use `{name}` placeholders and
 * are filled with `format()`.
 */
export type TutorialUiStrings = {
  readonly skipToContent: string;
  readonly backToHangar: string;
  readonly progressLabel: string;
  /** Announces a changed step without moving keyboard focus. */
  readonly stepAnnouncement: string;
  readonly stageLabel: string;
  readonly viewHint: string;
  readonly cameraGroupLabel: string;
  readonly camera: Readonly<Record<CameraPreset, string>>;
  /** "PLAYING FOLD {step}" / "PAUSED - FOLD {step}". */
  readonly playingFold: string;
  readonly pausedFold: string;
  readonly paper: Readonly<Record<PaperFormat, string>>;
  readonly transportLabel: string;
  readonly play: string;
  readonly pause: string;
  readonly replay: string;
  /** "STEP {current} / {total}". */
  readonly stepLabel: string;
  /** "{elapsed} / {total}". */
  readonly timeReadout: string;
  readonly scrubLabel: string;
  readonly stepSelectLabel: string;
  readonly staticFallback: string;
  readonly stepRegionLabel: string;
  readonly foldTerms: string;
  readonly back: string;
  readonly nextFold: string;
  readonly finish: string;
  readonly tipLabel: string;
};

// Interpolation and counter padding live in components/ui/format: one copy,
// used by every screen.
export { format, pad2 } from "@/components/ui/format";

/** Seconds -> "m:ss" for the transport readout. */
export function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const whole = Math.floor(safe);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
