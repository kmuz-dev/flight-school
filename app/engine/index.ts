/**
 * The fold engine's public seam.
 *
 * React imports from here and nothing deeper. This is also the ONE file that
 * binds T1's core math to the render layer, so if the core's real signatures
 * differ from `render/coreApi.ts`, this is the only place that needs editing.
 *
 * The engine is React-free by architectural rule (SPEC 3): it owns no DOM
 * beyond the canvas it appends, and React drives it through `FoldEngineHandle`.
 */
import { computeFoldState, computeStepDelta, validateSequence } from "@/engine/core/state";
import { poseAtProgress, posesForState } from "@/engine/core/pose";
import { renderStateToSvg } from "@/engine/core/svgRender";

import type { EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import type { CoreApi } from "./render/coreApi";
import { FoldEngine } from "./render/renderer";
import { createFallbackEngine, isWebGLAvailable } from "./render/fallback";
import { renderThumbnail, svgThumbnail, type ThumbnailOptions } from "./render/thumbnail";

/**
 * The core math, as the render layer consumes it.
 *
 * The one adapter: the render layer asks for poses part-way through step `n`,
 * while the core interpolates from the previous state plus that step's delta
 * (the delta carries the fold axis, which two end states do not).
 */
export const core: CoreApi = {
  computeFoldState,
  validateSequence,
  posesForState,
  poseAtProgress: (structure, n, t) => {
    const previous = computeFoldState(structure, n - 1);
    const delta = computeStepDelta(structure, n);
    if (!delta) return posesForState(previous);
    return poseAtProgress(previous, delta, t);
  },
  renderStateToSvg,
};

/**
 * Mount a fold engine into `container`. Falls back to flat SVG rendering when
 * WebGL is unavailable or the 3D stage fails to start, so callers never have to
 * handle a missing engine.
 */
export function createFoldEngine(
  container: HTMLElement,
  structure: PlaneStructure,
  opts: EngineOptions = {},
): FoldEngineHandle {
  if (opts.forceFallback === true || !isWebGLAvailable(container.ownerDocument)) {
    return createFallbackEngine(container, structure, opts, core);
  }
  try {
    return new FoldEngine(container, structure, opts, { core });
  } catch {
    container.replaceChildren();
    return createFallbackEngine(container, structure, opts, core);
  }
}

/** Finished-plane thumbnail as a data URL, via the one shared offscreen context. */
export function renderPlaneThumbnail(
  structure: PlaneStructure,
  options?: ThumbnailOptions,
): Promise<string> {
  return renderThumbnail(structure, core, options);
}

/** Synchronous SVG thumbnail, for build-time generation and no-WebGL callers. */
export function renderPlaneThumbnailSvg(structure: PlaneStructure): string {
  return svgThumbnail(structure, core);
}

// Pure core functions, re-exported for tests, content validation, the
// fold-editor dev route and the thumbnail pipeline.
export { computeFoldState, validateSequence, renderStateToSvg };

export { isWebGLAvailable } from "./render/fallback";
export { disposeThumbnailRenderer } from "./render/thumbnail";
export {
  CAMERA_PRESETS,
  DEFAULT_PRESET,
  framingDistance,
  orbitToPosition,
  positionToOrbit,
  resolveCameraHint,
  FoldEngine,
} from "./render/renderer";
export { stepDuration, createStepTimeline } from "./render/timeline";
export { STAGE_THEMES, stageTheme, SceneModel } from "./render/sceneModel";

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
