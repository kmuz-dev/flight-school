/**
 * The one camera convention.
 *
 * Azimuth is measured in the table plane from +Y - where a plane's nose points
 * - rotating toward +X; elevation is measured up from the table. The 3D stage's
 * presets and the flat SVG projection are both built from here, so they cannot
 * drift apart again. They had: by 90 degrees of azimuth and a sign on the
 * vertical axis, which is why waking a hangar card swung the aircraft round.
 *
 * This sits beside `core/` and `render/` rather than inside either, and imports
 * from neither. `render/**` deliberately takes only TYPES from `core/**` so the
 * render layer stays testable headlessly against `render/__contracts__`, and a
 * camera convention is neither fold math nor stage plumbing: it is the shared
 * vocabulary the two use to agree about where the viewer is standing.
 */
import type { CameraHint, DisplayView, EngineOptions, Vec3 } from "./core/types";

export type CameraPreset = NonNullable<CameraHint["preset"]>;

/** Instructional camera presets, shared by WebGL and the SVG fallback. */
export const CAMERA_PRESETS: Readonly<Record<CameraPreset, DisplayView>> = {
  front: { azimuthDeg: 0, elevationDeg: 5 },
  threeQuarter: { azimuthDeg: -35, elevationDeg: 25 },
  top: { azimuthDeg: 0, elevationDeg: 85 },
};

export const DEFAULT_PRESET: CameraPreset = "threeQuarter";

/**
 * The angle a FINISHED plane is shown from: hangar cards, the preflight hero,
 * thumbnails, and the flat SVG that sits behind all three.
 *
 * Deliberately not one of `CAMERA_PRESETS`. Those are authored into fold steps
 * and answer "where does this fold read best", which is a different question
 * with a different answer - the Dart's last step asks for `front` because that
 * is where the wing crease opens, and nose-on is exactly where a dart looks
 * like nothing at all. No step should be able to ask for the hero angle, and
 * the hero angle should not drift when a step's needs change.
 *
 * Azimuth 145 rather than the stage's -35 because the nose is at LOW y. Every
 * plane in the catalogue ends with a `rotate` of 180 degrees, so the apex the
 * sequence built at +y is at -y by the time the plane is finished - which means
 * the old three-quarter angle was showing the catalogue its tails. Measured on
 * the finished Dart: the nose sat 110mm BEHIND the model centre from that
 * camera, and the tail 115mm in front of it.
 *
 * Elevation 25 and this azimuth also happen to frame best: across the six
 * planes the silhouette comes out around 1.8:1, against a 3:2 hangar card.
 */
export const HERO_VIEW = { azimuthDeg: 145, elevationDeg: 25 } as const;

/** `cameraPreset` is an explicit diagnostic pin and therefore wins. */
export function resolveDisplayView(
  options: Pick<EngineOptions, "cameraPreset" | "displayView">,
): DisplayView {
  return options.cameraPreset
    ? CAMERA_PRESETS[options.cameraPreset]
    : (options.displayView ?? HERO_VIEW);
}

export type ViewBasis = {
  /** Screen +x, in table space. */
  readonly right: Vec3;
  /** Screen +y, in table space. SVG's y axis points DOWN the page. */
  readonly down: Vec3;
  /** Table-space direction from the subject toward the camera. Bigger dot product = nearer. */
  readonly eye: Vec3;
};

/**
 * An orthonormal screen basis for an orbit position.
 *
 * All three axes are unit length and mutually perpendicular, and
 * `cross(right, down) = -eye`. That sounds like a tautology to state; it is not.
 * The projection this replaces built `right`, `down` and `eye` from yaw and
 * pitch independently, and `down . eye` came out at -0.9: sliding a point 100mm
 * directly away from the viewer moved it 90mm up the page. The picture and the
 * depth sort were of two different cameras, one of them under the table. A
 * basis is the fix, because a basis cannot be inconsistent with itself.
 */
export function viewBasis(azimuthDeg: number, elevationDeg: number): ViewBasis {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  const sa = Math.sin(az);
  const ca = Math.cos(az);
  const se = Math.sin(el);
  const ce = Math.cos(el);
  return {
    // Horizontal on screen, so it stays in the table plane at every elevation.
    right: [-ca, sa, 0],
    // Down the page: away from +z, tilted by the elevation.
    down: [sa * se, ca * se, -ce],
    eye: [sa * ce, ca * ce, se],
  };
}

/** Screen position of a table-space point, in millimetres. */
export function project(basis: ViewBasis, p: Vec3): [number, number] {
  return [
    p[0] * basis.right[0] + p[1] * basis.right[1] + p[2] * basis.right[2],
    p[0] * basis.down[0] + p[1] * basis.down[1] + p[2] * basis.down[2],
  ];
}

/** How near a table-space point is to the camera. Bigger is nearer. */
export function closeness(basis: ViewBasis, p: Vec3): number {
  return p[0] * basis.eye[0] + p[1] * basis.eye[1] + p[2] * basis.eye[2];
}

/**
 * The one lighting convention, for the same reason there is one camera.
 *
 * Directions point FROM the model TOWARD each lamp, in table space, unit
 * length. The 3D stage places its three `DirectionalLight`s along these and the
 * flat SVG shades its facets with them, so a hangar card and the live scene
 * that wakes over it are lit alike as well as seen alike.
 *
 * Three lamps, doing three jobs, which is the standard portrait rig and is why
 * paper reads as an object rather than as a cut-out:
 *
 *   - `key` high and over the viewer's left shoulder, warm. It does the
 *     modelling: it is what makes two facets meeting at a crease take
 *     noticeably different values.
 *   - `fill` low and opposite, cool and weaker. It keeps the shadow side from
 *     going dead, and the warm/cool split across a fold is most of what makes
 *     the result look like paper in a room rather than grey card.
 *   - `rim` from behind, to separate the silhouette from the backdrop. Aimed
 *     but burning at zero, because the one ground the stage paints is light and
 *     a light ground needs no help. The lamp stays in the rig rather than being
 *     deleted: the Hangar's photographed room is a dark ground the stage now
 *     draws through to, and restoring a lamp is easier than rebuilding one.
 */
export const LIGHT_RIG = {
  key: [-0.55, -0.75, 1.2] as Vec3,
  fill: [0.9, 0.3, 0.5] as Vec3,
  rim: [0.2, 1.1, 0.25] as Vec3,
} as const;

/**
 * How hard each of those lamps burns on a DISPLAY surface, plus the ambient
 * they sit on. One set of numbers, read by the 3D stage and the flat SVG alike.
 *
 * They lived in two places and had already drifted - the SVG lit its rim at
 * 0.15 while the stage had it off, and their ambients differed by a fifth - so
 * a card and the scene that woke over it were lit by two rigs that merely
 * resembled each other. Directions were shared from the start; these are the
 * other half of the same convention.
 *
 * One set, for the one ground the stage paints. There used to be a second, for
 * Night Flight's dark scene, and the difference was mostly the rim: a dark
 * ground needs a strong one to keep the aircraft off the backdrop, a light
 * ground needs none at all. Only the light numbers remain.
 *
 * `ambient` is the one that matters. It is the light that reaches every surface
 * facing up, which is most of a paper aeroplane, so it is also the light that
 * flattens one. At the tutorial's level the fleet rendered as three values
 * spanning a darkest-to-brightest ratio of 0.87 - a printed sticker of an
 * aircraft - and dropping it is what lets a fold read at all.
 *
 * Set for the ACES curve, NOT for a raw sum. ACES compresses hard at the top,
 * so a rig totalling 1.0 renders 0.98 white paper as grey card; the brightest
 * facet needs to reach about 2.4 to land near white.
 */
export const DISPLAY_RIG = {
  key: 2.4,
  fill: 0.35,
  /** Off on the light ground: a rim there separates nothing. */
  rim: 0,
  ambient: 0.35,
  /**
   * How far light wraps past the terminator, standing in for the fact that a
   * sheet of paper is thin enough to be translucent. 0 is an opaque surface;
   * 0.5 washes the fold out entirely, because the terminator is exactly what
   * tells a reader that two panels meet at an angle.
   */
  wrap: 0.18,
} as const;

/**
 * How high a finished aircraft floats on a display surface, as a fraction of
 * its own bounding radius.
 *
 * A fraction rather than millimetres because the camera distance is fitted to
 * that same radius, so a height expressed this way subtends the same angle on a
 * 179mm Square Cruiser as on a 310mm Dart. Shared with the flat SVG so the
 * static card and the live scene that wakes over it compose identically: the
 * plane does not drop or jump at the moment the renderer changes.
 */
export const DISPLAY_LIFT = 0.3;

/** `v` scaled to unit length; a zero vector is returned unchanged. */
export function normalize(v: Vec3): Vec3 {
  const n = Math.hypot(v[0], v[1], v[2]);
  return n < 1e-12 ? v : [v[0] / n, v[1] / n, v[2] / n];
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
