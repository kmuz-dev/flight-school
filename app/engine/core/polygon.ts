/**
 * Convex polygon operations in paper space.
 *
 * The only splitting primitive the engine has: `splitConvex` cuts a convex
 * polygon by an infinite line and returns the two halves. Repeated splitting is
 * how a crease lands on every stacked layer, so this file owns the numerical
 * hygiene (vertex snapping, sliver culling) that keeps a long fold sequence from
 * degenerating.
 */
import type { Line2, Vec2 } from "./types";
import { EPS, EPS_AREA, cross, distance, sub } from "./vec2";

/** Signed side of `p` relative to the directed line a->b. */
export function sideOf(line: Line2, p: Vec2): number {
  return cross(sub(line.b, line.a), sub(p, line.a));
}

/**
 * Classification of a point against a line: -1 right, 0 on, +1 left.
 * The tolerance is distance-based, not raw cross product, so it stays
 * meaningful for long creases.
 */
export function classify(line: Line2, p: Vec2): -1 | 0 | 1 {
  const d = sub(line.b, line.a);
  const lineLen = Math.hypot(d[0], d[1]);
  if (lineLen <= EPS) return 0;
  const dist = sideOf(line, p) / lineLen;
  if (dist > EPS) return 1;
  if (dist < -EPS) return -1;
  return 0;
}

/** Twice the signed area; positive for counter-clockwise winding. */
export function signedArea2(poly: readonly Vec2[]): number {
  let acc = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    if (!a || !b) continue;
    acc += a[0] * b[1] - b[0] * a[1];
  }
  return acc;
}

export function area(poly: readonly Vec2[]): number {
  return Math.abs(signedArea2(poly)) / 2;
}

export function centroid(poly: readonly Vec2[]): Vec2 {
  const a2 = signedArea2(poly);
  if (Math.abs(a2) <= EPS_AREA) {
    // Degenerate: fall back to the vertex average.
    let sx = 0;
    let sy = 0;
    for (const p of poly) {
      sx += p[0];
      sy += p[1];
    }
    const n = Math.max(1, poly.length);
    return [sx / n, sy / n];
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    if (!a || !b) continue;
    const w = a[0] * b[1] - b[0] * a[1];
    cx += (a[0] + b[0]) * w;
    cy += (a[1] + b[1]) * w;
  }
  return [cx / (3 * a2), cy / (3 * a2)];
}

/** Drop consecutive duplicate vertices and collinear runs. */
export function cleanPolygon(poly: readonly Vec2[]): Vec2[] {
  const dedup: Vec2[] = [];
  for (const p of poly) {
    const last = dedup[dedup.length - 1];
    if (!last || distance(last, p) > EPS) dedup.push(p);
  }
  while (dedup.length > 1) {
    const first = dedup[0];
    const last = dedup[dedup.length - 1];
    if (first && last && distance(first, last) <= EPS) dedup.pop();
    else break;
  }
  if (dedup.length < 3) return dedup;
  const out: Vec2[] = [];
  for (let i = 0; i < dedup.length; i++) {
    const prev = dedup[(i - 1 + dedup.length) % dedup.length];
    const cur = dedup[i];
    const next = dedup[(i + 1) % dedup.length];
    if (!prev || !cur || !next) continue;
    const c = cross(sub(cur, prev), sub(next, cur));
    const scale = Math.max(1, distance(prev, cur) * distance(cur, next));
    if (Math.abs(c) / scale > EPS) out.push(cur);
  }
  return out.length >= 3 ? out : dedup;
}

/** A polygon too small to matter must not survive a split. */
export function isSliver(poly: readonly Vec2[]): boolean {
  return poly.length < 3 || area(poly) <= EPS_AREA;
}

export type SplitResult = {
  /** Part on the left of the directed line (may be empty). */
  readonly left: Vec2[];
  /** Part on the right (may be empty). */
  readonly right: Vec2[];
  /** The crease segment inside the polygon, when the line actually crosses it. */
  readonly segment: readonly [Vec2, Vec2] | null;
};

/**
 * Split a convex polygon by an infinite line (Sutherland-Hodgman, both halves).
 *
 * Vertices within EPS of the line are emitted to both halves unchanged rather
 * than duplicated as new intersection points - that snapping is what stops a
 * near-vertex crease from spawning slivers.
 */
export function splitConvex(poly: readonly Vec2[], line: Line2): SplitResult {
  const n = poly.length;
  if (n < 3) return { left: [], right: [], segment: null };

  const cls: (-1 | 0 | 1)[] = poly.map((p) => classify(line, p));
  const hasLeft = cls.some((c) => c === 1);
  const hasRight = cls.some((c) => c === -1);

  if (!hasLeft && !hasRight) {
    // Degenerate: the whole polygon lies on the line.
    return { left: [], right: [], segment: null };
  }
  if (!hasRight) return { left: [...poly], right: [], segment: null };
  if (!hasLeft) return { left: [], right: [...poly], segment: null };

  const left: Vec2[] = [];
  const right: Vec2[] = [];
  const onLine: Vec2[] = [];

  for (let i = 0; i < n; i++) {
    const cur = poly[i];
    const next = poly[(i + 1) % n];
    const cCur = cls[i];
    const cNext = cls[(i + 1) % n];
    if (!cur || !next || cCur === undefined || cNext === undefined) continue;

    if (cCur >= 0) left.push(cur);
    if (cCur <= 0) right.push(cur);
    if (cCur === 0) onLine.push(cur);

    // Only a strict sign change produces a new intersection vertex.
    if (cCur * cNext === -1) {
      const s1 = sideOf(line, cur);
      const s2 = sideOf(line, next);
      const t = s1 / (s1 - s2);
      const ix: Vec2 = [cur[0] + (next[0] - cur[0]) * t, cur[1] + (next[1] - cur[1]) * t];
      left.push(ix);
      right.push(ix);
      onLine.push(ix);
    }
  }

  const cleanLeft = cleanPolygon(left);
  const cleanRight = cleanPolygon(right);

  // A sliver on either side means the line effectively grazed the polygon.
  if (isSliver(cleanLeft)) return { left: [], right: [...poly], segment: null };
  if (isSliver(cleanRight)) return { left: [...poly], right: [], segment: null };

  let segment: readonly [Vec2, Vec2] | null = null;
  if (onLine.length >= 2) {
    // The crease segment is the extreme pair of on-line points.
    let best: [Vec2, Vec2] = [onLine[0]!, onLine[1]!];
    let bestD = distance(best[0], best[1]);
    for (let i = 0; i < onLine.length; i++) {
      for (let j = i + 1; j < onLine.length; j++) {
        const a = onLine[i];
        const b = onLine[j];
        if (!a || !b) continue;
        const d = distance(a, b);
        if (d > bestD) {
          bestD = d;
          best = [a, b];
        }
      }
    }
    if (bestD > EPS) segment = best;
  }

  return { left: cleanLeft, right: cleanRight, segment };
}

/** Do two convex polygons overlap by more than a sliver? (SAT on edge normals.) */
export function convexOverlap(a: readonly Vec2[], b: readonly Vec2[]): boolean {
  if (a.length < 3 || b.length < 3) return false;
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      const q = poly[(i + 1) % poly.length];
      if (!p || !q) continue;
      const edge = sub(q, p);
      const axis: Vec2 = [-edge[1], edge[0]];
      const axisLen = Math.hypot(axis[0], axis[1]);
      if (axisLen <= EPS) continue;
      const project = (poly2: readonly Vec2[]) => {
        let min = Infinity;
        let max = -Infinity;
        for (const v of poly2) {
          const d = (v[0] * axis[0] + v[1] * axis[1]) / axisLen;
          if (d < min) min = d;
          if (d > max) max = d;
        }
        return [min, max] as const;
      };
      const [minA, maxA] = project(a);
      const [minB, maxB] = project(b);
      // Touching edges are not an overlap; require real interior intersection.
      if (maxA <= minB + EPS || maxB <= minA + EPS) return false;
    }
  }
  return true;
}

export function boundingBox(polys: readonly (readonly Vec2[])[]): {
  min: Vec2;
  max: Vec2;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poly of polys) {
    for (const p of poly) {
      if (p[0] < minX) minX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] > maxY) maxY = p[1];
    }
  }
  if (minX === Infinity) return { min: [0, 0], max: [0, 0] };
  return { min: [minX, minY], max: [maxX, maxY] };
}
