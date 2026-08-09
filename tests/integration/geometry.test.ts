/**
 * Geometric acceptance for authored fold sequences (orchestrator-owned).
 *
 * The owner deferred the physical fold test to launch, so this is what stands
 * between a wrong crease and it propagating across the catalog: every plane's
 * sequence is replayed through the real engine and checked for the properties a
 * real folded plane must have.
 */
import { describe, expect, it } from "vitest";
import { PLANES } from "@/content";
import { computeFoldState, computeStepDelta, totalArea, validateSequence } from "@/engine/core/state";
import { facetInTable } from "@/engine/core/fold";
import { PAPER_SIZES, formatForPlane } from "@/engine/core/paper";
import { boundingBox, area as polygonArea } from "@/engine/core/polygon";
import { posesForState, transformPoint } from "@/engine/core/pose";
import type { PlaneStructure } from "@/content/types";

describe.each(Object.entries(PLANES))("%s: authored sequence", (id, plane) => {
  const last = plane.steps.length - 1;
  const final = computeFoldState(plane, last);
  const sheet = PAPER_SIZES[formatForPlane(plane.paper.format)];
  const sheetArea = sheet.width * sheet.height;

  it("passes engine validation with no issues", () => {
    const issues = validateSequence(plane);
    expect(issues.map((i) => `${i.stepId}: ${i.code} - ${i.message}`)).toEqual([]);
  });

  it("conserves paper (no cut in this sequence)", () => {
    const hasCut = plane.steps.some((s) => s.action.type === "cut");
    if (hasCut) return;
    expect(Math.abs(totalArea(final) - sheetArea)).toBeLessThan(sheetArea * 1e-6);
  });

  it("every step produces a non-empty state", () => {
    for (let i = 0; i <= last; i++) {
      const state = computeFoldState(plane, i);
      expect(state.facets.length, `step ${i} (${plane.steps[i]?.id})`).toBeGreaterThan(0);
    }
  });

  it("folds down to a plane-like silhouette, not a blob", () => {
    const box = boundingBox(final.facets.map(facetInTable));
    const width = box.max[0] - box.min[0];
    const height = box.max[1] - box.min[1];
    // A finished dart is much longer than it is wide, and narrower than the
    // sheet it came from.
    expect(width).toBeLessThan(sheet.width);
    expect(height / width).toBeGreaterThan(1.2);
  });

  it("builds a layered stack rather than staying flat", () => {
    expect(final.maxLayer).toBeGreaterThan(0);
  });

  it("has strictly increasing step ids", () => {
    const ids = plane.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((stepId, i) => {
      expect(stepId).toBe(`${id}.step-${String(i + 1).padStart(2, "0")}`);
    });
  });
});

/**
 * Wing pairs need opposite-direction opening. Side selection alone cannot
 * express this: after the half fold both wings sit on the SAME side of the wing
 * crease, stacked, so a single step would tilt them together instead of opening
 * a V. The `layers` selector is what separates them.
 */
describe("wing opening forms a V", () => {
  it("the Dart's two wing steps move disjoint layer sets in opposite directions", () => {
    const dart = PLANES.dart!;
    const wingSteps = dart.steps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.action.type === "fold" && step.action.layers !== undefined);

    expect(wingSteps.length, "expected two layer-targeted wing steps").toBe(2);

    const [first, second] = wingSteps;
    const a = first!.step.action;
    const b = second!.step.action;
    if (a.type !== "fold" || b.type !== "fold") throw new Error("expected fold actions");

    // Same crease, same side, opposite direction, complementary layer halves.
    expect(a.crease).toEqual(b.crease);
    expect(a.side).toBe(b.side);
    expect(a.direction).not.toBe(b.direction);
    expect([a.layers, b.layers].sort()).toEqual(["bottom", "top"]);

    const movedFirst = computeStepDelta(dart, first!.index)?.movingFacetIds ?? [];
    const movedSecond = computeStepDelta(dart, second!.index)?.movingFacetIds ?? [];
    expect(movedFirst.length).toBeGreaterThan(0);
    expect(movedSecond.length).toBeGreaterThan(0);
    // Each step moves only part of the stack, never the whole of it.
    const overlap = movedFirst.filter((id) => movedSecond.includes(id));
    expect(overlap, "the two wing steps must move different layers").toEqual([]);
  });
});

/**
 * Wings have to end up roughly level, and the engine cannot tell you that from
 * a bounding box. The fold angle is per wing measured from closed, so the two
 * finish about twice it apart - which means reading it as "degrees from level"
 * silently produces a plane with its wings nearly shut. That is precisely how
 * the Dart shipped through Gate 1, at 25 degrees and a 49 degree spread.
 */
describe.each(Object.entries(PLANES))("%s: wings sit at a flyable dihedral", (_id, plane) => {
  it("opens the wings to between 150 and 178 degrees apart", () => {
    expect(wingSpreadDegrees(plane)).toBeGreaterThan(150);
    expect(wingSpreadDegrees(plane)).toBeLessThan(178);
  });
});

/**
 * Angle between the two wings, measured from the final hinge outward, with the
 * hinge direction projected out. 180 is a flat plank, 0 is shut. Measuring the
 * angle between the wing surfaces instead cannot distinguish 10 degrees from
 * 170, which is the whole question.
 */
function wingSpreadDegrees(plane: PlaneStructure): number {
  const state = computeFoldState(plane, plane.steps.length - 1);
  const poses = posesForState(state);
  const axis = computeStepDelta(plane, plane.steps.length - 1)?.axis;
  if (!axis) throw new Error("the last step must be the wing that opens second");

  const wings = state.facets
    .filter((f) => f.bend.length > 0)
    .sort((a, b) => polygonArea(b.polygon) - polygonArea(a.polygon))
    .slice(0, 2);
  expect(wings, "expected two bent wing facets").toHaveLength(2);

  const acrossHinge = (facet: (typeof wings)[number]): readonly number[] => {
    const pose = poses.get(facet.id);
    if (!pose) throw new Error(`facet ${facet.id} has no pose`);
    const pts = facet.polygon.map((p) => transformPoint(pose, p));
    const arm = [0, 1, 2].map(
      (i) => pts.reduce((sum, p) => sum + (p[i] ?? 0), 0) / pts.length - (axis.origin[i] ?? 0),
    );
    const along = arm.reduce((sum, v, i) => sum + v * (axis.dir[i] ?? 0), 0);
    return arm.map((v, i) => v - along * (axis.dir[i] ?? 0));
  };

  const [a, b] = [acrossHinge(wings[0]!), acrossHinge(wings[1]!)];
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] ?? 0), 0);
  const norm = (v: readonly number[]) => Math.hypot(...v);
  return (Math.acos(Math.max(-1, Math.min(1, dot / (norm(a) * norm(b))))) * 180) / Math.PI;
}
