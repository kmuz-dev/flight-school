/**
 * PRD acceptance criterion: with no WebGL the tutorial must still be
 * completable, which means the SVG path emits the same events as the 3D stage.
 */
import { describe, expect, it, vi } from "vitest";
import { createFallbackEngine, isWebGLAvailable } from "@/engine/render/fallback";
import { createCoreStub, makeStructure } from "@/engine/render/__contracts__/coreStub";
import { createFakeDom } from "./fakeDom";
import type { AnnotationAnchor } from "@/engine/core/types";

const flush = (): Promise<void> => new Promise<void>((resolve) => queueMicrotask(resolve));

describe("isWebGLAvailable", () => {
  it("is false with no document at all", () => {
    expect(isWebGLAvailable(null)).toBe(false);
  });

  it("is false when the canvas yields no context", () => {
    const { doc } = createFakeDom();
    expect(isWebGLAvailable(doc as unknown as Document)).toBe(false);
  });
});

describe("createFallbackEngine", () => {
  const mount = () => {
    const { container } = createFakeDom();
    const core = createCoreStub();
    const structure = makeStructure(5);
    const engine = createFallbackEngine(
      container as unknown as HTMLElement,
      structure,
      { theme: "night" },
      core,
    );
    return { container, core, structure, engine };
  };

  it("mounts the core's SVG for the current state", () => {
    const { container, core, engine } = mount();
    const node = container.children[0];
    expect(node?.innerHTML).toContain("<svg");
    expect(core.calls.some((c) => c.fn === "renderStateToSvg")).toBe(true);
    expect(node?.dataset.theme).toBe("night");
    engine.dispose();
  });

  it("re-renders and reports completion on every step change", async () => {
    const { container, engine } = mount();
    const completed: unknown[] = [];
    const progress: unknown[] = [];
    const anchors: AnnotationAnchor[] = [];
    engine.on("stepComplete", (p) => completed.push(p));
    engine.on("progress", (p) => progress.push(p));
    engine.on("annotation", (p) => anchors.push(p as AnnotationAnchor));

    await flush();
    expect(completed).toEqual([0]);

    engine.gotoStep(3);
    await flush();
    expect(completed).toEqual([0, 3]);
    expect(progress).toEqual([1, 1]);
    expect(anchors.every((a) => a.visible === false)).toBe(true);
    expect(container.children[0]?.innerHTML).toContain("<svg");
    engine.dispose();
  });

  it("clamps out-of-range steps", async () => {
    const { engine } = mount();
    const completed: unknown[] = [];
    engine.on("stepComplete", (p) => completed.push(p));
    engine.gotoStep(99);
    engine.gotoStep(-5);
    await flush();
    expect(completed).toEqual([0, 4, 0]);
    engine.dispose();
  });

  it("exposes a settled timeline with a real duration so the transport bar still works", () => {
    const { engine } = mount();
    expect(engine.timeline.progress()).toBe(1);
    expect(engine.timeline.paused).toBe(true);
    expect(engine.timeline.duration).toBeGreaterThan(0);
    expect(() => {
      engine.timeline.play();
      engine.timeline.pause();
      engine.setCameraPreset("top");
      engine.resize();
    }).not.toThrow();
    engine.dispose();
  });

  it("unsubscribes and stops emitting after dispose", async () => {
    const { container, engine } = mount();
    const cb = vi.fn();
    const off = engine.on("stepComplete", cb);
    off();
    engine.gotoStep(1);
    await flush();
    expect(cb).not.toHaveBeenCalled();

    engine.dispose();
    expect(container.children.length).toBe(0);
    engine.gotoStep(2);
    await flush();
    expect(cb).not.toHaveBeenCalled();
  });
});
