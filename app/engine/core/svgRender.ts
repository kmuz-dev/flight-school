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
 * Project with a fixed isometric-ish view so the SVG reads like the 3D stage:
 * x to the right, y up, z toward the viewer with a slight tilt.
 */
function project(p: readonly [number, number, number]): [number, number] {
  const tilt = 0.35;
  return [p[0] + p[2] * tilt * 0.4, -(p[1] - p[2] * tilt)];
}

export function renderStateToSvg(state: FoldState, options: SvgOptions = {}): string {
  const opts = { ...DEFAULTS, ...options };
  const poses = posesForState(state);

  const projected = state.facets.map((facet) => {
    const pose = poses.get(facet.id);
    const pts = facet.polygon.map((p) =>
      project(pose ? transformPoint(pose, p) : [p[0], p[1], 0]),
    );
    // Average depth decides paint order alongside the layer index.
    const depth = pose
      ? facet.polygon.reduce((sum, p) => sum + transformPoint(pose, p)[2], 0) /
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
