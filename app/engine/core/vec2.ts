/**
 * 2D vector primitives and the engine's single tolerance policy.
 *
 * Paper units are millimeters. EPS is defined here once and imported by every
 * other core module - no file invents its own tolerance.
 */
import type { Vec2, Vec3 } from "./types";

/**
 * Geometric tolerance in millimeters. Two points closer than EPS are the same
 * point; a point within EPS of a line lies on it.
 */
export const EPS = 1e-4;

/** Area tolerance: a facet smaller than this is a sliver and must not survive. */
export const EPS_AREA = EPS * EPS;

export function v2(x: number, y: number): Vec2 {
  return [x, y];
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scale(a: Vec2, k: number): Vec2 {
  return [a[0] * k, a[1] * k];
}

export function negate(a: Vec2): Vec2 {
  return [-a[0], -a[1]];
}

export function dot(a: Vec2, b: Vec2): number {
  return a[0] * b[0] + a[1] * b[1];
}

/** z-component of the 3D cross product; positive means b is left of a. */
export function cross(a: Vec2, b: Vec2): number {
  return a[0] * b[1] - a[1] * b[0];
}

export function lenSq(a: Vec2): number {
  return a[0] * a[0] + a[1] * a[1];
}

export function len(a: Vec2): number {
  return Math.hypot(a[0], a[1]);
}

/** Returns the zero vector unchanged rather than producing NaN. */
export function normalize(a: Vec2): Vec2 {
  const l = len(a);
  if (l <= EPS) return [0, 0];
  return [a[0] / l, a[1] / l];
}

export function lerp(a: Vec2, b: Vec2, t: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function midpoint(a: Vec2, b: Vec2): Vec2 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Point equality within EPS. */
export function equals(a: Vec2, b: Vec2, eps: number = EPS): boolean {
  return Math.abs(a[0] - b[0]) <= eps && Math.abs(a[1] - b[1]) <= eps;
}

export function isZero(a: Vec2, eps: number = EPS): boolean {
  return Math.abs(a[0]) <= eps && Math.abs(a[1]) <= eps;
}

/** Scalar comparison against the shared tolerance. */
export function approx(a: number, b: number, eps: number = EPS): boolean {
  return Math.abs(a - b) <= eps;
}

/** Lift a table-space 2D point into the z=0 plane. */
export function toVec3(a: Vec2, z = 0): Vec3 {
  return [a[0], a[1], z];
}
