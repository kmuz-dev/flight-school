/**
 * Painter's-algorithm SVG projection of any fold state.
 *
 * One module, four jobs: the no-WebGL fallback, golden snapshot tests, catalog
 * thumbnails when WebGL is unavailable, and (if the 3D engine ever had to be
 * abandoned) static per-step diagrams from the same fold data.
 */
import type { DisplayView, FoldState, Vec3 } from "./types";
import { identityMat4, multiply, posesForState, transformPoint, translation, type Mat4 } from "./pose";
import { restTransform } from "./rest";
import { boundingBox } from "./polygon";
import {
  DISPLAY_LIFT,
  DISPLAY_RIG,
  HERO_VIEW,
  LIGHT_RIG,
  closeness,
  dot,
  normalize,
  project,
  viewBasis,
} from "../view";

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
  /**
   * Present the aircraft the way a display stage does: floating clear of the
   * ground over a soft contact shadow, rather than sitting flat.
   *
   * The shadow is derived from the model's own footprint on the ground plane
   * and offset along the key light, exactly as the 3D stage's is, so the card a
   * cadet sees before hovering and the scene that wakes over it are the same
   * picture. Implies `rest`: there is no sensible ground for a model still
   * lying in its authoring frame.
   */
  readonly display?: boolean;
  /** Finished-aircraft camera angle. Defaults to `HERO_VIEW`. */
  readonly displayView?: DisplayView;
};

const DEFAULTS = {
  width: 640,
  height: 480,
  paperColor: "#ffffff",
  backColor: "#EDE7D7",
  edgeColor: "rgba(26,43,74,0.38)",
  showCreaseMarks: true,
  /** Display only. The stage theme's `contactShadow` and `shadowOpacity`. */
  shadowColor: "#1a2b4a",
  shadowOpacity: 0.16,
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
/**
 * The lamps of `LIGHT_RIG`, pre-normalised, with the weights and colours the
 * paper theme's stage uses.
 *
 * Colours in LINEAR light, not sRGB hex: the sum below is a sum of light, and
 * adding two lamps in gamma space is the difference between a fold that turns
 * warm as it catches the key and one that just turns pale.
 */
const LAMPS = [
  { dir: normalize(LIGHT_RIG.key), rgb: [1.0, 0.94, 0.83], power: DISPLAY_RIG.key },
  { dir: normalize(LIGHT_RIG.fill), rgb: [0.6, 0.76, 0.92], power: DISPLAY_RIG.fill },
  { dir: normalize(LIGHT_RIG.rim), rgb: [1.0, 1.0, 1.0], power: DISPLAY_RIG.rim },
] as const;

/** Hemisphere ambient: sky above, bounced ground below. */
const SKY = [1.0, 0.97, 0.9] as const;
const GROUND = [0.78, 0.74, 0.66] as const;
const AMBIENT = DISPLAY_RIG.ambient;
const WRAP = DISPLAY_RIG.wrap;

const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const linearToSrgb = (c: number): number =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/** ACES filmic, the same curve `renderer.toneMapping` applies on the stage. */
function aces(x: number): number {
  const v = x * 0.6;
  return Math.max(0, Math.min(1, (v * (2.51 * v + 0.03)) / (v * (2.43 * v + 0.59) + 0.14)));
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function toHex(rgb: readonly [number, number, number]): string {
  const part = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${part(rgb[0])}${part(rgb[1])}${part(rgb[2])}`;
}

/**
 * The unit normal of a posed facet, by Newell's method.
 *
 * Newell rather than a cross product of the first three vertices, because
 * crease subdivision produces near-collinear corners constantly and this is the
 * area-weighted average over every vertex triple rather than the normal of one
 * arbitrary corner.
 */
function facetNormal(pose: Mat4 | undefined, polygon: readonly (readonly [number, number])[]): Vec3 {
  if (!pose) return [0, 0, 1];
  const p = polygon.map((v) => transformPoint(pose, v));
  let n: Vec3 = [0, 0, 0];
  for (let i = 0; i < p.length; i += 1) {
    const a = p[i]!;
    const b = p[(i + 1) % p.length]!;
    n = [
      n[0] + (a[1] - b[1]) * (a[2] + b[2]),
      n[1] + (a[2] - b[2]) * (a[0] + b[0]),
      n[2] + (a[0] - b[0]) * (a[1] + b[1]),
    ];
  }
  return normalize(n);
}

/**
 * Lambert shade one facet, in linear light, then tone-map back to a hex.
 *
 * This is what stops the catalogue looking like a two-tone paper cut-out. Every
 * facet used to take one of exactly two flat fills - white if its front face
 * was up and a beige if not - so a dozen panels at a dozen different angles all
 * came out the same value, and the only thing separating them was a hairline
 * stroke. Shading them by the angle they actually present to the light is what
 * makes a fold read as a fold.
 *
 * The lamps, the ACES curve and the near-Lambert paper (`roughness: 0.94`,
 * `metalness: 0`) are all the stage's, so waking a card is a change of renderer
 * rather than a change of scene.
 */
/**
 * A facet's own edge: its shaded fill, taken down a little.
 *
 * Paper has no ink on it. The line where two panels meet is visible because one
 * catches less light than the other, so an edge drawn as a darker version of
 * the panel it bounds sits inside the picture, where one drawn in navy sits on
 * top of it as a diagram would.
 */
function shadeEdge(fillHex: string): string {
  const rgb = parseHex(fillHex);
  if (!rgb) return fillHex;
  return toHex([rgb[0] * 0.82, rgb[1] * 0.82, rgb[2] * 0.83]);
}

function shadeFacet(albedoHex: string, normal: Vec3, faceUp: boolean, eye: Vec3): string {
  const base = parseHex(albedoHex);
  if (!base) return albedoHex;
  // Two-sided: paper is lit by whichever face the viewer is on.
  const n: Vec3 = dot(normal, eye) < 0 ? [-normal[0], -normal[1], -normal[2]] : normal;
  const sky = (n[2] + 1) / 2;
  const out: [number, number, number] = [0, 0, 0];
  for (let c = 0; c < 3; c += 1) {
    let light = AMBIENT * (GROUND[c]! + (SKY[c]! - GROUND[c]!) * sky);
    // Wrap lighting, the same term the 3D stage's paper shader applies: a
    // sheet is thin enough that light entering the lit side scatters through
    // and leaves the other, so the terminator is soft and the shadow side is
    // never black. Without it the flat card's shadow side sits noticeably
    // darker than the live scene that wakes over it.
    for (const lamp of LAMPS) {
      light += lamp.power * lamp.rgb[c]! * Math.max(0, (dot(n, lamp.dir) + WRAP) / (1 + WRAP));
    }
    // The reverse of a sheet is the same paper seen from behind: a touch darker
    // and a touch warmer, not a different material.
    const albedo = srgbToLinear(base[c]!) * (faceUp ? 1 : 0.88);
    out[c] = linearToSrgb(aces(albedo * light));
  }
  return toHex(out);
}

/**
 * Where the model's shadow falls and how big it is, in TABLE space.
 *
 * The footprint is the model flattened onto the ground plane, which is what a
 * light directly overhead would cast. Offsetting that along the key light's
 * horizontal direction, by an amount proportional to how high the model is
 * floating, is what a light at the key's actual angle casts - the same
 * derivation the 3D stage's contact shadow uses, so the two agree.
 */
function groundShadow(
  bounds: { min: Vec3; max: Vec3 },
  liftMm: number,
): { cx: number; cy: number; rx: number; ry: number } {
  const key = normalize(LIGHT_RIG.key);
  const drop = key[2] > 1e-6 ? liftMm / key[2] : 0;
  // A soft light spreads the pool past the silhouette that casts it, by an
  // amount set by how FAR it fell - not by how big the aircraft is. Scaling the
  // spread off the longest dimension instead makes a narrow dart's shadow
  // balloon sideways until a 5:1 footprint casts a 2:1 pool, which reads as a
  // smudge behind the plane rather than as its shadow.
  const spread = liftMm * 0.35;
  return {
    cx: (bounds.min[0] + bounds.max[0]) / 2 - key[0] * drop,
    cy: (bounds.min[1] + bounds.max[1]) / 2 - key[1] * drop,
    rx: (bounds.max[0] - bounds.min[0]) / 2 + spread,
    ry: (bounds.max[1] - bounds.min[1]) / 2 + spread,
  };
}

export function renderStateToSvg(state: FoldState, options: SvgOptions = {}): string {
  const opts = { ...DEFAULTS, ...options };
  const display = opts.display === true;
  // `displayView` is presentation metadata, not a general-purpose tutorial
  // camera. A caller cannot accidentally rotate a fold diagram by passing the
  // finished-aircraft option without also opting into display rendering.
  const displayView = display ? (opts.displayView ?? HERO_VIEW) : HERO_VIEW;
  const basis = viewBasis(displayView.azimuthDeg, displayView.elevationDeg);
  const poses = posesForState(state);
  const settled = opts.rest === true || display ? restTransform(state) : null;

  // The model's own box in table space, measured after rest and before the
  // lift, because the lift is derived FROM it: a fraction of the radius, the
  // same fraction the stage uses.
  const worldBounds = (pre: Mat4 | null): { min: Vec3; max: Vec3 } | null => {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const facet of state.facets) {
      const base = poses.get(facet.id);
      if (!base) continue;
      const pose = pre ? multiply(pre, base) : base;
      for (const p of facet.polygon) {
        const w = transformPoint(pose, p);
        for (let i = 0; i < 3; i += 1) {
          min[i] = Math.min(min[i]!, w[i]!);
          max[i] = Math.max(max[i]!, w[i]!);
        }
      }
    }
    if (!Number.isFinite(min[0])) return null;
    return { min: [min[0]!, min[1]!, min[2]!], max: [max[0]!, max[1]!, max[2]!] };
  };

  const bounds = display ? worldBounds(settled) : null;
  const radius = bounds
    ? Math.hypot(bounds.max[0] - bounds.min[0], bounds.max[1] - bounds.min[1], bounds.max[2] - bounds.min[2]) / 2
    : 0;
  const liftMm = display ? DISPLAY_LIFT * radius : 0;
  const rest =
    liftMm > 0 ? multiply(translation(0, 0, liftMm), settled ?? identityMat4()) : settled;

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
    const pts = facet.polygon.map((p) => project(basis, at(pose, p)));
    // Mean closeness to the camera breaks ties the layer index cannot: bigger
    // is nearer, so it sorts last and paints on top. This has to be measured
    // along the view direction, not up the z axis - z alone only happens to be
    // the view direction when the camera is directly overhead, which is the one
    // angle this no longer uses.
    const depth = pose
      ? facet.polygon.reduce((sum, p) => sum + closeness(basis, transformPoint(pose, p)), 0) /
        Math.max(1, facet.polygon.length)
      : 0;
    const det =
      (facet.flatMap[0] ?? 1) * (facet.flatMap[4] ?? 1) -
      (facet.flatMap[1] ?? 0) * (facet.flatMap[3] ?? 0);
    const normal = facetNormal(pose, facet.polygon);
    return { facet, pts, depth, faceUp: det >= 0, normal };
  });

  projected.sort((a, b) => a.facet.layer - b.facet.layer || a.depth - b.depth);

  // The shadow lies on the ground plane, so its ellipse is drawn in the plane's
  // own projected axes rather than as an axis-aligned screen ellipse. Two
  // ground vectors carried through the camera give exactly that, as a transform
  // on a unit circle - which is also why it foreshortens correctly instead of
  // reading as a sticker pasted under the plane.
  let shadow = "";
  const shadowPts: [number, number][] = [];
  if (display && bounds) {
    const g = groundShadow(bounds, liftMm);
    const o = project(basis, [g.cx, g.cy, 0]);
    const ex = project(basis, [g.cx + g.rx, g.cy, 0]);
    const ey = project(basis, [g.cx, g.cy + g.ry, 0]);
    const a = [ex[0] - o[0], ex[1] - o[1]];
    const b = [ey[0] - o[0], ey[1] - o[1]];
    const m = [a[0]!, a[1]!, b[0]!, b[1]!, o[0], o[1]].map((n) => n.toFixed(4)).join(" ");
    shadow =
      `<defs><radialGradient id="fs-shadow"><stop offset="0" stop-color="${opts.shadowColor}" stop-opacity="${opts.shadowOpacity}"/>` +
      `<stop offset="0.55" stop-color="${opts.shadowColor}" stop-opacity="${(opts.shadowOpacity * 0.5).toFixed(3)}"/>` +
      `<stop offset="1" stop-color="${opts.shadowColor}" stop-opacity="0"/></radialGradient></defs>` +
      `<g transform="matrix(${m})"><circle cx="0" cy="0" r="1" fill="url(#fs-shadow)"/></g>`;
    // Four extremes of the ellipse, so the frame includes the ground the
    // aircraft is floating over rather than cropping its own shadow.
    for (const s of [1, -1]) {
      shadowPts.push([o[0] + a[0]! * s, o[1] + a[1]! * s]);
      shadowPts.push([o[0] + b[0]! * s, o[1] + b[1]! * s]);
    }
  }

  const box = boundingBox([...projected.map((p) => p.pts), ...(shadowPts.length ? [shadowPts] : [])]);
  const spanX = Math.max(1, box.max[0] - box.min[0]);
  const spanY = Math.max(1, box.max[1] - box.min[1]);
  const pad = Math.max(spanX, spanY) * 0.08;
  const viewBox = `${box.min[0] - pad} ${box.min[1] - pad} ${spanX + pad * 2} ${spanY + pad * 2}`;

  const body = projected
    .map(({ facet, pts, faceUp, normal }) => {
      const d = pts.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" ");
      const fill = shadeFacet(faceUp ? opts.paperColor : opts.backColor, normal, faceUp, basis.eye);
      // The outline is stroked in the facet's OWN shaded colour, darkened, not
      // in one ink for the whole model. A uniform hairline round every facet
      // turned a folded sheet into a wireframe drawing of one, and it was doing
      // the work the shading should have been doing: with the panels flat-filled
      // it was the only thing separating them at all.
      const edge = shadeEdge(fill);
      return `<polygon points="${d}" fill="${fill}" stroke="${edge}" stroke-width="0.25" stroke-linejoin="round" data-facet="${facet.id}" data-layer="${facet.layer}"/>`;
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
        const pa = project(basis, transformPoint(pose, a));
        const pb = project(basis, transformPoint(pose, b));
        return `<line x1="${pa[0].toFixed(3)}" y1="${pa[1].toFixed(3)}" x2="${pb[0].toFixed(3)}" y2="${pb[1].toFixed(3)}" stroke="rgba(26,43,74,0.25)" stroke-width="0.3" stroke-dasharray="2 2"/>`;
      })
      .join("");
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.width}" height="${opts.height}" viewBox="${viewBox}" role="img">${shadow}<g>${body}${marks}</g></svg>`;
}
