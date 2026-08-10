/**
 * The fold editor's inspector derivations.
 *
 * These pin the numbers a geometry author trusts: facet parity, table-space
 * centroids, layer bookkeeping and the paper-conservation check. Where the
 * engine already knows an answer (the step delta, the validation issues) the
 * test asserts the tool reports it unchanged rather than re-deriving it.
 */
import { describe, expect, it } from "vitest";
import { dart } from "@/content/planes/dart";
import { computeFoldState, computeStepDelta, validateSequence } from "@/engine/core/state";
import {
  AREA_TOLERANCE,
  describeAction,
  facetRows,
  formatVec,
  hasAreaDrift,
  issuesByStep,
  mm,
  sheetArea,
  stepDiagnostics,
} from "@/dev/fold-editor/inspect";

const LAST = dart.steps.length - 1;

describe("facetRows", () => {
  it("describes the fresh sheet as one face-up facet at layer 0", () => {
    const rows = facetRows(computeFoldState(dart, -1));
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    expect(row).toMatchObject({
      id: 0,
      layer: 0,
      parity: 1,
      bent: false,
      bendCount: 0,
      vertexCount: 4,
    });
    expect(row.area).toBeCloseTo(210 * 297, 6);
    expect(row.centroid[0]).toBeCloseTo(0, 9);
    expect(row.centroid[1]).toBeCloseTo(0, 9);
  });

  it("reports centroids in TABLE space, not paper space", () => {
    // After folding the right half onto the left, every facet's table centroid
    // must sit at x <= 0 even though half of them still have +x paper polygons.
    const rows = facetRows(computeFoldState(dart, 0));
    expect(rows.length).toBeGreaterThan(1);
    for (const row of rows) expect(row.centroid[0]).toBeLessThanOrEqual(1e-6);
  });

  it("reports -1 parity for a reflected (face-down) facet", () => {
    const rows = facetRows(computeFoldState(dart, 0));
    expect(rows.some((r) => r.parity === -1)).toBe(true);
    expect(rows.some((r) => r.parity === 1)).toBe(true);
  });

  it("counts bends once a partial fold has run", () => {
    const before = facetRows(computeFoldState(dart, 9));
    expect(before.every((r) => !r.bent)).toBe(true);
    const after = facetRows(computeFoldState(dart, 10));
    const bent = after.filter((r) => r.bent);
    expect(bent.length).toBeGreaterThan(0);
    expect(bent.every((r) => r.bendCount === 1)).toBe(true);
  });

  it("sorts bottom layer first, then by id", () => {
    const rows = facetRows(computeFoldState(dart, LAST));
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1]!;
      const cur = rows[i]!;
      expect(prev.layer < cur.layer || (prev.layer === cur.layer && prev.id < cur.id)).toBe(
        true,
      );
    }
  });

  it("gives every facet a unique id, so row selection is unambiguous", () => {
    const rows = facetRows(computeFoldState(dart, LAST));
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });
});

describe("sheetArea", () => {
  it("is the unfolded A4 sheet for a letter-a4 sequence", () => {
    expect(sheetArea(dart)).toBeCloseTo(210 * 297, 6);
  });
});

describe("stepDiagnostics", () => {
  it("describes the fresh sheet at index -1 with no delta", () => {
    const d = stepDiagnostics(dart, -1);
    expect(d.stepIndex).toBe(-1);
    expect(d.stepId).toBeNull();
    expect(d.action).toBeNull();
    expect(d.delta).toBeNull();
    expect(d.facetCount).toBe(1);
    expect(d.maxLayer).toBe(0);
    expect(d.layerChanges).toEqual([]);
  });

  it("clamps past the end of the sequence", () => {
    expect(stepDiagnostics(dart, 999).stepIndex).toBe(LAST);
    expect(stepDiagnostics(dart, -50).stepIndex).toBe(-1);
  });

  it("reports the state AFTER the step, matching computeFoldState", () => {
    for (let i = 0; i <= LAST; i++) {
      const state = computeFoldState(dart, i);
      const d = stepDiagnostics(dart, i);
      expect(d.facetCount).toBe(state.facets.length);
      expect(d.maxLayer).toBe(state.maxLayer);
      expect(d.stepId).toBe(dart.steps[i]!.id);
    }
  });

  it("passes the engine's step delta through unchanged", () => {
    const d = stepDiagnostics(dart, 10);
    const delta = computeStepDelta(dart, 10)!;
    expect(d.delta?.kind).toBe(delta.kind);
    expect(d.delta?.angleDeg).toBe(delta.angleDeg);
    expect(d.delta?.movingFacetIds).toEqual(delta.movingFacetIds);
    expect(d.delta?.axis?.origin).toEqual(delta.axis?.origin);
  });

  it("flattens layer changes in facet-id order, showing only the ones that moved", () => {
    const d = stepDiagnostics(dart, 0);
    const ids = d.layerChanges.map((c) => c.facetId);
    expect([...ids].sort((a, b) => a - b)).toEqual(ids);
    // The delta records a span for every facet, because poseAtProgress needs a
    // facet's starting layer to undo what the step's rotation does to its z
    // offset even when the layer itself holds. A panel reading of "layer 3 ->
    // layer 3" is noise, so the diagnostics drop those rows.
    const delta = computeStepDelta(dart, 0)!;
    expect(delta.layerChanges.size).toBeGreaterThan(d.layerChanges.length);
    for (const change of d.layerChanges) {
      expect(change.from).not.toBe(change.to);
    }
  });

  it("sees no area drift anywhere in the Dart, which has no cut", () => {
    for (let i = -1; i <= LAST; i++) {
      const d = stepDiagnostics(dart, i);
      expect(d.areaDrifted, `step ${i}`).toBe(false);
      expect(Math.abs(d.areaDrift)).toBeLessThanOrEqual(d.sheetArea * AREA_TOLERANCE);
    }
  });

  it("does not flag drift once a cut has legitimately removed paper", () => {
    const cutPlane = {
      ...dart,
      steps: [
        {
          id: "test.cut",
          action: {
            type: "cut" as const,
            line: { a: [0, -1] as const, b: [0, 1] as const },
            keep: "left" as const,
          },
          hasWhy: false,
        },
      ],
    };
    const d = stepDiagnostics(cutPlane, 0);
    expect(d.totalArea).toBeLessThan(d.sheetArea);
    expect(d.areaDrifted).toBe(false);
  });

  it("reports a real, signed drift figure once a cut has removed paper", () => {
    const cutPlane = {
      ...dart,
      steps: [
        {
          id: "test.cut",
          action: {
            type: "cut" as const,
            line: { a: [0, -1] as const, b: [0, 1] as const },
            keep: "left" as const,
          },
          hasWhy: false,
        },
      ],
    };
    const d = stepDiagnostics(cutPlane, 0);
    expect(d.areaDrift).toBeLessThan(0);
    expect(d.areaDrift).toBeCloseTo(d.totalArea - d.sheetArea, 6);
  });
});

describe("hasAreaDrift", () => {
  it("stays quiet inside the tolerance", () => {
    expect(hasAreaDrift(1000, 1000, false)).toBe(false);
    expect(hasAreaDrift(1000 + 1000 * AREA_TOLERANCE, 1000, false)).toBe(false);
  });

  it("fires once paper is lost or gained beyond the tolerance", () => {
    expect(hasAreaDrift(999, 1000, false)).toBe(true);
    expect(hasAreaDrift(1001, 1000, false)).toBe(true);
  });

  it("stays quiet when a cut explains the difference", () => {
    expect(hasAreaDrift(500, 1000, true)).toBe(false);
  });
});

describe("issuesByStep", () => {
  it("is empty for a clean sequence", () => {
    expect(validateSequence(dart)).toEqual([]);
    expect(issuesByStep([]).size).toBe(0);
  });

  it("buckets multiple issues under one step index", () => {
    const grouped = issuesByStep([
      { stepIndex: 2, stepId: "a", code: "layer-overlap", message: "one" },
      { stepIndex: 2, stepId: "a", code: "degenerate-facet", message: "two" },
      { stepIndex: 5, stepId: "b", code: "crease-misses-silhouette", message: "three" },
    ]);
    expect(grouped.get(2)).toHaveLength(2);
    expect(grouped.get(5)).toHaveLength(1);
    expect(grouped.get(0)).toBeUndefined();
  });
});

describe("describeAction", () => {
  it("summarises every action kind", () => {
    expect(describeAction(dart.steps[0]!.action)).toBe(
      "fold right / 180 deg valley / layers all",
    );
    expect(describeAction(dart.steps[1]!.action)).toBe("unfold to dart.step-01");
    expect(describeAction(dart.steps[8]!.action)).toBe("flip over");
    expect(describeAction(dart.steps[9]!.action)).toBe("rotate 180 deg");
    // Read the angle off the step: this is a test of the formatter, and pinning
    // the Dart's wing angle here only makes a content change look like a bug.
    const wing = dart.steps[10]!.action;
    if (wing.type !== "fold") throw new Error("step 11 should be the near wing fold");
    expect(describeAction(wing)).toBe(
      `fold left / ${wing.angle} deg mountain / layers top`,
    );
    expect(
      describeAction({ type: "cut", line: { a: [0, 0], b: [0, 1] }, keep: "right" }),
    ).toBe("cut, keep right");
  });
});

describe("formatting", () => {
  it("renders millimetres at authoring precision", () => {
    expect(mm(148.5)).toBe("148.5");
    expect(mm(-0.04)).toBe("-0.0");
  });

  it("renders a vector as an authorable coordinate pair", () => {
    expect(formatVec([0, 148.5])).toBe("(0.0, 148.5)");
    expect(formatVec([1 / 3, 2 / 3], 3)).toBe("(0.333, 0.667)");
  });
});
