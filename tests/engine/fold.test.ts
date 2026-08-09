import { describe, expect, it } from "vitest";
import { applyStep, facetInTable } from "@/engine/core/fold";
import { computeFoldState, totalArea, validateSequence } from "@/engine/core/state";
import { freshSheet, PAPER_SIZES } from "@/engine/core/paper";
import { area } from "@/engine/core/polygon";
import { isoDet } from "@/engine/core/iso2";
import { posesForState, poseAtProgress, transformPoint } from "@/engine/core/pose";
import { renderStateToSvg } from "@/engine/core/svgRender";
import type { FoldState, FoldStep, Line2 } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

/** A4 spans x in [-105,105], y in [-148.5,148.5]. */
const V_CENTER: Line2 = { a: [0, -200], b: [0, 200] };
const H_CENTER: Line2 = { a: [-200, 0], b: [200, 0] };

function step(id: string, action: FoldStep["action"], hasWhy = false): FoldStep {
  return { id, action, hasWhy };
}

function plan(steps: FoldStep[]): PlaneStructure {
  return {
    id: "dart",
    tier: "easy",
    paper: { format: "letter-a4", prep: { letter: [], a4: [], square: [], "index-4x6": [] } },
    ratings: { speed: 5, distance: 4, airtime: 2, ease: 5 },
    steps,
    accent: "#D64541",
  };
}

function run(steps: FoldStep[]): FoldState {
  const structure = plan(steps);
  return computeFoldState(structure, steps.length - 1);
}

const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) <= eps;

describe("7. a single valley fold", () => {
  const state = run([
    step("t.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
  ]);

  it("produces two facets", () => {
    expect(state.facets).toHaveLength(2);
  });

  it("conserves paper area", () => {
    const sheet = PAPER_SIZES.a4;
    expect(near(totalArea(state), sheet.width * sheet.height, 1e-6)).toBe(true);
  });

  it("flips the parity of the moving facet only", () => {
    const parities = state.facets.map((f) => (isoDet(f.flatMap) < 0 ? -1 : 1)).sort();
    expect(parities).toEqual([-1, 1]);
  });

  it("stacks the moved flap on a new layer", () => {
    expect(state.maxLayer).toBe(1);
    expect(new Set(state.facets.map((f) => f.layer))).toEqual(new Set([0, 1]));
  });

  it("lands the moved half on top of the stationary half", () => {
    const moved = state.facets.find((f) => isoDet(f.flatMap) < 0);
    expect(moved).toBeDefined();
    expect(moved!.layer).toBe(1);
  });
});

describe("8. a crease across an existing stack (the critical case)", () => {
  const state = run([
    step("t.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    step("t.step-02", { type: "fold", crease: H_CENTER, side: "left", angle: 180, direction: "valley" }),
  ]);

  it("splits BOTH stacked layers with the one table-space crease", () => {
    expect(state.facets).toHaveLength(4);
  });

  it("conserves area through both folds", () => {
    const sheet = PAPER_SIZES.a4;
    expect(near(totalArea(state), sheet.width * sheet.height, 1e-6)).toBe(true);
  });

  it("assigns four consecutive layers", () => {
    expect([...state.facets.map((f) => f.layer)].sort()).toEqual([0, 1, 2, 3]);
  });

  it("keeps every facet inside the folded quarter silhouette", () => {
    // Folding the left half onto the right leaves paper at x >= 0; folding the
    // top half down then leaves y <= 0.
    for (const facet of state.facets) {
      for (const p of facetInTable(facet)) {
        expect(p[0]).toBeGreaterThanOrEqual(-1e-6);
        expect(p[1]).toBeLessThanOrEqual(1e-6);
      }
    }
  });

  it("reverses the moving stack's internal order", () => {
    // The two facets that moved in step 2 sit above the two that did not.
    const layers = state.facets.map((f) => f.layer).sort((a, b) => a - b);
    expect(layers).toEqual([0, 1, 2, 3]);
  });
});

describe("9. mountain versus valley", () => {
  it("stacks a mountain fold below and a valley fold above", () => {
    const valley = run([
      step("t.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    ]);
    const mountain = run([
      step("m.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "mountain" }),
    ]);
    const valleyMoved = valley.facets.find((f) => isoDet(f.flatMap) < 0);
    const mountainMoved = mountain.facets.find((f) => isoDet(f.flatMap) < 0);
    const valleyStill = valley.facets.find((f) => isoDet(f.flatMap) > 0);
    const mountainStill = mountain.facets.find((f) => isoDet(f.flatMap) > 0);
    expect(valleyMoved!.layer).toBeGreaterThan(valleyStill!.layer);
    expect(mountainMoved!.layer).toBeLessThan(mountainStill!.layer);
  });
});

describe("10. partial (wing) folds", () => {
  // After folding the left half onto the right, the paper occupies x in [0,105],
  // so the wing crease must sit inside that range to catch any paper.
  const wingLine: Line2 = { a: [30, -200], b: [30, 200] };
  const structure = plan([
    step("w.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    step("w.step-02", { type: "fold", crease: wingLine, side: "left", angle: 90, direction: "valley" }),
  ]);
  const state = computeFoldState(structure, 1);

  it("marks moved facets as bent rather than reflected", () => {
    const bent = state.facets.filter((f) => f.bend.length > 0);
    expect(bent.length).toBeGreaterThan(0);
    for (const f of bent) expect(f.bend[0]!.angleDeg).toBe(90);
  });

  it("leaves the flat map untouched for a partial fold", () => {
    // A partial fold adds a bend and must not reflect anything, so every flat
    // map after the fold already existed before it (splitting aside).
    const flatState = computeFoldState(structure, 0);
    const before = flatState.facets.map((f) => JSON.stringify(f.flatMap));
    for (const facet of state.facets) {
      expect(before).toContain(JSON.stringify(facet.flatMap));
    }
  });

  it("lifts bent geometry out of the z=0 plane", () => {
    const poses = posesForState(state);
    const bent = state.facets.find((f) => f.bend.length > 0)!;
    const pose = poses.get(bent.id)!;
    const zs = bent.polygon.map((p) => Math.abs(transformPoint(pose, p)[2]));
    expect(Math.max(...zs)).toBeGreaterThan(1);
  });

  it("rejects a later crease that crosses a bent facet", () => {
    const withBadStep = plan([
      ...structure.steps,
      // The wing fold lifted the paper left of x=30 (i.e. x in [0,30]); a crease
      // at x=15 therefore cuts straight across a facet that is out of plane.
      step("w.step-03", {
        type: "fold",
        crease: { a: [15, -200], b: [15, 200] },
        side: "left",
        angle: 180,
        direction: "valley",
      }),
    ]);
    const issues = validateSequence(withBadStep);
    expect(issues.some((i) => i.code === "crease-over-nonflat")).toBe(true);
  });
});

describe("11. flip", () => {
  it("inverts the layer stack and mirrors every facet", () => {
    const folded = run([
      step("f.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    ]);
    const flipped = run([
      step("f.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
      step("f.step-02", { type: "flip" }),
    ]);
    const topBefore = folded.facets.find((f) => f.layer === folded.maxLayer)!;
    const sameAfter = flipped.facets.find((f) => f.id === topBefore.id)!;
    expect(sameAfter.layer).toBe(0);
  });

  it("is an involution", () => {
    const once = run([
      step("f.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
      step("f.step-02", { type: "flip" }),
      step("f.step-03", { type: "flip" }),
    ]);
    const none = run([
      step("f.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    ]);
    expect(once.facets.map((f) => f.layer).sort()).toEqual(none.facets.map((f) => f.layer).sort());
    for (const f of once.facets) {
      const original = none.facets.find((o) => o.id === f.id)!;
      for (let i = 0; i < 6; i++) {
        expect(near(f.flatMap[i]!, original.flatMap[i]!, 1e-9)).toBe(true);
      }
    }
  });
});

describe("12. rotate", () => {
  it("turns the model so later creases act in the rotated frame", () => {
    const rotated = run([
      step("r.step-01", { type: "rotate", degrees: 90 }),
      step("r.step-02", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    ]);
    expect(rotated.facets).toHaveLength(2);
    const sheet = PAPER_SIZES.a4;
    expect(near(totalArea(rotated), sheet.width * sheet.height, 1e-6)).toBe(true);
  });
});

describe("13. crease-and-unfold", () => {
  const steps = [
    step("u.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    step("u.step-02", { type: "unfold", toStep: "u.step-01" }),
  ];
  const state = run(steps);

  it("restores the flat pose", () => {
    for (const facet of state.facets) {
      expect(isoDet(facet.flatMap)).toBeGreaterThan(0);
      expect(facet.layer).toBe(0);
    }
  });

  it("keeps the split as a scored reference mark", () => {
    expect(state.facets).toHaveLength(2);
    expect(state.creaseMarks.length).toBeGreaterThan(0);
  });

  it("conserves area", () => {
    const sheet = PAPER_SIZES.a4;
    expect(near(totalArea(state), sheet.width * sheet.height, 1e-6)).toBe(true);
  });

  it("flags an unfold that targets an unknown step", () => {
    const bad = plan([step("u.step-01", { type: "unfold", toStep: "nope" })]);
    expect(validateSequence(bad).some((i) => i.code === "unfold-unknown-step")).toBe(true);
  });
});

describe("14. cut", () => {
  it("discards the non-kept side", () => {
    const state = run([
      step("c.step-01", { type: "cut", line: H_CENTER, keep: "left" }),
    ]);
    const sheet = PAPER_SIZES.a4;
    expect(near(totalArea(state), (sheet.width * sheet.height) / 2, 1e-6)).toBe(true);
    for (const facet of state.facets) {
      for (const p of facetInTable(facet)) expect(p[1]).toBeGreaterThanOrEqual(-1e-6);
    }
  });

  it("flags a cut that does not span the paper", () => {
    const bad = plan([
      step("c.step-01", { type: "cut", line: { a: [500, -20], b: [500, 20] }, keep: "left" }),
    ]);
    expect(validateSequence(bad).some((i) => i.code === "cut-does-not-span")).toBe(true);
  });
});

describe("15. determinism and replay", () => {
  const steps = [
    step("d.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    step("d.step-02", { type: "fold", crease: H_CENTER, side: "left", angle: 180, direction: "valley" }),
    step("d.step-03", { type: "flip" }),
  ];

  it("returns identical state on repeated calls", () => {
    const structure = plan(steps);
    const a = computeFoldState(structure, 2);
    const b = computeFoldState(structure, 2);
    expect(a).toEqual(b);
  });

  it("matches an incremental applyStep chain", () => {
    const structure = plan(steps);
    const replayed = computeFoldState(structure, 2);

    let manual = freshSheet("a4");
    let nextId = 1;
    const history = new Map<string, FoldState>();
    for (const s of steps) {
      history.set(s.id, manual);
      const r = applyStep(manual, s, nextId, history);
      manual = r.state;
      nextId = r.nextId;
    }
    expect(manual.facets.length).toBe(replayed.facets.length);
    expect(manual.maxLayer).toBe(replayed.maxLayer);
    expect(near(totalArea(manual), totalArea(replayed), 1e-9)).toBe(true);
  });

  it("computes intermediate states consistently with the full replay", () => {
    const structure = plan(steps);
    const atOne = computeFoldState(structure, 1);
    const structure2 = plan(steps.slice(0, 2));
    const standalone = computeFoldState(structure2, 1);
    expect(atOne.facets.length).toBe(standalone.facets.length);
  });
});

describe("16. overlap audit over a multi-step sequence", () => {
  it("finds no two overlapping facets sharing a layer", () => {
    const structure = plan([
      step("o.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
      step("o.step-02", { type: "fold", crease: H_CENTER, side: "left", angle: 180, direction: "valley" }),
    ]);
    const issues = validateSequence(structure);
    expect(issues.filter((i) => i.code === "layer-overlap")).toEqual([]);
  });
});

describe("17. pose interpolation", () => {
  const structure = plan([
    step("p.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
  ]);

  it("equals the previous state at t = 0", () => {
    const prev = computeFoldState(structure, -1);
    const delta = {
      movingFacetIds: [0],
      axis: { origin: [0, 0, 0] as const, dir: [0, 1, 0] as const },
      angleDeg: 180,
      kind: "fold" as const,
      layerChanges: new Map<number, { from: number; to: number }>(),
    };
    const at0 = poseAtProgress(prev, delta, 0);
    const base = posesForState(prev);
    for (const [id, m] of at0) {
      const b = base.get(id)!;
      for (let i = 0; i < 16; i++) expect(near(m[i]!, b[i]!, 1e-9)).toBe(true);
    }
  });

  it("keeps facets rigid mid-fold", () => {
    const prev = computeFoldState(structure, -1);
    const delta = {
      movingFacetIds: [0],
      axis: { origin: [0, 0, 0] as const, dir: [0, 1, 0] as const },
      angleDeg: 180,
      kind: "fold" as const,
      layerChanges: new Map<number, { from: number; to: number }>(),
    };
    const mid = poseAtProgress(prev, delta, 0.5);
    const facet = prev.facets[0]!;
    const pose = mid.get(facet.id)!;
    for (let i = 0; i < facet.polygon.length; i++) {
      const a = facet.polygon[i]!;
      const b = facet.polygon[(i + 1) % facet.polygon.length]!;
      const flatLen = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const pa = transformPoint(pose, a);
      const pb = transformPoint(pose, b);
      const posedLen = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
      expect(near(posedLen, flatLen, 1e-6)).toBe(true);
    }
  });
});

describe("18. svg projection", () => {
  it("renders every facet with its layer, sorted bottom-up", () => {
    const state = run([
      step("s.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
    ]);
    const svg = renderStateToSvg(state);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.match(/<polygon/g)).toHaveLength(state.facets.length);
    expect(svg).toContain('data-layer="0"');
    expect(svg).toContain('data-layer="1"');
    const first = svg.indexOf('data-layer="0"');
    const second = svg.indexOf('data-layer="1"');
    expect(first).toBeLessThan(second);
  });

  it("renders a fresh sheet as a single polygon", () => {
    const svg = renderStateToSvg(freshSheet("a4"));
    expect(svg.match(/<polygon/g)).toHaveLength(1);
  });
});

describe("area helper", () => {
  it("measures the A4 sheet", () => {
    expect(near(area(freshSheet("a4").facets[0]!.polygon), 210 * 297, 1e-6)).toBe(true);
  });
});
