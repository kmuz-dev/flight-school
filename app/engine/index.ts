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
 * The rule that follows: nothing in this file may statically import a value
 * from `./render/*` that reaches Three.js or GSAP, however far down the graph.
 * The renderer arrives through `loadFoldEngine`.
 *
 * `./render/fallback` is the one static import from that directory, because it
 * is flat SVG over the core and reaches neither library - `stepDuration` was
 * moved to `./render/duration` to keep it that way. Holding it costs 8.6 KB of
 * eager JS on the hangar (594 KB -> 603 KB, measured on `/en` after `npm run
 * build`), most of it the core math that a re-export alone let the bundler
 * shake out. That is the price of the guarantee in `loadFoldEngine` below, and
 * it leaves the 644 KB renderer chunk exactly where it was: lazy.
 */
import { computeFoldState } from "@/engine/core/state";
import { renderStateToSvg } from "@/engine/core/svgRender";
import { createFallbackEngine } from "./render/fallback";
import { reportRendererUnavailable } from "./report";
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
 * Mount the flat SVG stage without the renderer chunk. Same handle, same
 * events, no animation - the shape the tutorial already degrades to when a
 * machine has no WebGL.
 */
const svgOnlyEngine: FoldEngineFactory = (container, structure, opts = {}) =>
  createFallbackEngine(container, structure, opts, { computeFoldState, renderStateToSvg });

/**
 * Fetch the renderer and return the factory that mounts a stage.
 *
 * Memoised, because the hangar can wake two scenes at once and a component
 * that remounts should not restart the chain; the module itself is evaluated
 * once regardless, so this only saves the promise plumbing.
 *
 * The returned promise never rejects, and the factory it resolves to never
 * throws for want of WebGL - it falls back to flat SVG rendering - so a caller
 * has one path, not two. A chunk that cannot be fetched is held to the same
 * bargain: the fetch fails for reasons that have nothing to do with the cadet
 * (a dropped connection, a document left open across a redeploy that has since
 * purged the chunk it names), and the PRD's promise is that such a machine
 * still folds every plane. Rejecting here would instead blank the stage, strand
 * the transport controls, and - since every caller starts this with
 * `.then(start)` inside an effect, where no error boundary can see an async
 * rejection - do it silently.
 *
 * The failure is not memoised, so the next stage to open tries the renderer
 * again and a cadet who was merely offline for a moment gets 3D back.
 *
 * Silently, though, is the one thing it must not do it: a renderer broken by a
 * bad deploy would look exactly like a slow connection, forever. The degrade is
 * announced through `reportRendererUnavailable` - see `./report` for why that
 * is a warning and a constructor fault is an error.
 */
export function loadFoldEngine(): Promise<FoldEngineFactory> {
  pending ??= import("./render/create").then(
    (m) => m.createFoldEngine,
    (cause: unknown) => {
      pending = null;
      reportRendererUnavailable(cause);
      return svgOnlyEngine;
    },
  );
  return pending;
}

export type { CoreApi, PoseMap } from "./render/coreApi";
export type { ThumbnailOptions } from "./render/thumbnail";
export type { CameraPreset, Orbit } from "./render/renderer";
export type { StageTheme } from "./render/sceneModel";
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
