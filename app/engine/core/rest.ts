/**
 * Standing a settled model on the table.
 *
 * Table space is the frame creases are AUTHORED in: the paper lies flat in
 * z = 0 and every crease is stated against the silhouette currently on the
 * table. That frame stops describing the object the moment the wings open. A
 * finished plane is a V hinged along its spine, and the fold engine leaves that
 * V lying on its side - the span runs up the z axis, half the aircraft is below
 * the table, and projecting the model onto the ground plane returns the
 * fuselage rather than the planform.
 *
 * The rest transform is the rigid motion from the authoring frame to the frame
 * the object is actually in: roll about the wing hinge until the V opens
 * upward, then set it down so the lowest paper touches z = 0.
 *
 * It is deliberately NOT a flight attitude. ADR 0002 walls flight out of the
 * fold engine and that wall stands; this module knows nothing about lift, drag
 * or dihedral. It knows that paper does not go below the table it is resting
 * on. Everything here is derived from the fold data, so no plane carries a
 * number for its own orientation.
 *
 * Two properties the rest of the engine relies on:
 *
 *   - It is EXACTLY the identity for any state with no bends, so applying it
 *     part-way through a sequence is a no-op until the first wing opens.
 *   - It is a roll about a hinge plus a rise, and nothing else. No yaw, no
 *     pitch. Claims about the model in table space that do not involve z - the
 *     nose being at low y, say - survive it untouched.
 *
 * It is EXPOSED, never applied. `posesForState` and `poseAtProgress` return
 * table-space poses as they always have; callers left-multiply this onto them.
 * `poseAtProgress` could not apply it even if it wanted to: the transform
 * differs between a step's two endpoint states, so baking it in would break the
 * t=0 contract in render/coreApi.ts.
 */
import { area, centroid } from "./polygon";
import {
  identityMat4,
  multiply,
  poseForFacet,
  rotationAboutAxis,
  transformPoint,
  translation,
  type Mat4,
} from "./pose";
import type { Facet, FoldState, Vec3 } from "./types";

/** Below this a vector has no reliable direction, in mm or in mm^2. */
const EPS = 1e-9;

export type Hinge = { readonly origin: Vec3; readonly dir: Vec3 };

export type RestFrame = {
  /**
   * The transform. LEFT-multiply it onto a pose; never compose it inward.
   *
   * `poseAtProgress` left-multiplies each step's fold rotation onto
   * `poseForFacet`, and that rotation is about a TABLE-space line. Composing
   * rest inside the per-facet pose would leave the facet in rest space while
   * the fold axis stayed in table space, and every fold would turn about the
   * wrong line.
   */
  readonly matrix: Mat4;
  /** Degrees rolled about the hinge. Exactly 0 for a state with no bends. */
  readonly rollDeg: number;
  /** Millimetres raised so the lowest paper touches z = 0. */
  readonly liftMm: number;
  /** The hinge rolled about, or null when there was nothing to stand up. */
  readonly hinge: Hinge | null;
};

const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm3 = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);

function unit3(a: Vec3): Vec3 | null {
  const n = norm3(a);
  return n <= EPS ? null : [a[0] / n, a[1] / n, a[2] / n];
}

/** The part of `v` perpendicular to the unit vector `d`. */
function perpTo(v: Vec3, d: Vec3): Vec3 {
  const k = dot3(v, d);
  return [v[0] - k * d[0], v[1] - k * d[1], v[2] - k * d[2]];
}

/**
 * The hinge the finished model rests on: the axis of the LAST bend applied to
 * the facets that carry the most paper.
 *
 * Read off the state rather than the step list, so this is a pure function of a
 * `FoldState` and every caller can use it - the flight model in ADR 0002 holds
 * a state, not always a structure. The last bend, because a plane may bend
 * twice: the Harrier folds its fin tips before its wings and then carries them
 * along, so its wing facets end up with `bend = [fin, wing]` and it is the wing
 * that the aircraft sits on.
 *
 * Votes are weighted by AREA, not by facet count. A crease that happens to
 * subdivide one wing into four pieces must not out-vote the whole wing on the
 * other side, and subdivision is exactly what a fold sequence does.
 */
export function wingHinge(state: FoldState): Hinge | null {
  const votes = new Map<string, { hinge: Hinge; area: number }>();
  for (const facet of state.facets) {
    const last = facet.bend[facet.bend.length - 1];
    if (!last) continue;
    const { origin, dir } = last.axis;
    const key = [...origin, ...dir].map((n) => n.toFixed(6)).join(",");
    const seen = votes.get(key) ?? { hinge: { origin, dir }, area: 0 };
    seen.area += area(facet.polygon);
    votes.set(key, seen);
  }
  let best: { hinge: Hinge; area: number } | null = null;
  for (const vote of votes.values()) if (!best || vote.area > best.area) best = vote;
  return best?.hinge ?? null;
}

/**
 * The unit normal of a posed facet, by Newell's method.
 *
 * Newell rather than a cross product of the first three vertices: it is the
 * area-weighted average of every vertex triple, so a facet with a near-collinear
 * corner - which crease subdivision produces constantly - still yields the
 * normal of the polygon as a whole rather than the normal of its worst corner.
 */
function facetNormal(facet: Facet): Vec3 | null {
  const pose = poseForFacet(facet);
  const p = facet.polygon.map((v) => transformPoint(pose, v));
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
  return unit3(n);
}

/**
 * Which way the V opens: the area-weighted mean ATTITUDE of the bent facets,
 * not their mean position.
 *
 * Each bent facet contributes the direction that lies in its own plane and runs
 * perpendicular to the hinge, pointing away from it - the direction the wing
 * itself is heading. Averaging those and rolling the mean onto +Z leaves the
 * two wings at equal and opposite angles from horizontal, which is what a
 * person means by a plane sitting level.
 *
 * It must be attitude and NOT position, and the difference is paper thickness.
 * A wing pair is authored as two folds on the same crease with `layers: "top"`
 * and `layers: "bottom"`, so the two wings sit on different layers of the
 * stack, and `poseForFacet` offsets each by `layer * LAYER_THICKNESS`. Those
 * sub-millimetre offsets displace the two wings' centroids unequally, and over
 * an arm of a centimetre or so that is worth two to five degrees. Levelling the
 * centroids therefore rolled the aircraft to cancel a thickness artefact and
 * tipped the actual wings off level by half the error, which is visible: on the
 * Hammer the two wings sat 8 degrees apart. A plane normal cannot be changed by
 * a translation, so measuring attitude is immune to the whole effect by
 * construction.
 *
 * Area-weighted, for the same reason the hinge vote is: a wing that a later
 * crease happened to cut into four pieces must not out-vote the whole wing on
 * the other side.
 */
function openingDirection(state: FoldState, hinge: Hinge): Vec3 | null {
  const dir = unit3(hinge.dir);
  if (!dir) return null;
  let sum: Vec3 = [0, 0, 0];
  let weight = 0;
  for (const facet of state.facets) {
    if (facet.bend.length === 0) continue;
    const a = area(facet.polygon);
    if (a <= EPS) continue;
    const normal = facetNormal(facet);
    if (!normal) continue;
    // In the facet's plane and across the hinge. Undefined for a facet lying in
    // the hinge's own plane, which has no side to open toward.
    const across = unit3(cross3(normal, dir));
    if (!across) continue;
    // `across` has an arbitrary sign; the centroid says which way is outward.
    // Position is fit to decide a SIGN even though it is too coarse to decide
    // an angle, because a wing's centroid is never within a paper thickness of
    // its hinge.
    const c = transformPoint(poseForFacet(facet), centroid(facet.polygon));
    const arm = perpTo([c[0] - hinge.origin[0], c[1] - hinge.origin[1], c[2] - hinge.origin[2]], dir);
    const s = dot3(across, arm) >= 0 ? a : -a;
    sum = [sum[0] + across[0] * s, sum[1] + across[1] * s, sum[2] + across[2] * s];
    weight += a;
  }
  // A perfectly symmetric 180-degree V has no opening direction and needs no
  // roll; so does a state whose bent facets straddle the hinge evenly.
  return weight <= EPS ? null : unit3([sum[0] / weight, sum[1] / weight, sum[2] / weight]);
}

/** Signed degrees about `dir` that carry `from` onto the up axis. */
function rollOntoUp(from: Vec3, dir: Vec3): number {
  const up = unit3(perpTo([0, 0, 1], dir));
  // A vertical hinge has no "up" perpendicular to it, so there is nothing to
  // roll the V onto and the model is already as upright as this can make it.
  if (!up) return 0;
  return (Math.atan2(dot3(cross3(from, up), dir), dot3(from, up)) * 180) / Math.PI;
}

/** Lowest world z of every posed vertex, after `pre` is applied. */
function lowestZ(facets: readonly Facet[], pre: Mat4): number {
  let low = Infinity;
  for (const facet of facets) {
    const pose = multiply(pre, poseForFacet(facet));
    for (const p of facet.polygon) low = Math.min(low, transformPoint(pose, p)[2]);
  }
  return Number.isFinite(low) ? low : 0;
}

/**
 * The rest frame of a settled state: roll the V upright, then set it down.
 *
 * Returns the parts as well as the matrix, because a test that asserts "the
 * roll is 85 degrees" pins the derivation far harder than one that asserts "the
 * result is above zero", and the fold editor wants to show both numbers.
 */
export function restFrame(state: FoldState): RestFrame {
  const hinge = wingHinge(state);
  const dir = hinge ? unit3(hinge.dir) : null;
  const opening = hinge && dir ? openingDirection(state, hinge) : null;
  const rollDeg = hinge && dir && opening ? rollOntoUp(opening, dir) : 0;
  const roll =
    hinge && rollDeg !== 0 ? rotationAboutAxis(hinge.origin, hinge.dir, rollDeg) : identityMat4();

  // A flat state's lowest paper is layer 0, which `renormalizeLayers` guarantees
  // exists and puts at z = 0, so this is exactly 0 and the whole frame is
  // exactly the identity.
  const liftMm = -lowestZ(state.facets, roll);
  const matrix = liftMm === 0 ? roll : multiply(translation(0, 0, liftMm), roll);
  return { matrix, rollDeg, liftMm, hinge };
}

/** Just the matrix. See `restFrame`. */
export function restTransform(state: FoldState): Mat4 {
  return restFrame(state).matrix;
}
