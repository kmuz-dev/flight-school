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
import { boundingBox } from "@/engine/core/polygon";

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
