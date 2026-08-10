import { describe, expect, it } from "vitest";
import { applyStep, facetInTable } from "@/engine/core/fold";
import { computeFoldState, computeStepDelta, totalArea, validateSequence } from "@/engine/core/state";
import { freshSheet, LAYER_THICKNESS, PAPER_SIZES } from "@/engine/core/paper";
import { area } from "@/engine/core/polygon";
import { isoDet } from "@/engine/core/iso2";
import { posesForState, poseAtProgress, transformPoint } from "@/engine/core/pose";
import { renderStateToSvg } from "@/engine/core/svgRender";
import type { FoldState, FoldStep, Line2 } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { dart } from "@/content/planes/dart";

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

  it("decides where the flap lands by direction and how it travels by side", () => {
    // These two signs used to be one sign, and that is what put 22 of the
    // catalogue's 77 steps under the table. Where the flap LANDS is
    // `direction`'s to decide. Which way it TRAVELS to get there is `side`'s,
    // because rotating by +theta lifts the side with positive
    // cross(creaseDir, p - a), and the table is opaque: paper under it does not
    // look wrong, it disappears.
    const sweep = (side: "left" | "right", direction: "valley" | "mountain") =>
      computeStepDelta(
        plan([step("s.step-01", { type: "fold", crease: V_CENTER, side, angle: 180, direction })]),
        0,
      )!.angleDeg;

    expect(sweep("left", "valley")).toBe(180);
    expect(sweep("left", "mountain")).toBe(180);
    expect(sweep("right", "valley")).toBe(-180);
    expect(sweep("right", "mountain")).toBe(-180);
  });

  it("keeps a partial fold's sign for its direction, because that sign is the V", () => {
    // A 30-degree valley on the right half stores +30, even though a flat fold
    // on that side sweeps -180. Flipping this would invert every wing in the
    // catalogue, so the two signs must stay separate all the way down.
    const partial = run([
      step("p.step-01", { type: "fold", crease: V_CENTER, side: "right", angle: 30, direction: "valley" }),
    ]);
    const bent = partial.facets.filter((f) => f.bend.length > 0);
    expect(bent.length).toBeGreaterThan(0);
    for (const f of bent) expect(f.bend[0]!.angleDeg).toBe(30);
  });
});

describe("9b. no frame of a step goes under the table", () => {
  // The defect this pins was invisible to every other test in the file, because
  // every other test looks only at t=0 and t=1 and the paper went below the
  // table strictly between them. Measured across the real catalogue, 49 of 77
  // steps swept paper as deep as -105mm through a floor mesh at z=-1.5, so it
  // did not look wrong, it disappeared.
  const lowestZ = (delta: ReturnType<typeof computeStepDelta>, t: number): number => {
    const poses = poseAtProgress(delta!, t);
    let z = Infinity;
    for (const facet of delta!.startFacets) {
      const pose = poses.get(facet.id);
      if (!pose) continue;
      for (const p of facet.polygon) z = Math.min(z, transformPoint(pose, p)[2]);
    }
    return z;
  };

  it("never dips below the lower of the step's own two endpoints", () => {
    for (let n = 0; n < dart.steps.length; n += 1) {
      const delta = computeStepDelta(dart, n);
      if (!delta) continue;
      const floor = Math.min(lowestZ(delta, 0), lowestZ(delta, 1));
      // The only slack is one layer of paper: the rotation arc and the linear
      // layer lerp are different curves discretising the same quantum.
      for (let i = 1; i < 32; i += 1) {
        const t = i / 32;
        expect(lowestZ(delta, t), `${dart.steps[n]?.id} at t=${t.toFixed(3)}`).toBeGreaterThan(
          floor - LAYER_THICKNESS,
        );
      }
    }
  });

  it("lifts the model off the table to turn it over, by its own reach", () => {
    // A4 folded left-onto-right occupies x in [0,105] and the flip turns about
    // x = 0, so the lift is 105mm plus the stack. Derived, never authored: no
    // plane carries this number and none may.
    const half = plan([
      step("f.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
      step("f.step-02", { type: "flip" }),
    ]);
    const delta = computeStepDelta(half, 1)!;
    expect(delta.liftMm).toBeGreaterThan(105);
    expect(delta.liftMm).toBeLessThan(107);
    expect(lowestZ(delta, 0.5)).toBeGreaterThan(-1e-6);
  });

  it("puts the lift away again at both ends, exactly", () => {
    // "Close enough" is not available: the renderer snaps to the settled poses
    // at t=1 on the strength of this, so any residue is a visible jump.
    const half = plan([
      step("f.step-01", { type: "fold", crease: V_CENTER, side: "left", angle: 180, direction: "valley" }),
      step("f.step-02", { type: "flip" }),
    ]);
    const delta = computeStepDelta(half, 1)!;
    const settled = posesForState(computeFoldState(half, 1));
    for (const [id, pose] of poseAtProgress(delta, 1)) {
      const want = settled.get(id)!;
      for (let i = 0; i < 16; i += 1) expect(near(pose[i]!, want[i]!, 1e-9)).toBe(true);
    }
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
      startFacets: prev.facets,
      movingFacetIds: [0],
      axis: { origin: [0, 0, 0] as const, dir: [0, 1, 0] as const },
      angleDeg: 180,
      kind: "fold" as const,
      layerChanges: new Map<number, { from: number; to: number }>(),
    };
    const at0 = poseAtProgress(delta, 0);
    const base = posesForState(prev);
    for (const [id, m] of at0) {
      const b = base.get(id)!;
      for (let i = 0; i < 16; i++) expect(near(m[i]!, b[i]!, 1e-9)).toBe(true);
    }
  });

  it("keeps facets rigid mid-fold", () => {
    const prev = computeFoldState(structure, -1);
    const delta = {
      startFacets: prev.facets,
      movingFacetIds: [0],
      axis: { origin: [0, 0, 0] as const, dir: [0, 1, 0] as const },
      angleDeg: 180,
      kind: "fold" as const,
      layerChanges: new Map<number, { from: number; to: number }>(),
    };
    const mid = poseAtProgress(delta, 0.5);
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

  /**
   * The catalogue used to look like a two-tone paper cut-out, and this is why:
   * every facet took one of exactly TWO flat fills, white if its front face was
   * up and a beige if not. A finished plane presents a dozen panels at a dozen
   * angles and they all came out the same value, so the only thing separating
   * them was a hairline stroke - a diagram of a fold rather than a picture of
   * one.
   *
   * Counting distinct fills is a crude measure and deliberately so: it cannot
   * be satisfied by anything except actually varying the fill with the geometry.
   */
  it("shades a finished plane by the light, not with two flat fills", () => {
    const finished = computeFoldState(dart, dart.steps.length - 1);
    const fills = new Set(
      [...renderStateToSvg(finished, { rest: true }).matchAll(/fill="(#[0-9a-f]{6})"/gi)].map(
        (m) => m[1]!.toLowerCase(),
      ),
    );
    expect(fills.size).toBeGreaterThan(4);

    // And the values stay in paper's range. Paper in a lit room occupies a
    // narrower band than intuition suggests; anything darker than this reads as
    // grey card, and it is what the first attempt at the lighting produced.
    const lightness = [...fills].map((hex) => parseInt(hex.slice(1, 3), 16) / 255);
    expect(Math.max(...lightness)).toBeGreaterThan(0.9);
    expect(Math.min(...lightness)).toBeGreaterThan(0.6);
  });

  it("grounds a display render on a shadow it derives from the aircraft", () => {
    const finished = computeFoldState(dart, dart.steps.length - 1);
    const plain = renderStateToSvg(finished, { rest: true });
    const shown = renderStateToSvg(finished, { display: true });

    // The shadow belongs to the picture, not to the card's CSS: a fixed ellipse
    // behind the SVG cannot know where a given aircraft's keel is.
    expect(plain).not.toContain("radialGradient");
    expect(shown).toContain("radialGradient");
    expect(shown).toContain("<circle");

    // `display` implies `rest`, so it never draws a plane lying on its side.
    expect(renderStateToSvg(finished, { display: true, rest: false })).toContain("radialGradient");

    // The frame grows to hold the ground the aircraft floats over, rather than
    // cropping its own shadow away.
    const viewBox = (svg: string) => svg.match(/viewBox="([^"]+)"/)![1]!.split(" ").map(Number);
    expect(viewBox(shown)[3]!).toBeGreaterThan(viewBox(plain)[3]!);
  });
});

describe("area helper", () => {
  it("measures the A4 sheet", () => {
    expect(near(area(freshSheet("a4").facets[0]!.polygon), 210 * 297, 1e-6)).toBe(true);
  });
});

/**
 * Three defects the fold editor exposed, pinned so they cannot come back.
 * All three are invisible in the product but decide real geometry.
 */
describe("stack splitting is decided by paper, not by debris", () => {
  /**
   * Two equal sheets stacked, plus two sub-millimetre wedges on top. Everything
   * sits clear of the crease so nothing is split and facet ids survive into the
   * delta - the point here is selection, not splitting.
   */
  function stackWithDebris(): FoldState {
    const sheet = [[10, -50], [110, -50], [110, 50], [10, 50]] as const;
    const wedge = [[10, -50], [11, -50], [11, -49]] as const;
    const flat = [1, 0, 0, 0, 1, 0] as const;
    return {
      facets: [
        { id: 1, polygon: sheet, flatMap: flat, layer: 0, bend: [] },
        { id: 2, polygon: sheet, flatMap: flat, layer: 1, bend: [] },
        { id: 3, polygon: wedge, flatMap: flat, layer: 2, bend: [] },
        { id: 4, polygon: wedge, flatMap: flat, layer: 3, bend: [] },
      ],
      creaseMarks: [],
      maxLayer: 3,
    };
  }

  /** The stack lies to the "right" of an upward crease at x = 0. */
  const openWing = (direction: "valley" | "mountain", layers: "top" | "bottom"): FoldStep =>
    step("w.step-01", {
      type: "fold",
      crease: { a: [0, -200], b: [0, 200] },
      side: "right",
      angle: 30,
      direction,
      layers,
    });

  const movedBy = (layers: "top" | "bottom") =>
    applyStep(
      stackWithDebris(),
      openWing(layers === "top" ? "mountain" : "valley", layers),
      100,
      new Map(),
    ).delta?.movingFacetIds ?? [];

  it("puts one full sheet in each half, ignoring the wedges", () => {
    // Counting layers would split at index 2 and hand BOTH sheets to "bottom".
    expect(movedBy("top")).toContain(2);
    expect(movedBy("top")).not.toContain(1);
    expect(movedBy("bottom")).toContain(1);
    expect(movedBy("bottom")).not.toContain(2);
  });

  it("moves the whole stack across the two halves and never twice", () => {
    const top = movedBy("top");
    const bottom = movedBy("bottom");
    expect(top.filter((id) => bottom.includes(id))).toEqual([]);
    expect([...top, ...bottom].sort()).toEqual([1, 2, 3, 4]);
  });

  it("gives the Dart's two wings the same amount of paper", () => {
    // Measured on the state AFTER each step: the step splits facets at the
    // crease before selecting movers, so the delta's ids do not exist yet in
    // the state before it. Folding is an isometry, so areas carry across.
    const paperMoved = (n: number): number => {
      const after = computeFoldState(dart, n);
      const byId = new Map(after.facets.map((f) => [f.id, f]));
      const ids = computeStepDelta(dart, n)?.movingFacetIds ?? [];
      expect(ids.every((id) => byId.has(id))).toBe(true);
      return ids.reduce((sum, id) => sum + area(byId.get(id)!.polygon), 0);
    };
    const nearWing = paperMoved(10);
    const farWing = paperMoved(11);
    expect(nearWing).toBeGreaterThan(0);
    expect(Math.abs(nearWing - farWing) / nearWing).toBeLessThan(1e-9);
  });

  it("leaves both of the Dart's wings bent at the end, and nothing else", () => {
    const bent = computeFoldState(dart, 11).facets.filter((f) => f.bend.length > 0);
    const bentArea = bent.reduce((sum, f) => sum + area(f.polygon), 0);
    const wing = bentArea / 2;
    // Mirrored halves: each layer that bends has a partner of equal area.
    const sizes = bent.map((f) => +area(f.polygon).toFixed(6)).sort();
    expect(sizes).toEqual(sizes.slice().reverse().sort());
    expect(bent.length % 2).toBe(0);
    expect(wing).toBeGreaterThan(0);
  });
});

describe("replay cache", () => {
  it("does not serve one paper size's state for another", () => {
    // Same steps array, different sheet: keying the memo on steps alone handed
    // the second caller the first caller's paper.
    const a4 = { ...dart, paper: { ...dart.paper, format: "letter-a4" as const } };
    const square = { ...dart, paper: { ...dart.paper, format: "square" as const } };
    expect(near(totalArea(computeFoldState(a4, -1)), 210 * 297)).toBe(true);
    expect(near(totalArea(computeFoldState(square, -1)), 210 * 210)).toBe(true);
    expect(near(totalArea(computeFoldState(a4, -1)), 210 * 297)).toBe(true);
  });
});

describe("the Dart's nose folds land exactly on the centre line", () => {
  it("leaves no wedge behind before the wings are opened", () => {
    // Rounding the step 5/6 crease endpoint to a tidy -105 missed the true
    // bisector by 0.008 mm and left a 0.23 mm^2 wedge on every layer it crossed.
    for (let n = 0; n <= 9; n++) {
      const crumbs = computeFoldState(dart, n).facets.filter((f) => area(f.polygon) < 1);
      expect(crumbs, `step ${n + 1} left ${crumbs.length} wedges`).toEqual([]);
    }
  });
});
