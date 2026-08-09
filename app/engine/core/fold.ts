/**
 * The fold reducer: one step in, one new state out.
 *
 * The central trick: a step's crease is authored in TABLE space (the silhouette
 * the user currently sees), but every facet's polygon lives in PAPER space. So
 * for each facet we pull the crease back through that facet's own `flatMap`
 * inverse and split there. One table-space line therefore lands correctly on
 * every stacked layer it crosses, which is the behaviour that makes repeated
 * folding over folded paper work at all.
 */
import type {
  CreaseMark,
  Facet,
  FoldState,
  FoldStep,
  Line2,
  PartialRotation,
  StepDelta,
  Vec2,
} from "./types";
import { EPS, cross, sub, toVec3 } from "./vec2";
import {
  ISO_IDENTITY,
  isoApply,
  isoCompose,
  isoFlipY,
  isoInverse,
  isoReflection,
  isoRotation,
} from "./iso2";
import { centroid, classify, isSliver, splitConvex } from "./polygon";
import { LAYER_THICKNESS } from "./paper";

export { LAYER_THICKNESS };

/** The facet's polygon expressed in table space. */
export function facetInTable(facet: Facet): Vec2[] {
  return facet.polygon.map((p) => isoApply(facet.flatMap, p));
}

/** Pull a table-space line back into this facet's paper space. */
function creaseInPaper(facet: Facet, crease: Line2): Line2 {
  const inv = isoInverse(facet.flatMap);
  return { a: isoApply(inv, crease.a), b: isoApply(inv, crease.b) };
}

/**
 * Which side of the (table-space) crease does this facet sit on?
 * Returns +1 left, -1 right, 0 straddling or on the line.
 */
function facetSide(facet: Facet, crease: Line2): -1 | 0 | 1 {
  const pts = facetInTable(facet);
  let sawLeft = false;
  let sawRight = false;
  for (const p of pts) {
    const c = classify(crease, p);
    if (c === 1) sawLeft = true;
    else if (c === -1) sawRight = true;
  }
  if (sawLeft && sawRight) return 0;
  if (sawLeft) return 1;
  if (sawRight) return -1;
  // Entirely on the line: use the centroid as a tiebreak.
  return classify(crease, centroid(pts));
}

type SplitOutcome = {
  facets: Facet[];
  marks: CreaseMark[];
  nextId: number;
};

/**
 * Split every facet the crease crosses. Children inherit flatMap/layer/bend, so
 * this operation changes only the facet subdivision, never the pose.
 */
function splitAll(state: FoldState, crease: Line2, startId: number): SplitOutcome {
  const out: Facet[] = [];
  const marks: CreaseMark[] = [];
  let nextId = startId;

  for (const facet of state.facets) {
    if (facetSide(facet, crease) !== 0) {
      out.push(facet);
      continue;
    }
    const local = creaseInPaper(facet, crease);
    const { left, right, segment } = splitConvex(facet.polygon, local);

    if (isSliver(left) || isSliver(right)) {
      // The crease only grazed this facet.
      out.push(facet);
      continue;
    }
    // Preserve the original id on the left child so unfold ancestry stays cheap
    // to follow; the right child gets a fresh id.
    const leftChild: Facet = { ...facet, id: facet.id, polygon: left };
    const rightChild: Facet = { ...facet, id: nextId++, polygon: right };
    out.push(leftChild, rightChild);
    if (segment) marks.push({ facetId: facet.id, segment });
  }

  return { facets: out, marks, nextId };
}

/**
 * Narrow the movers to part of the stack. A wing pair lives on one side of its
 * crease as two stacked halves, so opening it into a V needs two steps that
 * differ by which layers move and which way they turn.
 */
function filterByLayers(
  facets: readonly Facet[],
  layers: "all" | "top" | "bottom" | readonly number[] | undefined,
): Facet[] {
  if (layers === undefined || layers === "all") return [...facets];
  if (Array.isArray(layers)) {
    const wanted = new Set(layers as readonly number[]);
    return facets.filter((f) => wanted.has(f.layer));
  }
  if (facets.length === 0) return [];
  const present = [...new Set(facets.map((f) => f.layer))].sort((a, b) => a - b);
  const mid = present[Math.floor(present.length / 2)] ?? 0;
  return layers === "top"
    ? facets.filter((f) => f.layer >= mid)
    : facets.filter((f) => f.layer < mid);
}

/** Consecutive layer indices from 0, order preserved. */
function renormalizeLayers(facets: readonly Facet[]): Facet[] {
  const used = [...new Set(facets.map((f) => f.layer))].sort((a, b) => a - b);
  const remap = new Map<number, number>();
  used.forEach((l, i) => remap.set(l, i));
  return facets.map((f) => ({ ...f, layer: remap.get(f.layer) ?? f.layer }));
}

function maxLayerOf(facets: readonly Facet[]): number {
  return facets.reduce((m, f) => Math.max(m, f.layer), 0);
}

/** Lift a table-space crease to a 3D rotation axis in the z=0 plane. */
function axisOf(crease: Line2) {
  const d = sub(crease.b, crease.a);
  const len = Math.hypot(d[0], d[1]);
  const dir = len > EPS ? ([d[0] / len, d[1] / len, 0] as const) : ([1, 0, 0] as const);
  return { origin: toVec3(crease.a), dir };
}

/**
 * Orient the crease so that "left" is a stable, direction-independent notion:
 * left = positive cross(creaseDir, p - a). Callers author `side` against this.
 */
function signedAngle(angle: number, direction: "valley" | "mountain"): number {
  // Valley rotates the moving side toward the viewer (+z), mountain away.
  return direction === "valley" ? angle : -angle;
}

const EMPTY_DELTA: StepDelta = {
  movingFacetIds: [],
  axis: null,
  angleDeg: 0,
  kind: "fold",
  layerChanges: new Map(),
};

export type ApplyResult = {
  readonly state: FoldState;
  readonly delta: StepDelta;
  /** Next free facet id, threaded through the replay. */
  readonly nextId: number;
};

export function applyStep(
  state: FoldState,
  step: FoldStep,
  nextId: number,
  history: ReadonlyMap<string, FoldState>,
): ApplyResult {
  const action = step.action;

  switch (action.type) {
    case "fold": {
      const { facets, marks, nextId: idAfterSplit } = splitAll(state, action.crease, nextId);
      const wantLeft = action.side === "left";
      const onSide = facets.filter((f) => {
        const s = facetSide(f, action.crease);
        return wantLeft ? s === 1 : s === -1;
      });
      const movers = filterByLayers(onSide, action.layers);
      const stationary = facets.filter((f) => !movers.includes(f));
      const moverIds = movers.map((f) => f.id);

      if (movers.length === 0) {
        return {
          state: { ...state, facets, creaseMarks: [...state.creaseMarks, ...marks] },
          delta: { ...EMPTY_DELTA, kind: "fold" },
          nextId: idAfterSplit,
        };
      }

      const isFlat = Math.abs(action.angle - 180) <= EPS;
      const angleDeg = signedAngle(action.angle, action.direction);

      let updated: Facet[];
      const layerChanges = new Map<number, { from: number; to: number }>();

      if (isFlat) {
        const reflection = isoReflection(action.crease);
        const moverLayers = movers.map((f) => f.layer);
        const m0 = Math.min(...moverLayers);
        const m1 = Math.max(...moverLayers);
        const stationaryLayers = stationary.map((f) => f.layer);
        const top = stationaryLayers.length > 0 ? Math.max(...stationaryLayers) : m1;
        const bottom = stationaryLayers.length > 0 ? Math.min(...stationaryLayers) : m0;

        const movedSet = new Set(moverIds);
        updated = facets.map((f) => {
          if (!movedSet.has(f.id)) return f;
          // The moving stack lands above (valley) or below (mountain) everything
          // stationary, and its internal order reverses - the top of the flap
          // becomes the top of the new stack.
          const newLayer =
            action.layerHint !== undefined
              ? action.layerHint
              : action.direction === "valley"
                ? top + 1 + (m1 - f.layer)
                : bottom - 1 - (f.layer - m0);
          layerChanges.set(f.id, { from: f.layer, to: newLayer });
          return {
            ...f,
            flatMap: isoCompose(reflection, f.flatMap),
            layer: newLayer,
          };
        });
      } else {
        // Partial fold: the facet keeps its flat position and gains a 3D bend.
        const rot: PartialRotation = { axis: axisOf(action.crease), angleDeg };
        const movedSet = new Set(moverIds);
        updated = facets.map((f) =>
          movedSet.has(f.id) ? { ...f, bend: [...f.bend, rot] } : f,
        );
      }

      const normalized = renormalizeLayers(updated);
      return {
        state: {
          facets: normalized,
          creaseMarks: [...state.creaseMarks, ...marks],
          maxLayer: maxLayerOf(normalized),
        },
        delta: {
          movingFacetIds: moverIds,
          axis: axisOf(action.crease),
          angleDeg,
          kind: "fold",
          layerChanges,
        },
        nextId: idAfterSplit,
      };
    }

    case "flip": {
      const flip = isoFlipY();
      const max = state.maxLayer;
      const facets = state.facets.map((f) => ({
        ...f,
        flatMap: isoCompose(flip, f.flatMap),
        layer: max - f.layer,
      }));
      const normalized = renormalizeLayers(facets);
      return {
        state: { ...state, facets: normalized, maxLayer: maxLayerOf(normalized) },
        delta: {
          movingFacetIds: facets.map((f) => f.id),
          axis: { origin: [0, 0, 0], dir: [0, 1, 0] },
          angleDeg: 180,
          kind: "flip",
          layerChanges: new Map(),
        },
        nextId,
      };
    }

    case "rotate": {
      const rot = isoRotation(action.degrees);
      const facets = state.facets.map((f) => ({ ...f, flatMap: isoCompose(rot, f.flatMap) }));
      return {
        state: { ...state, facets },
        delta: {
          movingFacetIds: facets.map((f) => f.id),
          axis: { origin: [0, 0, 0], dir: [0, 0, 1] },
          angleDeg: action.degrees,
          kind: "rotate",
          layerChanges: new Map(),
        },
        nextId,
      };
    }

    case "cut": {
      const { facets, marks, nextId: idAfterSplit } = splitAll(state, action.line, nextId);
      const keepLeft = action.keep === "left";
      const kept = facets.filter((f) => {
        const s = facetSide(f, action.line);
        return keepLeft ? s >= 0 : s <= 0;
      });
      const discarded = facets.filter((f) => !kept.includes(f));
      const normalized = renormalizeLayers(kept);
      return {
        state: {
          facets: normalized,
          creaseMarks: [...state.creaseMarks, ...marks],
          maxLayer: maxLayerOf(normalized),
        },
        delta: {
          movingFacetIds: discarded.map((f) => f.id),
          axis: axisOf(action.line),
          angleDeg: 0,
          kind: "cut",
          layerChanges: new Map(),
        },
        nextId: idAfterSplit,
      };
    }

    case "unfold": {
      const target = history.get(action.toStep);
      if (!target) {
        // Validation reports this; at runtime the state is left untouched.
        return { state, delta: { ...EMPTY_DELTA, kind: "unfold" }, nextId };
      }
      // Revert pose to the target state, keeping the splits made since then.
      // Children inherit their ancestor's pose because the split preserved ids
      // on the left child; right children look up their own id first, then fall
      // back to the nearest ancestor pose by containment.
      const poseById = new Map(target.facets.map((f) => [f.id, f]));
      const moved: number[] = [];
      const facets = state.facets.map((f) => {
        const ancestor = poseById.get(f.id);
        const source = ancestor ?? nearestAncestorPose(f, target);
        if (!source) return f;
        if (source.flatMap !== f.flatMap || source.layer !== f.layer || f.bend.length > 0) {
          moved.push(f.id);
        }
        return { ...f, flatMap: source.flatMap, layer: source.layer, bend: source.bend };
      });
      const normalized = renormalizeLayers(facets);
      return {
        state: {
          facets: normalized,
          // Creases stay as scored reference marks - the whole point of unfold.
          creaseMarks: state.creaseMarks,
          maxLayer: maxLayerOf(normalized),
        },
        delta: {
          movingFacetIds: moved,
          axis: null,
          angleDeg: 0,
          kind: "unfold",
          layerChanges: new Map(),
        },
        nextId,
      };
    }
  }
}

/**
 * A facet created after `target` has no counterpart there; adopt the pose of
 * whichever target facet contains its centroid in paper space.
 */
function nearestAncestorPose(facet: Facet, target: FoldState): Facet | null {
  const c = centroid(facet.polygon);
  let best: Facet | null = null;
  let bestDist = Infinity;
  for (const t of target.facets) {
    const tc = centroid(t.polygon);
    const d = Math.hypot(tc[0] - c[0], tc[1] - c[1]);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  return best;
}

/** Exported for tests: the identity isometry the fresh sheet starts with. */
export { ISO_IDENTITY, cross };
