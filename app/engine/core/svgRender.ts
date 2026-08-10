/**
 * Painter's-algorithm SVG projection of any fold state.
 *
 * One module, four jobs: the no-WebGL fallback, golden snapshot tests, catalog
 * thumbnails when WebGL is unavailable, and (if the 3D engine ever had to be
 * abandoned) static per-step diagrams from the same fold data.
 */
import type { FoldState } from "./types";
import { posesForState, transformPoint } from "./pose";
import { boundingBox } from "./polygon";

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
 * Orthographic projection from the 3/4 view, matching the stage's default
 * camera preset so the SVG and the 3D stage show the same aircraft.
 *
 * This used to be a near-overhead view with a slight z shear, which is the
 * worst angle a paper plane has: nose-on, every aircraft in the catalog
 * collapsed to the same thin vertical strip, and the hangar asked cadets to
 * pick between six identical slivers. Turning the model off-axis and looking
 * down at it is what makes a dart read as a dart.
 *
 * Table space is x right, y forward (nose to tail), z up. Yaw first, then
 * pitch: at 90 degrees of pitch this degenerates to the old overhead view, at
 * 0 degrees to a pure front elevation.
 */
const YAW = (38 * Math.PI) / 180;
const PITCH = (32 * Math.PI) / 180;

/** Distance into the scene, before the pitch tilts it onto the screen. */
function alongView(p: readonly [number, number, number]): number {
  return p[0] * Math.sin(YAW) + p[1] * Math.cos(YAW);
}

function project(p: readonly [number, number, number]): [number, number] {
  return [
    p[0] * Math.cos(YAW) - p[1] * Math.sin(YAW),
    alongView(p) * Math.sin(PITCH) - p[2] * Math.cos(PITCH),
  ];
}

/** Larger is nearer the camera. Degenerates to z when looking straight down. */
function closeness(p: readonly [number, number, number]): number {
  return p[2] * Math.sin(PITCH) - alongView(p) * Math.cos(PITCH);
}

export function renderStateToSvg(state: FoldState, options: SvgOptions = {}): string {
  const opts = { ...DEFAULTS, ...options };
  const poses = posesForState(state);

  const projected = state.facets.map((facet) => {
    const pose = poses.get(facet.id);
    const pts = facet.polygon.map((p) =>
      project(pose ? transformPoint(pose, p) : [p[0], p[1], 0]),
    );
    // Mean closeness to the camera breaks ties the layer index cannot: bigger
    // is nearer, so it sorts last and paints on top. This has to be measured
    // along the view direction, not up the z axis - z alone only happens to be
    // the view direction when the camera is directly overhead, which is the one
    // angle this no longer uses.
    const depth = pose
      ? facet.polygon.reduce((sum, p) => sum + closeness(transformPoint(pose, p)), 0) /
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
        const pose = facet ? poses.get(facet.id) : undefined;
        if (!pose) return "";
        const [a, b] = mark.segment;
        const pa = project(transformPoint(pose, a));
        const pb = project(transformPoint(pose, b));
        return `<line x1="${pa[0].toFixed(3)}" y1="${pa[1].toFixed(3)}" x2="${pb[0].toFixed(3)}" y2="${pb[1].toFixed(3)}" stroke="rgba(26,43,74,0.25)" stroke-width="0.3" stroke-dasharray="2 2"/>`;
      })
      .join("");
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.width}" height="${opts.height}" viewBox="${viewBox}" role="img"><g>${body}${marks}</g></svg>`;
}
