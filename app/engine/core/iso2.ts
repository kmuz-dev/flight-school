/**
 * 2D isometries (rigid motions and reflections) as 2x3 row-major matrices.
 *
 * Layout matches types.ts: [m00, m01, tx, m10, m11, ty], acting as
 *   p' = [ m00 m01 ] p + [ tx ]
 *        [ m10 m11 ]     [ ty ]
 *
 * det = +1 is orientation preserving (face up); det = -1 is a reflection
 * (face down). A facet's `flatMap` is one of these: PAPER -> TABLE.
 */
import type { Iso2, Line2, Vec2 } from "./types";
import { EPS, cross, normalize, sub } from "./vec2";

export const ISO_IDENTITY: Iso2 = [1, 0, 0, 0, 1, 0];

export function isoApply(m: Iso2, p: Vec2): Vec2 {
  return [m[0] * p[0] + m[1] * p[1] + m[2], m[3] * p[0] + m[4] * p[1] + m[5]];
}

/** Transform a direction (ignores translation). */
export function isoApplyVector(m: Iso2, v: Vec2): Vec2 {
  return [m[0] * v[0] + m[1] * v[1], m[3] * v[0] + m[4] * v[1]];
}

export function isoDet(m: Iso2): number {
  return m[0] * m[4] - m[1] * m[3];
}

/** +1 face up, -1 face down. */
export function isoParity(m: Iso2): 1 | -1 {
  return isoDet(m) < 0 ? -1 : 1;
}

/** Composition `a . b`: apply `b` first, then `a`. */
export function isoCompose(a: Iso2, b: Iso2): Iso2 {
  return [
    a[0] * b[0] + a[1] * b[3],
    a[0] * b[1] + a[1] * b[4],
    a[0] * b[2] + a[1] * b[5] + a[2],
    a[3] * b[0] + a[4] * b[3],
    a[3] * b[1] + a[4] * b[4],
    a[3] * b[2] + a[4] * b[5] + a[5],
  ];
}

export function isoInverse(m: Iso2): Iso2 {
  const det = isoDet(m);
  if (Math.abs(det) <= EPS * EPS) {
    throw new Error("iso2: singular matrix has no inverse");
  }
  const i00 = m[4] / det;
  const i01 = -m[1] / det;
  const i10 = -m[3] / det;
  const i11 = m[0] / det;
  return [i00, i01, -(i00 * m[2] + i01 * m[5]), i10, i11, -(i10 * m[2] + i11 * m[5])];
}

export function isoTranslation(t: Vec2): Iso2 {
  return [1, 0, t[0], 0, 1, t[1]];
}

/** Rotation by `deg` counter-clockwise about `origin` (default: the origin). */
export function isoRotation(deg: number, origin: Vec2 = [0, 0]): Iso2 {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [
    c,
    -s,
    origin[0] - (c * origin[0] - s * origin[1]),
    s,
    c,
    origin[1] - (s * origin[0] + c * origin[1]),
  ];
}

/**
 * Reflection across the line through `line.a` in direction `line.b - line.a`.
 * With unit direction u the linear part is `2 u u^T - I`, which has det -1.
 */
export function isoReflection(line: Line2): Iso2 {
  const d = sub(line.b, line.a);
  const u = normalize(d);
  if (u[0] === 0 && u[1] === 0) {
    throw new Error("iso2: cannot reflect across a degenerate line");
  }
  const [ux, uy] = u;
  const r00 = 2 * ux * ux - 1;
  const r01 = 2 * ux * uy;
  const r10 = r01;
  const r11 = 2 * uy * uy - 1;
  const [ax, ay] = line.a;
  return [r00, r01, ax - (r00 * ax + r01 * ay), r10, r11, ay - (r10 * ax + r11 * ay)];
}

/**
 * Turning the model over: reflect the table across its y-axis (x -> -x).
 * Physically this is a 180 degree rotation about the table y-axis, which is why
 * a flip also inverts the layer stack.
 */
export function isoFlipY(): Iso2 {
  return [-1, 0, 0, 0, 1, 0];
}

export function isoEquals(a: Iso2, b: Iso2, eps: number = EPS): boolean {
  for (let i = 0; i < 6; i++) {
    const av = a[i];
    const bv = b[i];
    if (av === undefined || bv === undefined) return false;
    if (Math.abs(av - bv) > eps) return false;
  }
  return true;
}

/** Signed rotation angle in degrees of the linear part (meaningless if det < 0). */
export function isoRotationAngleDeg(m: Iso2): number {
  return (Math.atan2(m[3], m[0]) * 180) / Math.PI;
}

/** The angle of a line's direction in degrees, folded into [0, 180). */
export function lineAngleDeg(line: Line2): number {
  const d = sub(line.b, line.a);
  const a = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
  const folded = ((a % 180) + 180) % 180;
  return folded;
}

/** True when the two lines are parallel (no unique intersection point). */
export function linesParallel(l1: Line2, l2: Line2): boolean {
  return Math.abs(cross(normalize(sub(l1.b, l1.a)), normalize(sub(l2.b, l2.a)))) <= EPS;
}

/** Intersection of two lines, or null when parallel. */
export function lineIntersection(l1: Line2, l2: Line2): Vec2 | null {
  const d1 = sub(l1.b, l1.a);
  const d2 = sub(l2.b, l2.a);
  const denom = cross(d1, d2);
  if (Math.abs(denom) <= EPS * EPS) return null;
  const t = cross(sub(l2.a, l1.a), d2) / denom;
  return [l1.a[0] + d1[0] * t, l1.a[1] + d1[1] * t];
}
