/**
 * The fold editor's table-space plan geometry.
 *
 * These are the parts a human reads coordinates off, so they are pinned exactly:
 * a crease drawn one pixel out is a fold sequence authored one millimetre out.
 */
import { describe, expect, it } from "vitest";
import type { FoldAction, Line2, Vec2 } from "@/engine/core/types";
import { computeFoldState } from "@/engine/core/state";
import { dart } from "@/content/planes/dart";
import {
  clipLineToView,
  creaseOverlay,
  describeLayers,
  facetRole,
  gridLines,
  planUnit,
  planView,
  planViewBox,
  pointerToTable,
  pointsAttr,
  polygonSide,
  tablePlan,
  toScreen,
  type PlanView,
} from "@/dev/fold-editor/plan";

const VIEW: PlanView = { minX: -100, minY: -100, maxX: 100, maxY: 100 };

describe("tablePlan", () => {
  it("maps the fresh sheet to its table-space rectangle", () => {
    const plan = tablePlan(computeFoldState(dart, -1));
    expect(plan).toHaveLength(1);
    const facet = plan[0]!;
    expect(facet.facetId).toBe(0);
    expect(facet.layer).toBe(0);
    expect(facet.faceUp).toBe(true);
    expect(facet.bent).toBe(false);
    // A4 portrait, origin at the centre.
    expect(facet.points).toEqual([
      [-105, -148.5],
      [105, -148.5],
      [105, 148.5],
      [-105, 148.5],
    ]);
  });

  it("reports face-down parity after a valley fold reflects a facet", () => {
    const plan = tablePlan(computeFoldState(dart, 0));
    expect(plan.some((p) => !p.faceUp)).toBe(true);
    expect(plan.every((p) => !p.bent)).toBe(true);
  });

  it("reports bent facets once a partial fold has run", () => {
    const plan = tablePlan(computeFoldState(dart, 10));
    expect(plan.some((p) => p.bent)).toBe(true);
  });

  it("paints bottom layer first", () => {
    const plan = tablePlan(computeFoldState(dart, 7));
    const layers = plan.map((p) => p.layer);
    expect([...layers].sort((a, b) => a - b)).toEqual(layers);
  });
});

describe("planView", () => {
  it("unions every point set and pads by the longer side", () => {
    const view = planView([
      [
        [-10, -20],
        [10, 20],
      ],
      [[40, 0]],
    ]);
    // span x = 50, span y = 40 -> pad = 3
    expect(view.minX).toBeCloseTo(-13, 9);
    expect(view.maxX).toBeCloseTo(43, 9);
    expect(view.minY).toBeCloseTo(-23, 9);
    expect(view.maxY).toBeCloseTo(23, 9);
  });

  it("never collapses to a zero-size view", () => {
    const view = planView([[[5, 5]]]);
    expect(view.maxX - view.minX).toBeGreaterThan(0);
    expect(view.maxY - view.minY).toBeGreaterThan(0);
  });

  it("survives an empty state", () => {
    const view = planView([]);
    expect(Number.isFinite(view.minX)).toBe(true);
    expect(view.maxY).toBeGreaterThan(view.minY);
  });

  it("emits a viewBox with y flipped so the sheet reads nose-up", () => {
    expect(planViewBox(VIEW)).toBe("-100 -100 200 200");
    expect(planViewBox({ minX: 0, minY: 0, maxX: 10, maxY: 4 })).toBe("0 -4 10 4");
  });

  it("scales the pen unit with the view", () => {
    expect(planUnit(VIEW)).toBeCloseTo(2, 9);
    expect(planUnit({ minX: 0, minY: 0, maxX: 50, maxY: 10 })).toBeCloseTo(0.5, 9);
  });
});

describe("screen mapping", () => {
  it("flips y and nothing else", () => {
    expect(toScreen([12, -34])).toEqual([12, 34]);
  });

  it("writes polygon points with y flipped", () => {
    expect(pointsAttr([[1, 2], [3, -4]] as Vec2[])).toBe("1.000,-2.000 3.000,4.000");
  });
});

describe("pointerToTable", () => {
  it("maps the centre of a square box to the centre of the view", () => {
    expect(pointerToTable(VIEW, { width: 400, height: 400 }, 200, 200)).toEqual([0, 0]);
  });

  it("maps corners to the view corners", () => {
    const topLeft = pointerToTable(VIEW, { width: 400, height: 400 }, 0, 0);
    expect(topLeft[0]).toBeCloseTo(-100, 9);
    expect(topLeft[1]).toBeCloseTo(100, 9);
    const bottomRight = pointerToTable(VIEW, { width: 400, height: 400 }, 400, 400);
    expect(bottomRight[0]).toBeCloseTo(100, 9);
    expect(bottomRight[1]).toBeCloseTo(-100, 9);
  });

  it("accounts for xMidYMid letterboxing on a wide box", () => {
    // 800x400 box, square view: scale 2, 200px of letterbox on each side.
    const p = pointerToTable(VIEW, { width: 800, height: 400 }, 200, 200);
    expect(p[0]).toBeCloseTo(-100, 9);
    expect(p[1]).toBeCloseTo(0, 9);
    const centre = pointerToTable(VIEW, { width: 800, height: 400 }, 400, 200);
    expect(centre[0]).toBeCloseTo(0, 9);
    expect(centre[1]).toBeCloseTo(0, 9);
  });

  it("accounts for letterboxing on a tall box", () => {
    const p = pointerToTable(VIEW, { width: 400, height: 800 }, 200, 200);
    expect(p[0]).toBeCloseTo(0, 9);
    expect(p[1]).toBeCloseTo(100, 9);
  });

  it("is inert for a zero-size box", () => {
    expect(pointerToTable(VIEW, { width: 0, height: 0 }, 10, 10)).toEqual([-100, 100]);
  });
});

describe("clipLineToView", () => {
  it("extends a short crease across the whole view", () => {
    const span = clipLineToView({ a: [0, -1], b: [0, 1] }, VIEW);
    expect(span).not.toBeNull();
    expect(span![0]).toEqual([0, -100]);
    expect(span![1]).toEqual([0, 100]);
  });

  it("clips a diagonal to the view corners", () => {
    const span = clipLineToView({ a: [0, 0], b: [1, 1] }, VIEW)!;
    expect(span[0][0]).toBeCloseTo(-100, 9);
    expect(span[0][1]).toBeCloseTo(-100, 9);
    expect(span[1][0]).toBeCloseTo(100, 9);
    expect(span[1][1]).toBeCloseTo(100, 9);
  });

  it("returns null when the line misses the view", () => {
    expect(clipLineToView({ a: [500, -10], b: [500, 10] }, VIEW)).toBeNull();
  });

  it("returns null for a degenerate line", () => {
    expect(clipLineToView({ a: [1, 1], b: [1, 1] }, VIEW)).toBeNull();
  });
});

describe("polygonSide", () => {
  const vertical: Line2 = { a: [0, -1], b: [0, 1] };

  it("matches the engine's left convention: cross(b-a, p-a) > 0", () => {
    // Direction is +y, so a point at -x is to the left.
    expect(polygonSide([[-5, 0]], vertical)).toBe(1);
    expect(polygonSide([[5, 0]], vertical)).toBe(-1);
  });

  it("reports a straddling polygon as 0", () => {
    expect(
      polygonSide(
        [
          [-5, -5],
          [5, -5],
          [5, 5],
        ],
        vertical,
      ),
    ).toBe(0);
  });

  it("falls back to the centroid when every vertex is on the line", () => {
    expect(
      polygonSide(
        [
          [0, -5],
          [0, 5],
        ],
        vertical,
      ),
    ).toBe(0);
  });
});

describe("creaseOverlay", () => {
  it("is null for actions without a crease", () => {
    expect(creaseOverlay({ type: "flip" }, VIEW)).toBeNull();
    expect(creaseOverlay({ type: "rotate", degrees: 90 }, VIEW)).toBeNull();
    expect(creaseOverlay({ type: "unfold", toStep: "x" }, VIEW)).toBeNull();
  });

  it("carries the fold's authored side, angle and direction", () => {
    const action = dart.steps[0]!.action;
    const overlay = creaseOverlay(action, VIEW)!;
    expect(overlay.kind).toBe("fold");
    expect(overlay.movingSide).toBe("right");
    expect(overlay.angle).toBe(180);
    expect(overlay.direction).toBe("valley");
    expect(overlay.layers).toBe("all");
  });

  it("shades the half-plane the fold actually moves", () => {
    // Crease along +y through the origin; "right" is +x.
    const action: FoldAction = {
      type: "fold",
      crease: { a: [0, -1], b: [0, 1] },
      side: "right",
      angle: 180,
      direction: "valley",
    };
    const overlay = creaseOverlay(action, VIEW)!;
    expect(overlay.movingRegion.length).toBeGreaterThan(2);
    expect(overlay.movingRegion.every((p) => p[0] >= 0)).toBe(true);
  });

  it("treats a cut's DISCARDED side as the moving side", () => {
    const action: FoldAction = {
      type: "cut",
      line: { a: [0, -1], b: [0, 1] },
      keep: "left",
    };
    const overlay = creaseOverlay(action, VIEW)!;
    expect(overlay.kind).toBe("cut");
    expect(overlay.movingSide).toBe("right");
    expect(overlay.movingRegion.every((p) => p[0] >= 0)).toBe(true);
  });

  it("still reports the authored line when it misses the view", () => {
    const action: FoldAction = {
      type: "fold",
      crease: { a: [500, -1], b: [500, 1] },
      side: "left",
      angle: 180,
      direction: "valley",
    };
    const overlay = creaseOverlay(action, VIEW)!;
    expect(overlay.span).toBeNull();
    expect(overlay.line.a).toEqual([500, -1]);
  });
});

describe("facetRole", () => {
  const action: FoldAction = {
    type: "fold",
    crease: { a: [0, -1], b: [0, 1] },
    side: "right",
    angle: 180,
    direction: "valley",
  };
  const overlay = creaseOverlay(action, VIEW)!;

  it("calls the folded side moving", () => {
    expect(
      facetRole(
        [
          [10, 0],
          [20, 0],
          [20, 10],
        ],
        overlay,
      ),
    ).toBe("moving");
  });

  it("calls the other side stationary", () => {
    expect(
      facetRole(
        [
          [-10, 0],
          [-20, 0],
          [-20, 10],
        ],
        overlay,
      ),
    ).toBe("stationary");
  });

  it("calls a straddling facet split", () => {
    expect(
      facetRole(
        [
          [-10, 0],
          [10, 0],
          [10, 10],
        ],
        overlay,
      ),
    ).toBe("split");
  });

  it("agrees with the engine about the Dart's first fold", () => {
    // Step 1 folds the right half onto the left; every facet of the fresh sheet
    // straddles the centre line, so it is a split.
    const overlay1 = creaseOverlay(dart.steps[0]!.action, VIEW)!;
    const fresh = tablePlan(computeFoldState(dart, -1));
    expect(facetRole(fresh[0]!.points, overlay1)).toBe("split");
  });
});

describe("gridLines", () => {
  it("covers the view at the requested spacing", () => {
    const grid = gridLines({ minX: -60, minY: -10, maxX: 60, maxY: 10 }, 50);
    expect(grid.xs).toEqual([-50, 0, 50]);
    expect(grid.ys).toEqual([0]);
  });

  it("returns nothing for a non-positive spacing", () => {
    expect(gridLines(VIEW, 0)).toEqual({ xs: [], ys: [] });
  });
});

describe("describeLayers", () => {
  it("names every selector form", () => {
    expect(describeLayers(undefined)).toBe("all");
    expect(describeLayers("all")).toBe("all");
    expect(describeLayers("top")).toBe("top");
    expect(describeLayers([0, 2, 4])).toBe("[0,2,4]");
  });
});
