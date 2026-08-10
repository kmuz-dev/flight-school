/**
 * The rest frame: standing a settled model on the table.
 *
 * These pin the derivation, not just the outcome. "The result is above zero"
 * would pass for a transform that shoved the model up by a hardcoded 50mm; "the
 * roll is a quarter turn about the wing hinge, the model then touches the table,
 * and its two wings come out at the same angle as each other"
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

/**
 * The angle each bent facet's own plane makes with horizontal, area-weighted
 * per side of the hinge.
 *
 * Attitude, not position: a facet's normal is what decides whether a wing looks
 * level, and unlike a centroid it cannot be moved by the layer offsets that a
 * `top`/`bottom` wing pair puts between the two sides.
 */
function wingTilts(state: FoldState, rest: Mat4, hingeX: number, onlyBends?: number) {
  const acc: Record<"port" | "starboard", { tilt: number; area: number }> = {
    port: { tilt: 0, area: 0 },
    starboard: { tilt: 0, area: 0 },
  };
  for (const facet of state.facets) {
    if (facet.bend.length === 0) continue;
    // `onlyBends` isolates the plain wing. The Harrier creases its fin tips
    // before its wings and then carries them along, so those facets end up with
    // two bends and sit at the fin's angle rather than the wing's.
    if (onlyBends !== undefined && facet.bend.length !== onlyBends) continue;
    const pose = multiply(rest, poseForFacet(facet));
    const p = facet.polygon.map((v) => transformPoint(pose, v));
    let n = [0, 0, 0];
    let cx = 0;
    for (let i = 0; i < p.length; i += 1) {
      const a = p[i]!;
      const b = p[(i + 1) % p.length]!;
      n = [
        n[0]! + (a[1] - b[1]) * (a[2] + b[2]),
        n[1]! + (a[2] - b[2]) * (a[0] + b[0]),
        n[2]! + (a[0] - b[0]) * (a[1] + b[1]),
      ];
      cx += a[0];
    }
    const len = Math.hypot(n[0]!, n[1]!, n[2]!);
    if (len < 1e-9) continue;
    const weight = len / 2; // Newell's magnitude is twice the polygon's area.
    const tilt = (Math.acos(Math.min(1, Math.abs(n[2]! / len))) * 180) / Math.PI;
    const side = cx / p.length >= hingeX ? "starboard" : "port";
    acc[side].tilt += tilt * weight;
    acc[side].area += weight;
  }
  return {
    port: acc.port.tilt / (acc.port.area || 1),
    starboard: acc.starboard.tilt / (acc.starboard.area || 1),
  };
}

describe.each(Object.entries(PLANES))("%s: stands up on its own hinge", (id, plane) => {
  const state = computeFoldState(plane, plane.steps.length - 1);
  const frame = restFrame(state);

  /**
   * The gate that the first version of this transform walked straight past.
   *
   * `restFrame` used to roll the aircraft until the bent facets' mean CENTROID
   * sat above the hinge. A wing pair is two folds on one crease with
   * `layers: "top"` and `layers: "bottom"`, so the two wings live on different
   * layers of the stack and `poseForFacet` offsets them by
   * `layer * LAYER_THICKNESS`. Those sub-millimetre offsets move the two
   * centroids by different amounts, and over an arm of a centimetre that is
   * worth two to five degrees - so the roll turned the whole aircraft to cancel
   * a paper-thickness artefact and left the wings themselves off level. On the
   * Hammer they sat 8.00 degrees apart and it read, correctly, as a broken
   * model.
   *
   * Every other assertion in this file passed throughout: the roll was inside
   * its 60-120 band, the box still came out longer than wide than tall, and the
   * motion was still rigid. Only measuring the wings against each other says
   * anything about whether the plane looks level.
   */
  it("finishes with its two wings at the same angle", () => {
    const tilts = wingTilts(state, frame.matrix, frame.hinge!.origin[0]);
    const gap = Math.abs(tilts.port - tilts.starboard);
    expect(
      gap,
      `${id} port ${tilts.port.toFixed(2)} deg, starboard ${tilts.starboard.toFixed(2)} deg`,
    ).toBeLessThan(0.05);
  });

  it("leaves the wings at the dihedral the fold sequence authored", () => {
    // Not merely equal to each other - equal to what the content asked for. A
    // roll that levelled the wings by splitting the difference wrongly would
    // pass the test above and fail this one, and the two together pin the
    // attitude rather than just its symmetry.
    const wingStep = [...plane.steps]
      .reverse()
      .find((s) => s.action.type === "fold" && s.action.layers !== undefined);
    const action = wingStep?.action;
    if (!action || action.type !== "fold") return;
    // The angle is per wing measured from CLOSED, where a wing stands square to
    // the table, so a fold of `angle` leaves it `90 - angle` above horizontal.
    const expected = Math.abs(90 - action.angle);
    const tilts = wingTilts(state, frame.matrix, frame.hinge!.origin[0], 1);
    expect(tilts.port, `${id} port, authored ${action.angle} deg`).toBeCloseTo(expected, 1);
    expect(tilts.starboard, `${id} starboard, authored ${action.angle} deg`).toBeCloseTo(
      expected,
      1,
    );
  });

  it("rolls onto the wing hinge rather than tipping over", () => {
    expect(frame.hinge, "a finished plane must have a wing to rest on").not.toBeNull();
    // Every plane in the catalogue lands on exactly 90 degrees, which is the
    // sign the derivation is right rather than a coincidence: a fold sequence
    // is authored with the sheet flat on the table, so a finished aircraft is
    // that sheet stood on edge, and standing it back up is a quarter turn.
    //
    // The band is nevertheless kept wide, because the roll is DERIVED - it is
    // whatever puts THIS aircraft's V upright, and a future plane whose spine
    // is not the authored fold line is entitled to a different number. It is
    // bounded at all because a value outside it would mean the hinge vote had
    // picked the wrong axis; the Harrier is the case that makes that worth
    // asserting, since it bends its fins before its wings and a vote by facet
    // count instead of paper area could pick a fin.
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
