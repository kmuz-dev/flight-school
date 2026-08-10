/**
 * Painter's-algorithm SVG projection of any fold state.
 *
 * One module, four jobs: the no-WebGL fallback, golden snapshot tests, catalog
 * thumbnails when WebGL is unavailable, and (if the 3D engine ever had to be
 * abandoned) static per-step diagrams from the same fold data.
 */
import type { FoldState, Vec3 } from "./types";
import { multiply, posesForState, transformPoint, type Mat4 } from "./pose";
import { restTransform } from "./rest";
import { boundingBox } from "./polygon";
import { HERO_VIEW, closeness, project, viewBasis } from "../view";

export type SvgOptions = {
  readonly width?: number;
  readonly height?: number;
  /** Paper fill (front face). Defaults to the design system's raised surface. */
  readonly paperColor?: string;
  /** Back face, slightly darker so folds read. */
  readonly backColor?: string;
  readonly edgeColor?: string;
  /** Show scored crease-and-unfold marks. */
  readonly showCreaseMarks?: boolean;
  /**
   * Stand the model up before drawing it, for a surface showing a FINISHED
   * plane rather than a step of a fold. Off by default: this renders arbitrary
   * states, including the fold editor's mid-sequence ones, and those belong in
   * the frame their creases were authored in.
   */
  readonly rest?: boolean;
};

const DEFAULTS = {
  width: 640,
  height: 480,
  paperColor: "#ffffff",
  backColor: "#EDE7D7",
  edgeColor: "rgba(26,43,74,0.38)",
  showCreaseMarks: true,
} as const;

/**
 * Orthographic projection from the catalogue's hero angle, built from the same
 * `HERO_VIEW` the 3D stage's `threeQuarter` preset uses, so the SVG behind a
 * hangar card and the live scene that wakes over it show the same aircraft from
 * the same place.
 *
 * They did not, twice over. The angle was 90 degrees round from the stage's,
 * looking at the tail where the stage looks at the nose. And the projection was
 * not a camera at all: `right`, `down` and a depth function were each built
 * from yaw and pitch by hand, and the last two came out 26 degrees from
 * perpendicular, so the picture was drawn from one place and sorted from
 * another. Building all three as an orthonormal basis is what makes that
 * unrepresentable rather than merely fixed - see `engine/view.ts`.
 *
 * Table space is x right, y forward (nose to tail), z up.
 */
const BASIS = viewBasis(HERO_VIEW.azimuthDeg, HERO_VIEW.elevationDeg);

export function renderStateToSvg(state: FoldState, options: SvgOptions = {}): string {
  const opts = { ...DEFAULTS, ...options };
  const poses = posesForState(state);
  const rest = opts.rest === true ? restTransform(state) : null;
  // Left-multiplied onto each pose, never composed inward: rest is a rigid
  // motion of the whole model, so it leaves the painter's order alone.
  const posed = (id: number): Mat4 | undefined => {
    const base = poses.get(id);
    if (!base) return undefined;
    return rest ? multiply(rest, base) : base;
  };
  const at = (pose: Mat4 | undefined, p: readonly [number, number]): Vec3 =>
    pose ? transformPoint(pose, p) : [p[0], p[1], 0];

  const projected = state.facets.map((facet) => {
    const pose = posed(facet.id);
    const pts = facet.polygon.map((p) => project(BASIS, at(pose, p)));
    // Mean closeness to the camera breaks ties the layer index cannot: bigger
    // is nearer, so it sorts last and paints on top. This has to be measured
    // along the view direction, not up the z axis - z alone only happens to be
    // the view direction when the camera is directly overhead, which is the one
    // angle this no longer uses.
    const depth = pose
      ? facet.polygon.reduce((sum, p) => sum + closeness(BASIS, transformPoint(pose, p)), 0) /
        Math.max(1, facet.polygon.length)
      : 0;
    const det =
      (facet.flatMap[0] ?? 1) * (facet.flatMap[4] ?? 1) -
      (facet.flatMap[1] ?? 0) * (facet.flatMap[3] ?? 0);
    return { facet, pts, depth, faceUp: det >= 0 };
  });

  projected.sort((a, b) => a.facet.layer - b.facet.layer || a.depth - b.depth);

  const box = boundingBox(projected.map((p) => p.pts));
  const spanX = Math.max(1, box.max[0] - box.min[0]);
  const spanY = Math.max(1, box.max[1] - box.min[1]);
  const pad = Math.max(spanX, spanY) * 0.08;
  const viewBox = `${box.min[0] - pad} ${box.min[1] - pad} ${spanX + pad * 2} ${spanY + pad * 2}`;

  const body = projected
    .map(({ facet, pts, faceUp }) => {
      const d = pts.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" ");
      const fill = faceUp ? opts.paperColor : opts.backColor;
      return `<polygon points="${d}" fill="${fill}" stroke="${opts.edgeColor}" stroke-width="0.4" stroke-linejoin="round" data-facet="${facet.id}" data-layer="${facet.layer}"/>`;
    })
    .join("");

  let marks = "";
  if (opts.showCreaseMarks && state.creaseMarks.length > 0) {
    marks = state.creaseMarks
      .map((mark) => {
        const facet = state.facets.find((f) => f.id === mark.facetId);
        const pose = facet ? posed(facet.id) : undefined;
        if (!pose) return "";
        const [a, b] = mark.segment;
        const pa = project(BASIS, transformPoint(pose, a));
        const pb = project(BASIS, transformPoint(pose, b));
        return `<line x1="${pa[0].toFixed(3)}" y1="${pa[1].toFixed(3)}" x2="${pb[0].toFixed(3)}" y2="${pb[1].toFixed(3)}" stroke="rgba(26,43,74,0.25)" stroke-width="0.3" stroke-dasharray="2 2"/>`;
      })
      .join("");
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.width}" height="${opts.height}" viewBox="${viewBox}" role="img"><g>${body}${marks}</g></svg>`;
}
