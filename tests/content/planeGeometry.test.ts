/**
 * Geometric invariants of the AUTHORED planes.
 *
 * tests/integration/geometry.test.ts pins what the engine must do with any
 * sequence. This file pins what these six sequences must be, because a bounding
 * box that looks plane-shaped is a long way from a plane that can be folded. The
 * owner's physical fold test is deferred to launch, so every claim a content
 * author would otherwise make by eye is made here by measurement instead.
 */
import { describe, expect, it } from "vitest";
import { PLANES } from "@/content";
import { computeFoldState, computeStepDelta } from "@/engine/core/state";
import { applyStep, facetInTable } from "@/engine/core/fold";
import { freshSheet, PAPER_SIZES } from "@/engine/core/paper";
import { area, boundingBox } from "@/engine/core/polygon";
import { multiply, poseForFacet, transformPoint } from "@/engine/core/pose";
import { restFrame } from "@/engine/core/rest";
import type { FoldState, PaperFormat, Vec2 } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

/** Index of the first partial fold: everything before it is still flat paper. */
function firstPartialFold(plane: PlaneStructure): number {
  const i = plane.steps.findIndex((s) => s.action.type === "fold" && s.action.angle < 180);
  return i < 0 ? plane.steps.length : i;
}

function partialFoldSteps(plane: PlaneStructure) {
  return plane.steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step.action.type === "fold" && step.action.angle < 180);
}

/**
 * Paper moved by step n, measured in the state AFTER the step. A fold splits
 * before it moves, so in the state BEFORE it a mover id still resolves to its
 * unsplit parent and the first of a wing pair reads far too heavy.
 */
function paperMovedBy(plane: PlaneStructure, n: number): number {
  const after = computeFoldState(plane, n);
  const byId = new Map(after.facets.map((f) => [f.id, area(f.polygon)]));
  return (computeStepDelta(plane, n)?.movingFacetIds ?? []).reduce(
    (sum, id) => sum + (byId.get(id) ?? 0),
    0,
  );
}

function pointInPolygon(p: Vec2, poly: readonly Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a[1] > p[1] !== b[1] > p[1]) {
      const t = (p[1] - a[1]) / (b[1] - a[1]);
      if (p[0] < a[0] + t * (b[0] - a[0])) inside = !inside;
    }
  }
  return inside;
}

/** Average number of thicknesses covering the paper in a band of the model. */
function layersInBand(plane: PlaneStructure, from: number, to: number): number {
  const state = computeFoldState(plane, plane.steps.length - 1);
  const polys = state.facets.map(facetInTable);
  const box = boundingBox(polys);
  const height = box.max[1] - box.min[1];
  const step = 2.5;
  let paper = 0;
  let footprint = 0;
  for (let y = box.min[1] + height * from; y < box.min[1] + height * to; y += step) {
    for (let x = box.min[0]; x < box.max[0]; x += step) {
      let n = 0;
      for (const poly of polys) if (pointInPolygon([x, y], poly)) n++;
      paper += n;
      if (n > 0) footprint += 1;
    }
  }
  return footprint > 0 ? paper / footprint : 0;
}

/** The deepest stack anywhere in the finished model, in thicknesses. */
function deepestStack(plane: PlaneStructure): number {
  const state = computeFoldState(plane, plane.steps.length - 1);
  const polys = state.facets.map(facetInTable);
  const box = boundingBox(polys);
  let deepest = 0;
  for (let y = box.min[1]; y < box.max[1]; y += 2) {
    for (let x = box.min[0]; x < box.max[0]; x += 2) {
      let n = 0;
      for (const poly of polys) if (pointInPolygon([x, y], poly)) n++;
      if (n > deepest) deepest = n;
    }
  }
  return deepest;
}

function restingDimensions(plane: PlaneStructure): readonly [number, number, number] {
  const final = computeFoldState(plane, plane.steps.length - 1);
  const rest = restFrame(final).matrix;
  const points = final.facets.flatMap((facet) => {
    const pose = multiply(rest, poseForFacet(facet));
    return facet.polygon.map((point) => transformPoint(pose, point));
  });
  return [0, 1, 2].map((axis) => {
    const values = points.map((point) => point[axis]!);
    return Math.max(...values) - Math.min(...values);
  }) as unknown as readonly [number, number, number];
}

describe.each(Object.entries(PLANES))("%s: authored geometry", (id, plane) => {
  it("leaves no wedges before the wings are opened", () => {
    // Every crease endpoint must be constructed, never rounded to a tidy
    // number. A crease that misses its landing point by a hundredth of a
    // millimetre still folds, but it leaves a sliver on every layer it crosses,
    // and each sliver claims a layer of its own. Wedges at the wing crease
    // itself are inherent (it passes close to existing vertices); wedges before
    // it mean an endpoint was rounded.
    for (let n = 0; n < firstPartialFold(plane); n++) {
      const crumbs = computeFoldState(plane, n)
        .facets.filter((f) => area(f.polygon) < 1)
        .map((f) => `${f.id}@${area(f.polygon).toFixed(4)}mm^2`);
      expect(crumbs, `${plane.steps[n]!.id} left wedges`).toEqual([]);
    }
  });

  it("opens its wings as a mirrored pair carrying identical paper", () => {
    // The two wing steps share a crease and a side and differ only in which
    // half of the stack moves and which way it turns. If the halves overlap,
    // one wing is being folded twice; if they carry different amounts of paper,
    // the split fell inside a wing and the plane will fly with a twist.
    const wings = partialFoldSteps(plane).slice(-2);
    expect(wings.length, "expected a wing pair").toBe(2);
    const [near, far] = wings;
    const a = near!.step.action;
    const b = far!.step.action;
    if (a.type !== "fold" || b.type !== "fold") throw new Error("expected fold actions");
    expect(a.crease).toEqual(b.crease);
    expect(a.side).toBe(b.side);
    expect(a.angle).toBe(b.angle);
    expect(a.direction).not.toBe(b.direction);
    expect([a.layers, b.layers].sort()).toEqual(["bottom", "top"]);

    const movedNear = computeStepDelta(plane, near!.index)?.movingFacetIds ?? [];
    const movedFar = computeStepDelta(plane, far!.index)?.movingFacetIds ?? [];
    expect(movedNear.length).toBeGreaterThan(0);
    expect(movedNear.filter((f) => movedFar.includes(f))).toEqual([]);

    const paperNear = paperMovedBy(plane, near!.index);
    const paperFar = paperMovedBy(plane, far!.index);
    expect(paperNear).toBeGreaterThan(0);
    expect(Math.abs(paperNear - paperFar) / paperNear).toBeLessThan(1e-9);
  });

  it("sends its wings to opposite sides of the body, and rests on them", () => {
    // A V, not a tilt: the two wings must reach out to opposite sides of the
    // body. This used to be measured about the table's z = 0, where the wings
    // straddled only because the fold engine leaves the finished V lying on its
    // side - so the test literally required half the aircraft to be under the
    // table. In the frame the aircraft rests in, the claim is about x.
    const wings = partialFoldSteps(plane).slice(-2);
    const final = computeFoldState(plane, plane.steps.length - 1);
    const frame = restFrame(final);
    const at = (f: (typeof final.facets)[number], p: Vec2) =>
      transformPoint(multiply(frame.matrix, poseForFacet(f)), p);

    // Measured from the keel, which IS the wing hinge, rather than from x = 0.
    // Rest rolls the model about that hinge and never slides it sideways, so
    // the fuselage sits wherever table space left the crease - 25mm off centre
    // on the Dart. The hinge is the honest origin for "opposite sides of the
    // body" in any case: it is the body.
    const keel = frame.hinge!.origin[0];
    const spanOf = (n: number) => {
      const ids = computeStepDelta(plane, n)?.movingFacetIds ?? [];
      const xs = final.facets
        .filter((f) => ids.includes(f.id))
        .flatMap((f) => f.polygon.map((p) => at(f, p)[0] - keel));
      return { min: Math.min(...xs), max: Math.max(...xs) };
    };
    // Which of the pair ends up to port is an artefact of authoring order, so
    // the claim is that they are on opposite sides, not which side each takes.
    const [port, starboard] = [spanOf(wings[0]!.index), spanOf(wings[1]!.index)].sort(
      (a, b) => a.min - b.min,
    );
    expect(port!.min, "one wing well out to port").toBeLessThan(-10);
    expect(starboard!.max, "the other well out to starboard").toBeGreaterThan(10);
    // Symmetric to within the stack's own thickness.
    expect(Math.abs(Math.abs(port!.min) - starboard!.max)).toBeLessThan(5);

    // ...and the aircraft sits ON the table: touching it, not through it and
    // not hovering above it. Height off the ground is the display layer's to
    // decide, not the geometry's.
    const zs = final.facets.flatMap((f) => f.polygon.map((p) => at(f, p)[2]));
    expect(Math.min(...zs)).toBeCloseTo(0, 6);
  });

  it("carries far more paper in the nose than in the tail", () => {
    // Every plane in the catalogue is nose-weighted; that is what stops a paper
    // plane tumbling. Measured as thicknesses per unit of footprint so a narrow
    // nose is not penalised for being narrow. The rotate leaves the nose at low
    // y, so the first fifth of the model is the nose.
    const nose = layersInBand(plane, 0, 0.2);
    const tail = layersInBand(plane, 0.8, 1);
    expect(tail).toBeGreaterThan(0);
    expect(nose / tail, `${id} nose ${nose.toFixed(2)} vs tail ${tail.toFixed(2)}`).toBeGreaterThan(
      2,
    );
  });
});

describe("the Dart's defining structure", () => {
  const dart = PLANES.dart!;

  it("keeps a needle nose rather than acquiring a folded-back front", () => {
    const final = computeFoldState(dart, dart.steps.length - 1);
    const polygons = final.facets.map(facetInTable);
    const box = boundingBox(polygons);
    const noseX = polygons
      .flatMap((polygon) => polygon)
      .filter((point) => Math.abs(point[1] - box.min[1]) < 1e-8)
      .map((point) => point[0]);

    expect(noseX.length).toBeGreaterThan(0);
    expect(Math.max(...noseX) - Math.min(...noseX), "Dart nose width").toBeLessThan(1e-8);
  });

  it("retains the exact central crease and folded spine", () => {
    const centerCreases = [dart.steps[0]!, dart.steps[6]!].map((step) => step.action);
    for (const action of centerCreases) {
      if (action.type !== "fold") throw new Error("expected central fold");
      expect(action.crease.a[0]).toBe(0);
      expect(action.crease.b[0]).toBe(0);
    }
    expect(centerCreases.map((action) => (action.type === "fold" ? action.direction : null))).toEqual([
      "valley",
      "mountain",
    ]);
  });
});

describe("the Harrier's tip fins", () => {
  const harrier = PLANES.harrier!;

  it("keeps a broad glider planform rather than collapsing toward a Dart", () => {
    const [harrierSpan, harrierLength] = restingDimensions(harrier);
    const [dartSpan, dartLength] = restingDimensions(PLANES.dart!);
    expect(harrierSpan / harrierLength).toBeGreaterThan(0.6);
    expect(harrierSpan / harrierLength).toBeGreaterThan((dartSpan / dartLength) * 2);
  });

  it("hinge outboard of the wings, which is what makes both bends legal", () => {
    // Partial folds have to nest: a later crease may not cross a facet that is
    // already bent out of plane. The fin crease is parallel to the wing crease
    // and further out, so the wing crease never cuts a bent fin.
    const partials = partialFoldSteps(harrier);
    expect(partials.length).toBe(4);
    const [finNear, , wingNear] = partials;
    const fin = finNear!.step.action;
    const wing = wingNear!.step.action;
    if (fin.type !== "fold" || wing.type !== "fold") throw new Error("expected fold actions");
    expect(fin.crease.a[0]).toBe(fin.crease.b[0]);
    expect(wing.crease.a[0]).toBe(wing.crease.b[0]);
    expect(fin.crease.a[0]).toBeGreaterThan(wing.crease.a[0]);

    const beforeFins = computeFoldState(harrier, finNear!.index - 1);
    expect(beforeFins.facets.every((f) => f.bend.length === 0)).toBe(true);
  });

  it("stand up above the wing rather than hanging below it", () => {
    // The fins are bent before the wings and carried along by them, so the fin
    // has to turn the OPPOSITE way from its own wing to finish pointing up.
    // Getting this backwards still validates and still renders; it just builds
    // a plane with drooping tips. Measured in the rest frame, where +z is up by
    // construction rather than by knowing which table axis happens to be up -
    // this used to read the lift off x, and the codebase held three different
    // opinions about which axis that was.
    const final = computeFoldState(harrier, harrier.steps.length - 1);
    const rest = restFrame(final).matrix;
    const fins = final.facets.filter((f) => f.bend.length === 2);
    expect(fins.length).toBeGreaterThan(0);
    const finCenters = fins.map((fin) => {
      const pose = multiply(rest, poseForFacet(fin));
      return (
        fin.polygon.reduce((sum, point) => sum + transformPoint(pose, point)[0], 0) /
        fin.polygon.length
      );
    });
    expect(finCenters.some((x) => x < -50), "port tip fin").toBe(true);
    expect(finCenters.some((x) => x > 50), "starboard tip fin").toBe(true);
    for (const fin of fins) {
      const withFin = multiply(rest, poseForFacet(fin));
      const wingOnly = multiply(
        rest,
        poseForFacet({ ...fin, bend: [fin.bend[fin.bend.length - 1]!] }),
      );
      const lift =
        fin.polygon.reduce(
          (sum, p) => sum + transformPoint(withFin, p)[2] - transformPoint(wingOnly, p)[2],
          0,
        ) / fin.polygon.length;
      expect(lift, `fin facet ${fin.id} droops`).toBeGreaterThan(1);
    }
  });
});

describe("the Hammer's nose", () => {
  it("is the thickest stack of paper in the catalogue", () => {
    // The plane's whole identity. If a roll or a nose fold were dropped this
    // would quietly stop being true while every other check still passed.
    const depths = Object.entries(PLANES).map(([id, plane]) => ({
      id,
      depth: deepestStack(plane),
    }));
    const hammer = depths.find((d) => d.id === "hammer")!;
    for (const other of depths) {
      if (other.id === "hammer") continue;
      expect(hammer.depth, `hammer ${hammer.depth} vs ${other.id} ${other.depth}`).toBeGreaterThan(
        other.depth,
      );
    }
  });
});

describe("the Square Cruiser's paper prep", () => {
  const cruiser = PLANES["square-cruiser"]!;

  /** Replay a prep sequence against the sheet the user actually has. */
  function replayPrep(format: PaperFormat): FoldState {
    let state = freshSheet(format);
    let nextId = 1;
    const history = new Map<string, FoldState>();
    for (const step of cruiser.paper.prep[format]) {
      history.set(step.id, state);
      const result = applyStep(state, step, nextId, history);
      state = result.state;
      nextId = result.nextId;
    }
    return state;
  }

  it.each(["letter", "a4", "index-4x6"] as const)(
    "cuts %s down to an exact square of the sheet's own width",
    (format) => {
      const state = replayPrep(format);
      const box = boundingBox(state.facets.map(facetInTable));
      const width = box.max[0] - box.min[0];
      const height = box.max[1] - box.min[1];
      const source = PAPER_SIZES[format];
      const side = Math.min(source.width, source.height);

      expect(width).toBeCloseTo(side, 9);
      expect(height).toBeCloseTo(side, 9);
      // Bounding box alone would pass for a square-ish scatter of offcuts, so
      // check the paper really fills it and nothing was left behind.
      const paper = state.facets.reduce((sum, f) => sum + area(f.polygon), 0);
      expect(paper).toBeCloseTo(side * side, 6);
    },
  );

  it("cuts once and folds only to mark the cut", () => {
    for (const format of ["letter", "a4", "index-4x6"] as const) {
      const kinds = cruiser.paper.prep[format].map((s) => s.action.type);
      expect(kinds, `${format} prep`).toEqual(["fold", "unfold", "cut"]);
    }
  });

  it("discards real paper, and only from the source sheet", () => {
    for (const format of ["letter", "a4", "index-4x6"] as const) {
      const source = PAPER_SIZES[format];
      const before = source.width * source.height;
      const after = replayPrep(format)
        .facets.reduce((sum, f) => sum + area(f.polygon), 0);
      expect(after).toBeLessThan(before);
      expect(after).toBeGreaterThan(before * 0.5);
    }
  });
});
