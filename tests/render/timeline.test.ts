/**
 * The load-bearing rule of the animation layer: GSAP owns time, the core owns
 * state. These tests pin that a tween can never leak into fold state.
 */
import { afterAll, describe, expect, it, vi } from "vitest";
import { gsap } from "gsap";
import { createStepTimeline, stepDuration } from "@/engine/render/timeline";
import type { PoseMap } from "@/engine/render/coreApi";
import { createCoreStub, makeStructure } from "@/engine/render/__contracts__/coreStub";
import type { FoldStep } from "@/engine/core/types";

afterAll(() => {
  gsap.ticker.sleep();
});

function harness(stepIndex = 1, reducedMotion = false) {
  const core = createCoreStub();
  const structure = makeStructure(4);
  const from = core.computeFoldState(structure, stepIndex - 1);
  const to = core.computeFoldState(structure, stepIndex);
  core.reset();

  const applied: PoseMap[] = [];
  const progress: number[] = [];
  const onComplete = vi.fn();

  const timeline = createStepTimeline({
    core,
    structure,
    stepIndex,
    settled: to,
    step: structure.steps[stepIndex],
    apply: (poses) => applied.push(poses),
    onProgress: (t) => progress.push(t),
    onComplete,
    reducedMotion,
  });

  /** The x translation of facet 0 in the most recent write. */
  const lastX = (): number => {
    const last = applied[applied.length - 1];
    const m = last?.get(0);
    return m?.[12] ?? Number.NaN;
  };

  return { core, structure, timeline, applied, progress, onComplete, lastX, to };
}

describe("createStepTimeline", () => {
  it("starts paused at progress 0 showing the pre-step state", () => {
    const { timeline, progress, lastX, core } = harness();
    expect(timeline.paused).toBe(true);
    expect(timeline.progress()).toBe(0);
    expect(progress).toEqual([0]);
    // t=0 renders `from` through poseAtProgress, keyed by `to`'s facet ids.
    expect(core.calls.at(-1)).toEqual({ fn: "poseAtProgress", t: 0 });
    expect(lastX()).toBe(0);
  });

  it("scrubbing tweens the scalar and asks the core for poses at that progress", () => {
    const { timeline, core, lastX } = harness();
    core.reset();

    timeline.progress(0.5);

    expect(timeline.progress()).toBeCloseTo(0.5, 5);
    const call = core.calls.find((c) => c.fn === "poseAtProgress");
    expect(call).toBeDefined();
    // power2.inOut is symmetric, so halfway through time is halfway through the fold.
    expect(lastX()).toBeCloseTo(50, 3);
    expect(core.calls.some((c) => c.fn === "computeFoldState")).toBe(false);
  });

  it("snaps to the pure settled state at progress 1 rather than the last tween frame", () => {
    const { timeline, core, lastX } = harness();
    core.reset();

    timeline.progress(1);

    // The stub marks settled poses with x=1000; an interpolated frame maxes at 100.
    expect(lastX()).toBe(1000);
    expect(core.calls.at(-1)).toEqual({ fn: "posesForState", facets: 3 });
  });

  it("snaps back to the pure pre-step state on a hard seek to 0", () => {
    const { timeline, core, lastX } = harness();
    timeline.progress(0.8);
    core.reset();

    timeline.progress(0);

    expect(lastX()).toBe(0);
    expect(core.calls.at(-1)).toEqual({ fn: "poseAtProgress", t: 0 });
  });

  it("fires onComplete exactly once when progress reaches 1, and re-arms on rewind", () => {
    const { timeline, onComplete } = harness();

    timeline.progress(1);
    timeline.progress(1);
    expect(onComplete).toHaveBeenCalledTimes(1);

    timeline.progress(0.2);
    timeline.progress(1);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("clamps out-of-range scrubs", () => {
    const { timeline } = harness();
    timeline.progress(-4);
    expect(timeline.progress()).toBe(0);
    timeline.progress(9);
    expect(timeline.progress()).toBe(1);
  });

  it("complete() settles without playing", () => {
    const { timeline, lastX } = harness();
    timeline.complete();
    expect(timeline.progress()).toBe(1);
    expect(timeline.paused).toBe(true);
    expect(lastX()).toBe(1000);
  });

  it("play() from the end rewinds instead of doing nothing", () => {
    const { timeline } = harness();
    timeline.complete();
    timeline.play();
    expect(timeline.progress()).toBeLessThan(1);
    expect(timeline.paused).toBe(false);
    timeline.kill();
  });

  it("reduced motion collapses the duration so the fold jumps to its end state", () => {
    const normal = harness(1, false);
    const reduced = harness(1, true);
    expect(reduced.timeline.duration).toBeLessThan(normal.timeline.duration);
    expect(reduced.timeline.duration).toBeLessThanOrEqual(0.01);
  });

  it("kill() makes the handle inert", () => {
    const { timeline, applied } = harness();
    timeline.kill();
    const before = applied.length;
    timeline.play();
    timeline.progress(0.5);
    expect(applied.length).toBe(before);
    expect(timeline.paused).toBe(true);
  });
});

describe("stepDuration", () => {
  const fold = (angle: number): FoldStep => ({
    id: "x",
    action: {
      type: "fold",
      crease: { a: [0, 0], b: [1, 0] },
      side: "left",
      angle,
      direction: "valley",
    },
  });

  it("honours an explicit duration", () => {
    expect(stepDuration({ ...fold(180), duration: 2.5 })).toBe(2.5);
  });

  it("stays inside the DESIGN.md 0.8-1.5s band and scales with fold size", () => {
    const small = stepDuration(fold(45));
    const flat = stepDuration(fold(180));
    expect(small).toBeGreaterThanOrEqual(0.8);
    expect(flat).toBeLessThanOrEqual(1.5);
    expect(flat).toBeGreaterThan(small);
  });

  it("has a sane default with no step at all", () => {
    expect(stepDuration(undefined)).toBeGreaterThan(0);
  });
});
