/**
 * Deterministic replay and sequence validation.
 *
 * `computeFoldState(structure, n)` always replays from the fresh sheet, so the
 * state at any step is a pure function of steps 0..n. That is what makes
 * scrubbing, stepping back, and resuming from localStorage exact rather than
 * approximate - there is no accumulated mutable pose to drift.
 */
import type { FoldState, FoldStep, ValidationIssue, Vec2 } from "./types";
import type { PlaneStructure } from "@/content/types";
import { freshSheet, formatForPlane } from "./paper";
import { applyStep, facetInTable } from "./fold";
import { classify, convexOverlap, area } from "./polygon";
import { EPS } from "./vec2";

/**
 * Replay cache. The outer key is the steps array rather than the structure so
 * that a caller rebuilding its `PlaneStructure` object each render still hits;
 * the inner key carries the paper format, because the same sequence folded from
 * a different sheet is a different state and keying on steps alone silently
 * returned the first sheet computed. That collision is invisible in the product
 * (each plane owns its steps array) but immediate in the fold editor, which
 * exists to preview one sequence on different paper.
 */
const memo = new WeakMap<readonly FoldStep[], Map<string, FoldState>>();

/** Replay steps 0..n (inclusive). n = -1 gives the fresh sheet. */
export function computeFoldState(structure: PlaneStructure, n: number): FoldState {
  const steps = structure.steps;
  const cache = memo.get(steps) ?? new Map<string, FoldState>();
  if (!memo.has(steps)) memo.set(steps, cache);

  const format = formatForPlane(structure.paper.format);
  const clamped = Math.max(-1, Math.min(n, steps.length - 1));
  const key = (i: number): string => `${format}:${i}`;
  const hit = cache.get(key(clamped));
  if (hit) return hit;

  let state = freshSheet(format);
  let nextId = 1;
  const history = new Map<string, FoldState>();

  cache.set(key(-1), state);
  for (let i = 0; i <= clamped; i++) {
    const step = steps[i];
    if (!step) break;
    history.set(step.id, state);
    const result = applyStep(state, step, nextId, history);
    state = result.state;
    nextId = result.nextId;
    cache.set(key(i), state);
  }
  return state;
}

/** The per-step delta, recomputed alongside the state (used by the animator). */
export function computeStepDelta(structure: PlaneStructure, n: number) {
  const steps = structure.steps;
  const format = formatForPlane(structure.paper.format);
  let state = freshSheet(format);
  let nextId = 1;
  const history = new Map<string, FoldState>();
  let delta = null;
  for (let i = 0; i <= n && i < steps.length; i++) {
    const step = steps[i];
    if (!step) break;
    history.set(step.id, state);
    const result = applyStep(state, step, nextId, history);
    state = result.state;
    nextId = result.nextId;
    delta = result.delta;
  }
  return delta;
}

export function totalArea(state: FoldState): number {
  return state.facets.reduce((sum, f) => sum + area(f.polygon), 0);
}

/**
 * Author-time checks. Every geometric invariant that has a unit test also has a
 * validation issue here, so the fold editor can surface it while a sequence is
 * being written rather than at render time.
 */
export function validateSequence(structure: PlaneStructure): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const steps = structure.steps;
  const format = formatForPlane(structure.paper.format);
  let state = freshSheet(format);
  let nextId = 1;
  const history = new Map<string, FoldState>();
  const seenIds = new Set<string>();
  const startingArea = totalArea(state);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step) continue;
    const push = (code: ValidationIssue["code"], message: string) =>
      issues.push({ stepIndex: i, stepId: step.id, code, message });

    const action = step.action;

    if (action.type === "fold" || action.type === "cut") {
      const line = action.type === "fold" ? action.crease : action.line;

      // The crease must actually cross the current silhouette.
      let sawLeft = false;
      let sawRight = false;
      for (const facet of state.facets) {
        for (const p of facetInTable(facet)) {
          const c = classify(line, p);
          if (c === 1) sawLeft = true;
          else if (c === -1) sawRight = true;
        }
      }
      if (!sawLeft || !sawRight) {
        push(
          action.type === "fold" ? "crease-misses-silhouette" : "cut-does-not-span",
          `The line does not cross the paper at this point in the sequence.`,
        );
      }

      // A crease may not cross a facet that is already bent out of plane.
      if (action.type === "fold") {
        for (const facet of state.facets) {
          if (facet.bend.length === 0) continue;
          const pts = facetInTable(facet);
          const sides = new Set(pts.map((p) => classify(line, p)));
          if (sides.has(1) && sides.has(-1)) {
            push(
              "crease-over-nonflat",
              `Crease crosses facet ${facet.id}, which is already folded out of plane.`,
            );
            break;
          }
        }
      }
    }

    if (action.type === "unfold" && !seenIds.has(action.toStep)) {
      push("unfold-unknown-step", `unfold targets "${action.toStep}", which is not an earlier step.`);
    }

    seenIds.add(step.id);
    history.set(step.id, state);
    const result = applyStep(state, step, nextId, history);
    state = result.state;
    nextId = result.nextId;

    // Degenerate facets must never survive a step.
    for (const facet of state.facets) {
      if (area(facet.polygon) <= EPS * EPS) {
        push("degenerate-facet", `Facet ${facet.id} collapsed to zero area.`);
        break;
      }
    }

    // Overlap audit: two facets sharing a layer must not overlap in table space.
    const byLayer = new Map<number, Vec2[][]>();
    for (const facet of state.facets) {
      const list = byLayer.get(facet.layer) ?? [];
      list.push(facetInTable(facet));
      byLayer.set(facet.layer, list);
    }
    outer: for (const [layer, polys] of byLayer) {
      for (let a = 0; a < polys.length; a++) {
        for (let b = a + 1; b < polys.length; b++) {
          const pa = polys[a];
          const pb = polys[b];
          if (pa && pb && convexOverlap(pa, pb)) {
            push("layer-overlap", `Two facets overlap on layer ${layer}.`);
            break outer;
          }
        }
      }
    }
  }

  // Paper is conserved except where a cut deliberately removes some.
  const hasCut = steps.some((s) => s.action.type === "cut");
  if (!hasCut) {
    const endArea = totalArea(state);
    if (Math.abs(endArea - startingArea) > startingArea * 1e-6) {
      issues.push({
        stepIndex: steps.length - 1,
        stepId: steps[steps.length - 1]?.id ?? "",
        code: "degenerate-facet",
        message: `Paper area changed from ${startingArea.toFixed(2)} to ${endArea.toFixed(2)} without a cut.`,
      });
    }
  }

  return issues;
}
