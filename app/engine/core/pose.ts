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
 * facets keep their previous pose; their layer offset lerps so a restack does
 * not pop.
 */
export function poseAtProgress(
  prevState: FoldState,
  delta: StepDelta,
  t: number,
): ReadonlyMap<number, Mat4> {
  const clamped = Math.max(0, Math.min(1, t));
  const moving = new Set(delta.movingFacetIds);
  const out = new Map<number, Mat4>();

  for (const facet of prevState.facets) {
    const base = poseForFacet(facet);
    if (!moving.has(facet.id) || !delta.axis || delta.angleDeg === 0) {
      out.set(facet.id, base);
      continue;
    }
    const change = delta.layerChanges.get(facet.id);
    const layerLerp = change
      ? (change.to - change.from) * clamped * LAYER_THICKNESS
      : 0;
    const rotated = multiply(
      rotationAboutAxis(delta.axis.origin, delta.axis.dir, delta.angleDeg * clamped),
      base,
    );
    out.set(facet.id, multiply(translation(0, 0, layerLerp), rotated));
  }
  return out;
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
