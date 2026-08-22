/**
 * PRD acceptance criterion: with no WebGL the tutorial must still be
 * completable, which means the SVG path emits the same events as the 3D stage.
 */
import { describe, expect, it, vi } from "vitest";
import { createFallbackEngine, isWebGLAvailable } from "@/engine/render/fallback";
import { createCoreStub, makeStructure } from "@/engine/render/__contracts__/coreStub";
import { createFakeDom } from "./fakeDom";
import type { AnnotationAnchor } from "@/engine/core/types";
import { CAMERA_PRESETS } from "@/engine/view";

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
      {},
      core,
    );
    return { container, core, structure, engine };
  };

  it("mounts the core's SVG for the current state", () => {
    const { container, core, engine } = mount();
    const node = container.children[0];
    expect(node?.innerHTML).toContain("<svg");
    expect(core.calls.some((c) => c.fn === "renderStateToSvg")).toBe(true);
    expect(engine.renderMode).toBe("svg");
    engine.dispose();
  });

  it("accepts Reset view as a safe no-op", () => {
    const { engine } = mount();
    expect(() => engine.resetView()).not.toThrow();
    engine.dispose();
  });

  it("passes finished-aircraft presentation options to the static renderer", () => {
    const { container } = createFakeDom();
    const core = createCoreStub();
    const displayView = { azimuthDeg: 128, elevationDeg: 33 };
    const engine = createFallbackEngine(
      container as unknown as HTMLElement,
      makeStructure(3),
      { display: true, displayView },
      core,
    );

    expect(core.calls.find((call) => call.fn === "renderStateToSvg")).toEqual({
      fn: "renderStateToSvg",
      options: { display: true, rest: true, displayView },
    });
    engine.dispose();
  });

  it("gives a camera preset precedence over displayView without renderer math", () => {
    const { container } = createFakeDom();
    const core = createCoreStub();
    const engine = createFallbackEngine(
      container as unknown as HTMLElement,
      makeStructure(3),
      {
        display: true,
        rest: false,
        displayView: { azimuthDeg: 128, elevationDeg: 33 },
        cameraPreset: "top",
      },
      core,
    );

    expect(core.calls.find((call) => call.fn === "renderStateToSvg")).toEqual({
      fn: "renderStateToSvg",
      options: { display: true, rest: true, displayView: CAMERA_PRESETS.top },
    });
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
      engine.setRenderActive(false);
      engine.setRenderActive(true);
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
