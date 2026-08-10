/**
 * The rest frame: standing a settled model on the table.
 *
 * These pin the derivation, not just the outcome. "The result is above zero"
 * would pass for a transform that shoved the model up by a hardcoded 50mm; "the
 * roll is 87 degrees about the wing hinge and the model then touches the table"
 * only passes for one that worked it out.
 */
import { describe, expect, it } from "vitest";
import { PLANES } from "@/content";
import { computeFoldState } from "@/engine/core/state";
import { restFrame, restTransform, wingHinge } from "@/engine/core/rest";
import { identityMat4, multiply, poseForFacet, transformPoint } from "@/engine/core/pose";
import type { FoldState } from "@/engine/core/types";
import type { Mat4 } from "@/engine/core/pose";

function worldBox(state: FoldState, pre: Mat4) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const facet of state.facets) {
    const pose = multiply(pre, poseForFacet(facet));
    for (const p of facet.polygon) {
      const w = transformPoint(pose, p);
      for (let i = 0; i < 3; i += 1) {
        min[i] = Math.min(min[i]!, w[i]!);
        max[i] = Math.max(max[i]!, w[i]!);
      }
    }
  }
  return {
    span: max[0]! - min[0]!,
    length: max[1]! - min[1]!,
    height: max[2]! - min[2]!,
    lowest: min[2]!,
  };
}

describe("rest is the identity until a plane becomes one", () => {
  it("is EXACTLY the identity for every flat state in the catalogue", () => {
    // Not "close to": the tutorial applies this from step one, and a rest frame
    // that were merely near-identity would drift the paper by a hair on every
    // flat fold of every plane. It is exact because a state with no bends has
    // no hinge to roll about, and `renormalizeLayers` guarantees a layer 0 that
    // sits at z = 0, so there is nothing to lift either.
    const id = identityMat4();
    let checked = 0;
    for (const [planeId, plane] of Object.entries(PLANES)) {
      for (let n = -1; n < plane.steps.length; n += 1) {
        const state = computeFoldState(plane, n);
        if (state.facets.some((f) => f.bend.length > 0)) continue;
        checked += 1;
        expect(restTransform(state), `${planeId} step ${n + 1}`).toEqual(id);
      }
    }
    expect(checked, "expected plenty of flat states to check").toBeGreaterThan(50);
  });

  it("finds no hinge on a flat state and every one on a finished plane", () => {
    const dart = PLANES.dart!;
    expect(wingHinge(computeFoldState(dart, 0))).toBeNull();
    expect(wingHinge(computeFoldState(dart, dart.steps.length - 1))).not.toBeNull();
  });
});

describe.each(Object.entries(PLANES))("%s: stands up on its own hinge", (id, plane) => {
  const state = computeFoldState(plane, plane.steps.length - 1);
  const frame = restFrame(state);

  it("rolls onto the wing hinge rather than tipping over", () => {
    expect(frame.hinge, "a finished plane must have a wing to rest on").not.toBeNull();
    // Every plane in the catalogue lands between 84 and 89 degrees. The band is
    // wide because the roll is DERIVED - it is whatever puts this aircraft's V
    // upright - but it is bounded because a value outside it would mean the
    // hinge vote had picked the wrong axis. The Harrier is the case that makes
    // this worth asserting: it bends its fins before its wings, so a vote by
    // facet count instead of paper area could pick a fin.
    expect(Math.abs(frame.rollDeg), `${id} rolled ${frame.rollDeg.toFixed(1)}`).toBeGreaterThan(60);
    expect(Math.abs(frame.rollDeg), `${id} rolled ${frame.rollDeg.toFixed(1)}`).toBeLessThan(120);
  });

  it("sets the aircraft down on the table, touching it exactly", () => {
    expect(frame.liftMm).toBeGreaterThan(0);
    expect(worldBox(state, frame.matrix).lowest).toBeCloseTo(0, 6);
  });

  it("comes out longer than it is wide and wider than it is tall", () => {
    // This is the claim the whole transform exists to make true, and the one
    // the codebase previously only made in a prose comment. Before it, span ran
    // up the z axis on every plane: 72mm wide, 310mm long and 57mm tall became
    // 57 wide, 310 long and 72 tall, which is an aircraft standing on its side.
    const box = worldBox(state, frame.matrix);
    expect(box.length, `${id} length ${box.length.toFixed(0)}`).toBeGreaterThan(box.span);
    expect(box.span, `${id} span ${box.span.toFixed(0)}`).toBeGreaterThan(box.height);
    expect(box.height).toBeGreaterThan(0);
  });

  it("is a rigid motion: it moves the paper without resizing it", () => {
    // A roll and a rise, nothing else. If a scale ever crept in, every length
    // ADR 0002 derives from the final pose would be quietly wrong.
    const facet = state.facets.find((f) => f.polygon.length >= 3)!;
    const flat = poseForFacet(facet);
    const rested = multiply(frame.matrix, flat);
    for (let i = 0; i < facet.polygon.length; i += 1) {
      const a = facet.polygon[i]!;
      const b = facet.polygon[(i + 1) % facet.polygon.length]!;
      const edge = (m: Mat4) => {
        const pa = transformPoint(m, a);
        const pb = transformPoint(m, b);
        return Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
      };
      expect(edge(rested)).toBeCloseTo(edge(flat), 9);
    }
  });

  it("leaves the nose where table space put it, because it never yaws", () => {
    // Rest is a roll about a hinge that runs fore and aft, plus a rise. Nothing
    // moves in y. Every claim elsewhere in the suite about the nose being at
    // low y survives it untouched, and the display float can bank about the
    // aircraft's own length without a correction.
    const before = worldBox(state, identityMat4());
    const after = worldBox(state, frame.matrix);
    expect(after.length).toBeCloseTo(before.length, 6);
  });
});
