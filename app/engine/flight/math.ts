import type { Vec3 } from "./types";

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function damp(current: number, target: number, response: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-response * dt));
}

export function distanceSquared(a: Vec3, b: Vec3): number {
  const x = a.x - b.x;
  const y = a.y - b.y;
  const z = a.z - b.z;
  return x * x + y * y + z * z;
}
