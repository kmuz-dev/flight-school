/**
 * Pure geometry for the fold editor's TABLE-space plan view.
 *
 * The plan view is a true-scale orthographic drawing of table space: a facet's
 * table polygon is drawn at its literal millimetre coordinates, with screen y =
 * -table y so the sheet reads nose-up. That exactness is the whole point - a
 * crease authored as `{ a: [0, 148.5], b: [105, 43.5] }` lands on the drawing at
 * those numbers, so an author can read coordinates off the picture and type them
 * straight into a content file.
 *
 * `renderStateToSvg` is deliberately NOT that: it applies a slight isometric
 * tilt so the flat render reads like the 3D stage. Overlaying table-space
 * coordinates on it would be off by the tilt, which is why the editor draws its
 * own plan and shows the engine's SVG beside it rather than on top of it.
 *
 * DOM-free on purpose: everything here is unit tested in tests/dev/plan.test.ts.
 */
import type {
  CreaseSide,
  FoldAction,
  FoldDirection,
  FoldState,
  Line2,
  Vec2,
} from "@/engine/core/types";
import { boundingBox, centroid, classify, facetInTable, isoDet, splitConvex } from "@/engine";

/** One facet, ready to draw: table-space polygon plus the flags the tool colours by. */
export type PlanPolygon = {
  readonly facetId: number;
  readonly layer: number;
  /** TABLE space, millimetres. */
  readonly points: readonly Vec2[];
  /** det(flatMap) >= 0: the front face is toward the viewer. */
  readonly faceUp: boolean;
  readonly bent: boolean;
};

/** Every facet of a state as a table-space polygon, painted bottom layer first. */
export function tablePlan(state: FoldState): PlanPolygon[] {
  return state.facets
    .map((facet) => ({
      facetId: facet.id,
      layer: facet.layer,
      points: facetInTable(facet),
      faceUp: isoDet(facet.flatMap) >= 0,
      bent: facet.bend.length > 0,
    }))
    .sort((a, b) => a.layer - b.layer || a.facetId - b.facetId);
}

/** Padded table-space bounds of the drawing. */
export type PlanView = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};

/**
 * The drawing bounds: the union of everything passed in, padded.
 *
 * Callers pass the fresh sheet's outline alongside the current state so the view
 * stays put while stepping. A view that re-fits every step makes two steps
 * impossible to compare by eye, which defeats the purpose of the tool.
 */
export function planView(
  pointSets: readonly (readonly Vec2[])[],
  padRatio = 0.06,
): PlanView {
  const box = boundingBox(pointSets);
  const spanX = Math.max(1, box.max[0] - box.min[0]);
  const spanY = Math.max(1, box.max[1] - box.min[1]);
  const pad = Math.max(spanX, spanY) * padRatio;
  return {
    minX: box.min[0] - pad,
    minY: box.min[1] - pad,
    maxX: box.min[0] + spanX + pad,
    maxY: box.min[1] + spanY + pad,
  };
}

/** SVG `viewBox` for the plan. Screen y = -table y. */
export function planViewBox(view: PlanView): string {
  const w = view.maxX - view.minX;
  const h = view.maxY - view.minY;
  return `${view.minX} ${-view.maxY} ${w} ${h}`;
}

/**
 * One "pen unit" in view coordinates: 1% of the longer side. Stroke widths and
 * label sizes are expressed in these so the drawing looks the same whatever the
 * plane's paper size.
 */
export function planUnit(view: PlanView): number {
  return Math.max(view.maxX - view.minX, view.maxY - view.minY) / 100;
}

/** Table point -> SVG user coordinates. */
export function toScreen(p: Vec2): Vec2 {
  return [p[0], -p[1]];
}

/** Table-space polygon -> SVG `points` attribute. */
export function pointsAttr(points: readonly Vec2[]): string {
  return points.map((p) => `${p[0].toFixed(3)},${(-p[1]).toFixed(3)}`).join(" ");
}

/**
 * Pointer offset inside the SVG box -> table-space millimetres.
 *
 * Assumes the default `preserveAspectRatio="xMidYMid meet"`, so the content is
 * scaled uniformly and letterboxed; the letterbox offset is what a naive
 * width-ratio mapping gets wrong.
 */
export function pointerToTable(
  view: PlanView,
  size: { readonly width: number; readonly height: number },
  offsetX: number,
  offsetY: number,
): Vec2 {
  const vw = view.maxX - view.minX;
  const vh = view.maxY - view.minY;
  if (size.width <= 0 || size.height <= 0 || vw <= 0 || vh <= 0) {
    return [view.minX, view.maxY];
  }
  const scale = Math.min(size.width / vw, size.height / vh);
  const ox = (size.width - vw * scale) / 2;
  const oy = (size.height - vh * scale) / 2;
  const userX = view.minX + (offsetX - ox) / scale;
  const userY = -view.maxY + (offsetY - oy) / scale;
  // Normalise -0: a readout of "(0.0, -0.0)" reads like a bug to an author.
  return [zero(userX), zero(-userY)];
}

/** Collapse negative zero, which otherwise leaks into readouts and React keys. */
function zero(v: number): number {
  return v === 0 ? 0 : v;
}

/**
 * Table-space gridline positions at `spacing` mm, covering the view.
 * The grid is what lets an author estimate a coordinate before hovering for the
 * exact readout.
 */
export function gridLines(
  view: PlanView,
  spacing: number,
): { readonly xs: number[]; readonly ys: number[] } {
  if (!(spacing > 0)) return { xs: [], ys: [] };
  const axis = (min: number, max: number): number[] => {
    const out: number[] = [];
    const first = Math.ceil(min / spacing) * spacing;
    // Guard against a pathological view producing an unbounded loop.
    for (let v = first, i = 0; v <= max && i < 512; v += spacing, i++) out.push(zero(v));
    return out;
  };
  return { xs: axis(view.minX, view.maxX), ys: axis(view.minY, view.maxY) };
}

/**
 * Which side of `line` a polygon sits on: +1 left, -1 right, 0 straddling.
 *
 * Mirrors the engine's own `facetSide` (core/fold.ts), including its
 * centroid tiebreak, so the shading in the plan agrees with what the reducer
 * will actually do. The engine does not export it; see the contract note in
 * the editor's README-less header comment.
 */
export function polygonSide(points: readonly Vec2[], line: Line2): -1 | 0 | 1 {
  let sawLeft = false;
  let sawRight = false;
  for (const p of points) {
    const c = classify(line, p);
    if (c === 1) sawLeft = true;
    else if (c === -1) sawRight = true;
  }
  if (sawLeft && sawRight) return 0;
  if (sawLeft) return 1;
  if (sawRight) return -1;
  return classify(line, centroid(points));
}

export type CreaseOverlay = {
  readonly kind: "fold" | "cut";
  readonly line: Line2;
  /** The half-plane that moves (fold) or is discarded (cut). */
  readonly movingSide: CreaseSide;
  readonly angle: number;
  readonly direction: FoldDirection | null;
  /** Which layers of the stack the step moves, as authored. */
  readonly layers: string;
  /** The crease extended across the whole view, for drawing. Null if it misses. */
  readonly span: readonly [Vec2, Vec2] | null;
  /** The moving half of the view rectangle, as a polygon (may be empty). */
  readonly movingRegion: readonly Vec2[];
};

/** The crease an action folds or cuts along, or null for flip/rotate/unfold. */
export function creaseOverlay(action: FoldAction, view: PlanView): CreaseOverlay | null {
  if (action.type !== "fold" && action.type !== "cut") return null;

  const line = action.type === "fold" ? action.crease : action.line;
  // A cut keeps one side, so the side that "moves" (leaves) is the other one.
  const movingSide: CreaseSide =
    action.type === "fold" ? action.side : action.keep === "left" ? "right" : "left";

  const rect: Vec2[] = [
    [view.minX, view.minY],
    [view.maxX, view.minY],
    [view.maxX, view.maxY],
    [view.minX, view.maxY],
  ];
  const split = splitConvex(rect, line);
  const movingRegion = movingSide === "left" ? split.left : split.right;

  return {
    kind: action.type,
    line,
    movingSide,
    angle: action.type === "fold" ? action.angle : 0,
    direction: action.type === "fold" ? action.direction : null,
    layers: action.type === "fold" ? describeLayers(action.layers) : "n/a",
    span: clipLineToView(line, view),
    movingRegion,
  };
}

/** The authored `layers` selector as a short readable token. */
export function describeLayers(
  layers: "all" | "top" | "bottom" | readonly number[] | undefined,
): string {
  if (layers === undefined) return "all";
  if (typeof layers === "string") return layers;
  return `[${layers.join(",")}]`;
}

/**
 * Clip the infinite line through `line.a`/`line.b` to the view rectangle
 * (Liang-Barsky). Returns null when the line misses the view entirely.
 */
export function clipLineToView(line: Line2, view: PlanView): [Vec2, Vec2] | null {
  const dx = line.b[0] - line.a[0];
  const dy = line.b[1] - line.a[1];
  if (Math.abs(dx) < 1e-12 && Math.abs(dy) < 1e-12) return null;

  let t0 = -Infinity;
  let t1 = Infinity;
  const clip = (p: number, q: number): boolean => {
    if (Math.abs(p) < 1e-12) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };

  if (!clip(-dx, line.a[0] - view.minX)) return null;
  if (!clip(dx, view.maxX - line.a[0])) return null;
  if (!clip(-dy, line.a[1] - view.minY)) return null;
  if (!clip(dy, view.maxY - line.a[1])) return null;
  if (t0 > t1) return null;

  return [
    [line.a[0] + dx * t0, line.a[1] + dy * t0],
    [line.a[0] + dx * t1, line.a[1] + dy * t1],
  ];
}

export type FacetRole = "moving" | "stationary" | "split";

/** How this facet relates to the step's crease: it moves, it stays, or it gets cut. */
export function facetRole(points: readonly Vec2[], overlay: CreaseOverlay): FacetRole {
  const side = polygonSide(points, overlay.line);
  if (side === 0) return "split";
  return (side === 1) === (overlay.movingSide === "left") ? "moving" : "stationary";
}
