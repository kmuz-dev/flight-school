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
import type { Vec3 } from "./core/types";

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
