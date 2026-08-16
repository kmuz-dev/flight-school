/**
 * A local stand-in for T1's `app/engine/core/{state,pose,svgRender}` so the
 * render layer is testable before the real math lands. TEST-ONLY: production
 * code binds the real modules in `app/engine/index.ts`.
 *
 * The geometry is deliberately fake but the CONTRACT is exact - the same
 * signatures, the same key/return shapes, the same purity guarantees the
 * renderer relies on. If this stub and T1's modules ever disagree, this file is
 * the written statement of what the render layer assumed.
 *
 * Known blind spot: facet ids here are a simple 0..n-1 run and a "split" only
 * ever appends, so every id in step n also exists in step n-1. Real creases
 * split facets and mint ids that the previous state has never seen, and a bug
 * that only appears for those ids is invisible to every test in tests/render.
 * One lived here for a while. Anything about pose-key coverage has to be tested
 * against the real core - see tests/integration/geometry.test.ts.
 */
import type { Facet, FoldState, Iso2, Vec2 } from "@/engine/core/types";
import type { SvgOptions } from "@/engine/core/svgRender";
import type { PlaneId, PlaneStructure } from "@/content/types";
import type { CoreApi, PoseMap } from "../coreApi";

const IDENTITY_ISO: Iso2 = [1, 0, 0, 0, 1, 0];
/** Paper thickness at model scale, already baked into every pose. */
export const LAYER_Z_MM = 0.25;

function square(size: number, offsetX: number): readonly Vec2[] {
  const h = size / 2;
  return [
    [offsetX - h, -h],
    [offsetX + h, -h],
    [offsetX + h, h],
    [offsetX - h, h],
  ];
}

/** Facet count grows with the step index, standing in for crease splitting. */
function facetsForStep(n: number): readonly Facet[] {
  const count = Math.max(n, -1) + 2;
  const facets: Facet[] = [];
  for (let i = 0; i < count; i += 1) {
    facets.push({
      id: i,
      polygon: square(100, i * 110 - (count - 1) * 55),
      flatMap: IDENTITY_ISO,
      layer: i,
      bend: [],
    });
  }
  return facets;
}

function translation(x: number, y: number, z: number): number[] {
  // Column-major 4x4, as `THREE.Matrix4.fromArray` expects.
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

export type CoreStubCall =
  | { readonly fn: "computeFoldState"; readonly n: number }
  | { readonly fn: "posesForState"; readonly facets: number }
  | { readonly fn: "poseAtProgress"; readonly t: number }
  | { readonly fn: "renderStateToSvg"; readonly options?: SvgOptions }
  | { readonly fn: "restTransform" }
  | { readonly fn: "validateSequence" };

export type CoreStub = CoreApi & {
  readonly calls: CoreStubCall[];
  reset(): void;
};

export function createCoreStub(): CoreStub {
  const calls: CoreStubCall[] = [];

  const stub: CoreStub = {
    calls,
    reset() {
      calls.length = 0;
    },

    computeFoldState(_structure: PlaneStructure, n: number): FoldState {
      calls.push({ fn: "computeFoldState", n });
      const facets = facetsForStep(n);
      return {
        facets,
        creaseMarks: [],
        maxLayer: Math.max(facets.length - 1, 0),
      };
    },

    validateSequence() {
      calls.push({ fn: "validateSequence" });
      return [];
    },

    posesForState(state: FoldState): PoseMap {
      calls.push({ fn: "posesForState", facets: state.facets.length });
      const map = new Map<number, number[]>();
      // Sentinel x=1000 marks "settled state", so a test can prove the engine
      // snapped to the pure state rather than keeping the last tween frame.
      for (const facet of state.facets) {
        map.set(facet.id, translation(1000, 0, facet.layer * LAYER_Z_MM));
      }
      return map;
    },

    poseAtProgress(_structure: PlaneStructure, n: number, t: number): PoseMap {
      calls.push({ fn: "poseAtProgress", t });
      const map = new Map<number, number[]>();
      // Keys are the post-step facet ids: splits are applied up front.
      // facetsForStep directly, not computeFoldState: the interpolation call
      // must not be observable as an extra state computation.
      for (const facet of facetsForStep(n)) {
        map.set(facet.id, translation(t * 100, 0, facet.layer * LAYER_Z_MM));
      }
      return map;
    },

    restTransform(): readonly number[] {
      // Identity: the stub's facets never bend, and the real transform is
      // exactly the identity for a state with no bends. A render test that
      // wants to prove the stage APPLIES the transform has to supply its own
      // matrix rather than lean on this.
      calls.push({ fn: "restTransform" });
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    },

    renderStateToSvg(state: FoldState, options?: SvgOptions): string {
      calls.push({ fn: "renderStateToSvg", options });
      return `<svg data-facets="${state.facets.length}" viewBox="0 0 210 297"></svg>`;
    },
  };

  return stub;
}

/** Minimal structure fixture: `stepCount` valley folds with camera hints. */
export function makeStructure(stepCount = 4, id: PlaneId = "dart"): PlaneStructure {
  const steps = Array.from({ length: stepCount }, (_, i) => ({
    id: `${id}.step-${String(i + 1).padStart(2, "0")}`,
    action: {
      type: "fold" as const,
      crease: { a: [-105, 0] as Vec2, b: [105, 0] as Vec2 },
      side: "left" as const,
      angle: 180,
      direction: "valley" as const,
    },
    camera: i === 0 ? undefined : { preset: "threeQuarter" as const },
    hasWhy: true,
  }));

  return {
    id,
    tier: "easy",
    paper: {
      format: "letter-a4",
      prep: { letter: [], a4: [], square: [], "index-4x6": [] },
    },
    ratings: { speed: 3, distance: 3, airtime: 3, ease: 3 },
    steps,
    accent: "#D64541",
  };
}
