import { describe, expect, it } from "vitest";
import { EPS, cross, distance, sub } from "@/engine/core/vec2";
import {
  ISO_IDENTITY,
  isoApply,
  isoCompose,
  isoDet,
  isoInverse,
  isoReflection,
  isoRotation,
} from "@/engine/core/iso2";
import { area, classify, cleanPolygon, convexOverlap, splitConvex } from "@/engine/core/polygon";
import { rotationAboutAxis, transformPoint } from "@/engine/core/pose";
import type { Line2, Vec2 } from "@/engine/core/types";

const X_AXIS: Line2 = { a: [0, 0], b: [1, 0] };
const Y_EQ_X: Line2 = { a: [0, 0], b: [1, 1] };
const SQUARE: Vec2[] = [
  [-10, -10],
  [10, -10],
  [10, 10],
  [-10, 10],
];

const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) <= eps;

describe("1. reflection", () => {
  it("reflects across the x-axis", () => {
    const m = isoReflection(X_AXIS);
    const p = isoApply(m, [3, 5]);
    expect(near(p[0], 3)).toBe(true);
    expect(near(p[1], -5)).toBe(true);
  });

  it("reflects across y = x", () => {
    const m = isoReflection(Y_EQ_X);
    const p = isoApply(m, [3, 5]);
    expect(near(p[0], 5)).toBe(true);
    expect(near(p[1], 3)).toBe(true);
  });

  it("reflects across an arbitrary offset line", () => {
    const line: Line2 = { a: [0, 4], b: [1, 4] }; // y = 4
    const p = isoApply(isoReflection(line), [2, 10]);
    expect(near(p[0], 2)).toBe(true);
    expect(near(p[1], -2)).toBe(true);
  });

  it("is an involution", () => {
    const m = isoReflection({ a: [1, 2], b: [4, 7] });
    const p: Vec2 = [9, -3];
    const back = isoApply(m, isoApply(m, p));
    expect(distance(back, p)).toBeLessThan(1e-9);
  });

  it("has determinant -1", () => {
    expect(near(isoDet(isoReflection(Y_EQ_X)), -1)).toBe(true);
  });

  it("composes two reflections into a rotation of twice the angle", () => {
    // x-axis then y = x (45 degrees apart) composes to a 90 degree rotation.
    const composed = isoCompose(isoReflection(Y_EQ_X), isoReflection(X_AXIS));
    const p = isoApply(composed, [1, 0]);
    expect(near(p[0], 0, 1e-9)).toBe(true);
    expect(near(p[1], 1, 1e-9)).toBe(true);
    expect(near(isoDet(composed), 1)).toBe(true);
  });
});

describe("2. the 180-degree lemma (animation and folded state agree)", () => {
  it("a 3D rotation of 180deg about an in-plane line equals the 2D reflection", () => {
    const lines: Line2[] = [
      { a: [0, 0], b: [1, 0] },
      { a: [0, 0], b: [1, 1] },
      { a: [-3, 2], b: [5, 9] },
      { a: [2, -7], b: [2, 11] },
    ];
    for (const line of lines) {
      const d = sub(line.b, line.a);
      const len = Math.hypot(d[0], d[1]);
      const axis = rotationAboutAxis(
        [line.a[0], line.a[1], 0],
        [d[0] / len, d[1] / len, 0],
        180,
      );
      const refl = isoReflection(line);
      for (const p of [
        [1, 1],
        [-4, 6],
        [10, -2],
      ] as Vec2[]) {
        const viaRotation = transformPoint(axis, p);
        const viaReflection = isoApply(refl, p);
        expect(near(viaRotation[0], viaReflection[0], 1e-6)).toBe(true);
        expect(near(viaRotation[1], viaReflection[1], 1e-6)).toBe(true);
        expect(near(viaRotation[2], 0, 1e-6)).toBe(true);
      }
    }
  });
});

describe("3-5. convex splitting", () => {
  it("splits a square down its vertical center line", () => {
    const { left, right } = splitConvex(SQUARE, { a: [0, -20], b: [0, 20] });
    expect(left.length).toBeGreaterThanOrEqual(3);
    expect(right.length).toBeGreaterThanOrEqual(3);
    expect(near(area(left) + area(right), area(SQUARE), 1e-6)).toBe(true);
    expect(near(area(left), 200, 1e-6)).toBe(true);
  });

  it("splits through opposite vertices into exactly two triangles", () => {
    const { left, right } = splitConvex(SQUARE, { a: [-10, -10], b: [10, 10] });
    expect(left).toHaveLength(3);
    expect(right).toHaveLength(3);
    expect(near(area(left) + area(right), area(SQUARE), 1e-6)).toBe(true);
  });

  it("returns the whole polygon on one side when the line misses it", () => {
    // Line x=50 pointing +y: the square at x in [-10,10] lies to its left.
    const right = splitConvex(SQUARE, { a: [50, -20], b: [50, 20] });
    expect(right.right).toHaveLength(0);
    expect(right.left).toHaveLength(4);
    // Same line pointing -y puts the square on the other side.
    const left = splitConvex(SQUARE, { a: [50, 20], b: [50, -20] });
    expect(left.left).toHaveLength(0);
    expect(left.right).toHaveLength(4);
  });

  it("does not split on a line collinear with an edge", () => {
    const along = splitConvex(SQUARE, { a: [-10, -10], b: [10, -10] });
    expect(along.left.length === 0 || along.right.length === 0).toBe(true);
  });

  it("reports the crease segment inside the polygon", () => {
    const { segment } = splitConvex(SQUARE, { a: [0, -20], b: [0, 20] });
    expect(segment).not.toBeNull();
    if (segment) expect(near(distance(segment[0], segment[1]), 20, 1e-6)).toBe(true);
  });
});

describe("6. epsilon robustness", () => {
  it("snaps a near-vertex crease instead of spawning a sliver", () => {
    const { left, right } = splitConvex(SQUARE, {
      a: [-10 + 1e-6, -20],
      b: [-10 + 1e-6, 20],
    });
    // The near-edge line grazes: one side must be empty, no sliver survives.
    expect(left.length === 0 || right.length === 0).toBe(true);
  });

  it("conserves area over 1000 random creases", () => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 1000; i++) {
      const line: Line2 = {
        a: [rand() * 40 - 20, rand() * 40 - 20],
        b: [rand() * 40 - 20, rand() * 40 - 20],
      };
      if (distance(line.a, line.b) < 1) continue;
      const { left, right } = splitConvex(SQUARE, line);
      const total = area(left) + area(right);
      const expected = left.length && right.length ? area(SQUARE) : area(SQUARE);
      expect(Math.abs(total - expected)).toBeLessThan(1e-6);
      for (const part of [left, right]) {
        if (part.length > 0) expect(area(part)).toBeGreaterThan(EPS * EPS);
      }
    }
  });

  it("cleans collinear runs and duplicate vertices", () => {
    const messy: Vec2[] = [
      [0, 0],
      [5, 0],
      [10, 0],
      [10, 10],
      [10, 10],
      [0, 10],
    ];
    const cleaned = cleanPolygon(messy);
    expect(cleaned).toHaveLength(4);
    expect(near(area(cleaned), 100, 1e-9)).toBe(true);
  });
});

describe("classification and overlap", () => {
  it("classifies points left, right, and on the line", () => {
    expect(classify(X_AXIS, [0, 5])).toBe(1);
    expect(classify(X_AXIS, [0, -5])).toBe(-1);
    expect(classify(X_AXIS, [3, 0])).toBe(0);
  });

  it("detects real overlap but not edge contact", () => {
    const a: Vec2[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    const overlapping: Vec2[] = [
      [5, 5],
      [15, 5],
      [15, 15],
      [5, 15],
    ];
    const touching: Vec2[] = [
      [10, 0],
      [20, 0],
      [20, 10],
      [10, 10],
    ];
    expect(convexOverlap(a, overlapping)).toBe(true);
    expect(convexOverlap(a, touching)).toBe(false);
  });
});

describe("isometry algebra", () => {
  it("inverts exactly", () => {
    const m = isoCompose(isoRotation(37, [4, -2]), isoReflection({ a: [1, 1], b: [3, 8] }));
    const inv = isoInverse(m);
    const p: Vec2 = [7, -5];
    const back = isoApply(inv, isoApply(m, p));
    expect(distance(back, p)).toBeLessThan(1e-9);
  });

  it("keeps identity as the composition unit", () => {
    const m = isoRotation(15);
    const p: Vec2 = [2, 3];
    expect(distance(isoApply(isoCompose(m, ISO_IDENTITY), p), isoApply(m, p))).toBeLessThan(1e-12);
  });

  it("preserves distances (it is an isometry)", () => {
    const m = isoCompose(isoRotation(63, [1, 2]), isoReflection(Y_EQ_X));
    const p: Vec2 = [4, 9];
    const q: Vec2 = [-3, 2];
    expect(near(distance(isoApply(m, p), isoApply(m, q)), distance(p, q), 1e-9)).toBe(true);
  });

  it("cross product sign matches the left-hand convention", () => {
    expect(cross([1, 0], [0, 1])).toBeGreaterThan(0);
  });
});
