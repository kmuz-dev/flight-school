/**
 * View-model types for the tutorial screen (SCREENS.md §3).
 *
 * Every user-visible string on this screen arrives through one of these types.
 * Components never contain prose: `TutorialUiStrings` carries chrome copy
 * (built from the flat `UiDictionary`) and `TutorialStepView` carries the
 * per-step prose (built from `PlaneStrings` + the glossary).
 */
import type { PaperFormat, CameraHint, EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure, Tier } from "@/content/types";

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
  /** Optional one-line WHY callout. */
  readonly why?: string;
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
  readonly backToHangar: string;
  readonly exit: string;
  readonly progressLabel: string;
  readonly license: Readonly<Record<Tier, string>>;
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
  readonly prevStep: string;
  readonly nextStep: string;
  readonly replay: string;
  /** "STEP {current} / {total}". */
  readonly stepLabel: string;
  /** "{elapsed} / {total} - SPEED {speed}x". */
  readonly timeReadout: string;
  readonly scrubLabel: string;
  readonly stripLabel: string;
  /** "Go to step {step}". */
  readonly goToStep: string;
  readonly stepRegionLabel: string;
  readonly why: string;
  readonly foldTerms: string;
  readonly selfCheck: string;
  readonly back: string;
  readonly nextFold: string;
  readonly finish: string;
  /** "{count} FOLDS TO YOUR WINGS". */
  readonly foldsToWings: string;
  readonly tipLabel: string;
};

export type EngineFactory = (
  container: HTMLElement,
  structure: PlaneStructure,
  opts?: EngineOptions,
) => FoldEngineHandle;

// Interpolation and counter padding live in components/ui/format: one copy,
// used by every screen.
export { format, pad2 } from "@/components/ui/format";

/** Seconds -> "m:ss" for the transport readout. */
export function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const whole = Math.floor(safe);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
