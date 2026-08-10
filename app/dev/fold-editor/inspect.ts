/**
 * Pure derivations for the fold editor's inspector panels.
 *
 * Everything the tool shows about a step is derived here from the engine's own
 * pure functions, never re-derived by hand: the facet table reads the state the
 * reducer produced, the diagnostics read `computeStepDelta`, and the validation
 * list is `validateSequence` verbatim. If this file disagrees with the engine,
 * this file is wrong.
 *
 * DOM-free on purpose: unit tested in tests/dev/inspect.test.ts.
 */
import type {
  FoldAction,
  FoldState,
  StepDelta,
  ValidationIssue,
  Vec2,
} from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { PAPER_SIZES, area, centroid, computeFoldState, computeStepDelta, facetInTable, formatForPlane, isoDet, totalArea } from "@/engine";
import { LAYER_THICKNESS } from "@/engine/core/paper";
import { multiply, poseAtProgress, poseForFacet, transformPoint, type Mat4 } from "@/engine/core/pose";
import { restFrame } from "@/engine/core/rest";
import { describeLayers } from "./plan";

/** Relative area drift beyond this is worth flagging to a geometry author. */
export const AREA_TOLERANCE = 1e-6;

export type FacetRow = {
  readonly id: number;
  readonly layer: number;
  /** Millimetres squared. An isometry preserves area, so paper area == table area. */
  readonly area: number;
  /** Centroid in TABLE space (mm) - the coordinates an author reads off the plan. */
  readonly centroid: Vec2;
  /** Sign of det(flatMap): +1 front face up, -1 face down. */
  readonly parity: 1 | -1;
  readonly bent: boolean;
  readonly bendCount: number;
  readonly vertexCount: number;
};

/** The facets of a state, bottom layer first, as inspector rows. */
export function facetRows(state: FoldState): FacetRow[] {
  return state.facets
    .map((facet) => {
      const det = isoDet(facet.flatMap);
      return {
        id: facet.id,
        layer: facet.layer,
        area: area(facet.polygon),
        centroid: centroid(facetInTable(facet)),
        parity: (det < 0 ? -1 : 1) as 1 | -1,
        bent: facet.bend.length > 0,
        bendCount: facet.bend.length,
        vertexCount: facet.polygon.length,
      };
    })
    .sort((a, b) => a.layer - b.layer || a.id - b.id);
}

/** The unfolded sheet's area in mm^2 - what `totalArea` must equal without a cut. */
export function sheetArea(structure: PlaneStructure): number {
  const size = PAPER_SIZES[formatForPlane(structure.paper.format)];
  return size.width * size.height;
}

/**
 * Paper is conserved: folding only ever moves and subdivides it. Any difference
 * between the live area and the sheet area that a `cut` does not explain is a
 * geometry bug, most often a split that culled a facet as a sliver.
 */
export function hasAreaDrift(
  currentArea: number,
  sheet: number,
  cutSoFar: boolean,
): boolean {
  if (cutSoFar) return false;
  return Math.abs(currentArea - sheet) > sheet * AREA_TOLERANCE;
}

export type LayerChangeRow = {
  readonly facetId: number;
  readonly from: number;
  readonly to: number;
};

export type StepDiagnostics = {
  /** -1 means the fresh sheet, before any step has run. */
  readonly stepIndex: number;
  readonly stepId: string | null;
  readonly action: FoldAction | null;
  readonly facetCount: number;
  readonly maxLayer: number;
  readonly totalArea: number;
  readonly sheetArea: number;
  /** Signed difference from the sheet area, in mm^2. */
  readonly areaDrift: number;
  /** True when the drift is real rather than a deliberate cut. */
  readonly areaDrifted: boolean;
  readonly delta: StepDelta | null;
  readonly layerChanges: readonly LayerChangeRow[];
  /**
   * Lowest world z anywhere in the step's animation, and the lowest either of
   * its endpoints reaches.
   *
   * The single number that would have caught the defect this tool exists to
   * catch. Two thirds of the catalogue's steps used to sweep paper as deep as
   * -105mm through a floor mesh at z=-1.5, so it did not look wrong on the
   * stage - it disappeared - and every other reading here was clean because
   * every other reading looks at the endpoints.
   */
  readonly lowestZ: number;
  readonly endpointZ: number;
  /** True when the step dips more than a layer of paper below its endpoints. */
  readonly divesUnderTable: boolean;
  /** How the settled model stands up: roll, rise, and the box it then occupies. */
  readonly rest: {
    readonly rollDeg: number;
    readonly liftMm: number;
    readonly span: number;
    readonly length: number;
    readonly height: number;
  };
};

/**
 * Everything the diagnostics panel shows for one step index.
 *
 * `index` is 0-based over `structure.steps`; -1 is the fresh sheet. The state
 * reported is the state AFTER the step, which is what the SVG ground truth
 * panel renders, so the two always describe the same geometry.
 */
export function stepDiagnostics(structure: PlaneStructure, index: number): StepDiagnostics {
  const clamped = Math.max(-1, Math.min(index, structure.steps.length - 1));
  const state = computeFoldState(structure, clamped);
  const step = clamped >= 0 ? structure.steps[clamped] : undefined;
  const delta = clamped >= 0 ? computeStepDelta(structure, clamped) : null;

  const sheet = sheetArea(structure);
  const current = totalArea(state);
  const cutSoFar = structure.steps
    .slice(0, clamped + 1)
    .some((s) => s.action.type === "cut");

  // The delta records where EVERY facet's layer starts and ends, because
  // `poseAtProgress` needs the start to undo what the rotation does to a layer
  // offset. The panel wants the ones that actually moved.
  const layerChanges: LayerChangeRow[] = delta
    ? [...delta.layerChanges.entries()]
        .filter(([, change]) => change.from !== change.to)
        .map(([facetId, change]) => ({ facetId, from: change.from, to: change.to }))
        .sort((a, b) => a.facetId - b.facetId)
    : [];

  const sweep = sweepDepth(delta);
  const frame = restFrame(state);
  const box = restBox(state, frame.matrix);

  return {
    stepIndex: clamped,
    stepId: step?.id ?? null,
    action: step?.action ?? null,
    facetCount: state.facets.length,
    maxLayer: state.maxLayer,
    totalArea: current,
    sheetArea: sheet,
    areaDrift: current - sheet,
    areaDrifted: hasAreaDrift(current, sheet, cutSoFar),
    delta,
    layerChanges,
    lowestZ: sweep.lowest,
    endpointZ: sweep.endpoints,
    divesUnderTable: sweep.lowest < sweep.endpoints - LAYER_THICKNESS,
    rest: {
      rollDeg: frame.rollDeg,
      liftMm: frame.liftMm,
      span: box.span,
      length: box.length,
      height: box.height,
    },
  };
}

/** Lowest z over 33 samples of the step, and the lower of its two endpoints. */
function sweepDepth(delta: StepDelta | null): { lowest: number; endpoints: number } {
  if (!delta) return { lowest: 0, endpoints: 0 };
  const at = (t: number): number => {
    const poses = poseAtProgress(delta, t);
    let z = Infinity;
    for (const facet of delta.startFacets) {
      const pose = poses.get(facet.id);
      if (!pose) continue;
      for (const p of facet.polygon) z = Math.min(z, transformPoint(pose, p)[2]);
    }
    return Number.isFinite(z) ? z : 0;
  };
  const endpoints = Math.min(at(0), at(1));
  let lowest = endpoints;
  for (let i = 1; i < 32; i += 1) lowest = Math.min(lowest, at(i / 32));
  return { lowest, endpoints };
}

/** The box the state occupies once it is standing up. */
function restBox(state: FoldState, rest: Mat4) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const facet of state.facets) {
    const pose = multiply(rest, poseForFacet(facet));
    for (const p of facet.polygon) {
      const w = transformPoint(pose, p);
      for (let i = 0; i < 3; i += 1) {
        min[i] = Math.min(min[i]!, w[i]!);
        max[i] = Math.max(max[i]!, w[i]!);
      }
    }
  }
  if (!Number.isFinite(min[0])) return { span: 0, length: 0, height: 0 };
  return { span: max[0]! - min[0]!, length: max[1]! - min[1]!, height: max[2]! - min[2]! };
}

/** Validation issues bucketed by the step index they belong to. */
export function issuesByStep(
  issues: readonly ValidationIssue[],
): ReadonlyMap<number, ValidationIssue[]> {
  const out = new Map<number, ValidationIssue[]>();
  for (const issue of issues) {
    const list = out.get(issue.stepIndex);
    if (list) list.push(issue);
    else out.set(issue.stepIndex, [issue]);
  }
  return out;
}

/** A one-line summary of what a step does, for the step rail. */
export function describeAction(action: FoldAction): string {
  switch (action.type) {
    case "fold":
      return `fold ${action.side} / ${action.angle} deg ${action.direction} / layers ${describeLayers(action.layers)}`;
    case "unfold":
      return `unfold to ${action.toStep}`;
    case "flip":
      return "flip over";
    case "rotate":
      return `rotate ${action.degrees} deg`;
    case "cut":
      return `cut, keep ${action.keep}`;
  }
}

/** Millimetres, one decimal - the precision fold sequences are authored at. */
export function mm(value: number): string {
  return value.toFixed(1);
}

export function formatVec(v: Vec2, digits = 1): string {
  return `(${v[0].toFixed(digits)}, ${v[1].toFixed(digits)})`;
}
