/**
 * Where the core math is bound to the renderer, and the only module in the
 * engine that pulls Three.js into the graph.
 *
 * It sits behind `loadFoldEngine()` in the seam rather than being exported
 * from it, and that indirection is the whole point: a static export of this
 * file would put the renderer in the first-paint bundle of every route that
 * touches `@/engine`, including the hangar, whose six cards are build-time SVG
 * until a cadet wakes a scene. Reached through `import()`, it becomes a chunk
 * that arrives when something actually needs to draw.
 */
import { computeFoldState, computeStepDelta, validateSequence } from "@/engine/core/state";
import { poseAtProgress, posesForState } from "@/engine/core/pose";
import { renderStateToSvg } from "@/engine/core/svgRender";
import { restTransform } from "@/engine/core/rest";

import type { EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import type { CoreApi } from "./coreApi";
import { FoldEngine } from "./renderer";
import { createFallbackEngine, isWebGLAvailable } from "./fallback";

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
    const delta = computeStepDelta(structure, n);
    if (!delta) return posesForState(computeFoldState(structure, n - 1));
    return poseAtProgress(delta, t);
  },
  restTransform,
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
