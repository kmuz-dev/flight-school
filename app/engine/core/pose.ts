/**
 * Derived 3D poses. Matrices are plain column-major number[16] so this module
 * stays free of Three.js; the render layer feeds them straight into
 * Matrix4.fromArray.
 *
 * pose = bendRotations . translateZ(layer * thickness) . lift3D(flatMap)
 *
 * A reflection (det -1) in the flat map is realised physically as a 180 degree
 * rotation about the fold axis, which is why animating a fold and snapping to
 * the folded state agree exactly at t = 1.
 *
 * REST IS NOT A TERM IN THAT LAW. `rest.ts` computes the rigid motion that
 * stands a settled model up on a table, and it belongs strictly outside this
 * composition, left-multiplied by the caller. Fold axes are TABLE-space lines
 * and the rotations above are left-multiplied onto `poseForFacet`, so a rest
 * transform composed inward would leave a facet in rest space while its fold
 * axis stayed in table space, and every fold would turn about the wrong line.
 * See ADR 0004.
 */
import type { Facet, FoldState, PartialRotation, StepDelta } from "./types";
import { LAYER_THICKNESS } from "./paper";

export type Mat4 = number[];

export function identityMat4(): Mat4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/** Column-major multiply: result = a * b (apply b first). */
export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Array<number>(16).fill(0);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += (a[k * 4 + r] ?? 0) * (b[c * 4 + k] ?? 0);
      }
      out[c * 4 + r] = sum;
    }
  }
  return out;
}

export function translation(x: number, y: number, z: number): Mat4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

/** Rotation of `deg` about the axis through `origin` with unit direction `dir`. */
export function rotationAboutAxis(
  origin: readonly [number, number, number],
  dir: readonly [number, number, number],
  deg: number,
): Mat4 {
  const len = Math.hypot(dir[0], dir[1], dir[2]);
  if (len < 1e-9) return identityMat4();
  const x = dir[0] / len;
  const y = dir[1] / len;
  const z = dir[2] / len;
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const t = 1 - c;

  const rot: Mat4 = [
    t * x * x + c,
    t * x * y + s * z,
    t * x * z - s * y,
    0,
    t * x * y - s * z,
    t * y * y + c,
    t * y * z + s * x,
    0,
    t * x * z + s * y,
    t * y * z - s * x,
    t * z * z + c,
    0,
    0,
    0,
    0,
    1,
  ];
  return multiply(
    translation(origin[0], origin[1], origin[2]),
    multiply(rot, translation(-origin[0], -origin[1], -origin[2])),
  );
}

/**
 * Embed a 2D isometry in the z=0 plane. A reflection is embedded as its
 * mirror-image linear part with the z axis negated, so the facet's front face
 * turns away from the viewer exactly as folded paper does.
 */
export function lift3D(m: readonly number[]): Mat4 {
  const m00 = m[0] ?? 1;
  const m01 = m[1] ?? 0;
  const tx = m[2] ?? 0;
  const m10 = m[3] ?? 0;
  const m11 = m[4] ?? 1;
  const ty = m[5] ?? 0;
  const det = m00 * m11 - m01 * m10;
  const zScale = det < 0 ? -1 : 1;
  // Column-major: columns are the images of the basis vectors.
  return [m00, m10, 0, 0, m01, m11, 0, 0, 0, 0, zScale, 0, tx, ty, 0, 1];
}

function applyBends(base: Mat4, bend: readonly PartialRotation[]): Mat4 {
  let out = base;
  for (const b of bend) {
    out = multiply(rotationAboutAxis(b.axis.origin, b.axis.dir, b.angleDeg), out);
  }
  return out;
}

export function poseForFacet(facet: Facet): Mat4 {
  const flat = lift3D(facet.flatMap);
  const lifted = multiply(translation(0, 0, facet.layer * LAYER_THICKNESS), flat);
  return applyBends(lifted, facet.bend);
}

export function posesForState(state: FoldState): ReadonlyMap<number, Mat4> {
  const out = new Map<number, Mat4>();
  for (const facet of state.facets) out.set(facet.id, poseForFacet(facet));
  return out;
}

/**
 * Poses part-way through a step. Moving facets are rotated about the step's axis
 * by `t * angle` from their PREVIOUS pose, so at t=0 the result equals the old
 * state and at t=1 it equals the new one (the 180-degree lemma). Stationary
 * facets keep their previous pose; every facet's layer offset lerps toward its
 * settled layer, so a restack does not pop.
 *
 * The facets come from the delta, not from the state before the step, and that
 * distinction is the whole point of `startFacets`. A crease splits the facets it
 * crosses, and the pieces it creates do not exist in the previous state, so
 * iterating that state returns a map with no entry for them - and the render
 * layer, which builds its meshes from the state AFTER the step, would leave
 * those meshes wherever they last were for the length of the animation. It was
 * half the paper on the Dart's step 8.
 */
export function poseAtProgress(delta: StepDelta, t: number): ReadonlyMap<number, Mat4> {
  const clamped = Math.max(0, Math.min(1, t));
  const moving = new Set(delta.movingFacetIds);
  const out = new Map<number, Mat4>();

  for (const facet of delta.startFacets) {
    const base = poseForFacet(facet);
    const turns = moving.has(facet.id) && delta.axis !== null && delta.angleDeg !== 0;
    const turned = turns ? delta.angleDeg * clamped : 0;
    const dz = layerCorrection(delta.layerChanges.get(facet.id), delta.axis, turned, clamped);
    const lift = arcLift(delta.liftMm, clamped);
    const offset = dz + lift;

    if (!turns) {
      out.set(facet.id, offset === 0 ? base : multiply(translation(0, 0, offset), base));
      continue;
    }
    const rotated = multiply(
      rotationAboutAxis(delta.axis!.origin, delta.axis!.dir, turned),
      base,
    );
    out.set(facet.id, multiply(translation(0, 0, offset), rotated));
  }
  return out;
}

/**
 * The z the step owes a facet, on top of whatever its rotation has done.
 *
 * `poseForFacet` puts the layer offset INSIDE the bends, so a rotation carries
 * it along: turning a facet by `theta` about a table-space line leaves its
 * layer offset at `from * cos(theta)`, and a 180-degree fold therefore lands it
 * a full `2 * from` below where the settled state puts it. Reading the
 * correction as `to - from` instead was worth up to 15.5mm on the Hammer,
 * invisible only because the timeline snaps to the settled poses at t = 1.
 *
 * A rotation about the table normal keeps the offset whole, which is why the
 * axis is read rather than assumed.
 */
function layerCorrection(
  change: { readonly from: number; readonly to: number } | undefined,
  axis: StepDelta["axis"],
  turnedDeg: number,
  t: number,
): number {
  if (!change) return 0;
  const dz = axis ? axis.dir[2] ?? 0 : 0;
  // Component of a pure z offset that survives a turn of `turnedDeg` about the
  // axis: whole about the table normal, negated by a half turn in the table.
  const kept = dz * dz + (1 - dz * dz) * Math.cos((turnedDeg * Math.PI) / 180);
  const want = (change.from + (change.to - change.from) * t) * LAYER_THICKNESS;
  return want - change.from * LAYER_THICKNESS * kept;
}

/**
 * The whole-model rise that keeps a turn above the table, zero at both ends.
 *
 * Clamped rather than trusting `sin(pi)` to round to zero: the t=0 and t=1
 * contract in `render/coreApi.ts` is absolute, and the renderer snaps to the
 * settled poses on the strength of it.
 */
function arcLift(liftMm: number | undefined, t: number): number {
  if (!liftMm || t <= 0 || t >= 1) return 0;
  return liftMm * Math.sin(Math.PI * t);
}

/**
 * How far a posed model reaches past a turning line, on the side that a
 * positive turn about it carries downward.
 *
 * This is exactly the height the model has to be lifted to clear the table
 * while it turns: a point at perpendicular offset `a` traces z = -a sin(theta),
 * so the deepest point of a 180-degree turn is the largest `a` in the model.
 * The stack's own thickness rides along underneath, so it is added.
 */
export function turnClearance(
  facets: readonly Facet[],
  axis: { readonly origin: readonly number[]; readonly dir: readonly number[] },
): number {
  // The in-table direction perpendicular to the axis, i.e. dir x zHat. For the
  // flip's +Y axis this is +X, which is precisely the half that dives.
  const ex = axis.dir[1] ?? 0;
  const ey = -(axis.dir[0] ?? 0);
  const ox = axis.origin[0] ?? 0;
  const oy = axis.origin[1] ?? 0;
  let reach = 0;
  let topLayer = 0;
  for (const facet of facets) {
    const pose = poseForFacet(facet);
    topLayer = Math.max(topLayer, facet.layer);
    for (const p of facet.polygon) {
      const w = transformPoint(pose, p);
      reach = Math.max(reach, (w[0] - ox) * ex + (w[1] - oy) * ey);
    }
  }
  return reach > 0 ? reach + (topLayer + 1) * LAYER_THICKNESS : 0;
}

/** Transform a paper-space point by a pose matrix (for tests and annotations). */
export function transformPoint(
  m: Mat4,
  p: readonly [number, number],
): [number, number, number] {
  const x = p[0];
  const y = p[1];
  return [
    (m[0] ?? 0) * x + (m[4] ?? 0) * y + (m[12] ?? 0),
    (m[1] ?? 0) * x + (m[5] ?? 0) * y + (m[13] ?? 0),
    (m[2] ?? 0) * x + (m[6] ?? 0) * y + (m[14] ?? 0),
  ];
}
