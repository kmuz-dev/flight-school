/**
 * The fold engine's public seam.
 *
 * React imports from here and nothing deeper (SPEC 3), and the engine is
 * React-free in return: it owns no DOM beyond the canvas it appends, and React
 * drives it through `FoldEngineHandle`.
 *
 * Everything exported here is pure core math or a type, with one exception -
 * `loadFoldEngine`, which fetches the renderer on demand. That asymmetry is
 * deliberate. Three.js is the heaviest thing the project ships and the least
 * often needed: the hangar draws six cards from build-time SVG, preflight
 * shows one plane, and the promise the whole site rests on is that a machine
 * with no WebGL still folds every plane. A seam that imported the renderer
 * statically put 178 KB of it into the first paint of every route that touched
 * any of the functions below, which is how it was measured before the split.
 *
 * The rule that follows: nothing in this file may statically import from
 * `./render/*` except as `import type`. Values from the render layer arrive
 * through `loadFoldEngine`.
 */
import type { EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

export { computeFoldState, computeStepDelta, validateSequence, totalArea } from "@/engine/core/state";
export { renderStateToSvg } from "@/engine/core/svgRender";
export { facetInTable, facetSide } from "./core/fold";
export { area, centroid, boundingBox, classify, splitConvex } from "./core/polygon";
export { isoApply, isoDet, isoInverse } from "./core/iso2";
export { PAPER_SIZES, LAYER_THICKNESS, formatForPlane, freshSheet } from "./core/paper";

/** What `loadFoldEngine` resolves to: the factory that mounts a stage. */
export type FoldEngineFactory = (
  container: HTMLElement,
  structure: PlaneStructure,
  opts?: EngineOptions,
) => FoldEngineHandle;

let pending: Promise<FoldEngineFactory> | null = null;

/**
 * Fetch the renderer and return the factory that mounts a stage.
 *
 * Memoised, because the hangar can wake two scenes at once and a component
 * that remounts should not restart the chain; the module itself is evaluated
 * once regardless, so this only saves the promise plumbing.
 *
 * The factory it resolves to never throws for want of WebGL - it falls back to
 * flat SVG rendering - so a caller has one path, not two.
 */
export function loadFoldEngine(): Promise<FoldEngineFactory> {
  pending ??= import("./render/create").then((m) => m.createFoldEngine);
  return pending;
}

export type { CoreApi, PoseMap } from "./render/coreApi";
export type { ThumbnailOptions } from "./render/thumbnail";
export type { CameraPreset, Orbit } from "./render/renderer";
export type { StageTheme, ThemeName } from "./render/sceneModel";
export type { StepTimeline, StepTimelineOptions } from "./render/timeline";
export type {
  AnnotationAnchor,
  CameraHint,
  EngineEvent,
  EngineOptions,
  FoldEngineHandle,
  FoldState,
  ValidationIssue,
} from "@/engine/core/types";
