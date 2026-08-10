/**
 * `FoldEngine` end-to-end against fakes: no browser, no WebGL, no core math.
 * Everything the engine touches outside Three.js is injected, which is exactly
 * what makes the leak-prone parts (contexts, listeners, RAF) testable at all.
 */
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { gsap } from "gsap";
import { BufferGeometry, LineSegments, Mesh, Vector3 } from "three";
import { CAMERA_PRESETS, FoldEngine, orbitToPosition } from "@/engine/render/renderer";
import { createCoreStub, makeStructure } from "@/engine/render/__contracts__/coreStub";
import type { AnnotationAnchor, CameraHint, EngineOptions } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import {
  createFakeControls,
  createFakeDom,
  createFakeRenderer,
  type FakeDocument,
  type FakeNode,
  type FakeWindow,
} from "./fakeDom";

afterAll(() => {
  gsap.globalTimeline.clear();
  gsap.ticker.sleep();
});

type Mounted = {
  readonly engine: FoldEngine;
  readonly core: ReturnType<typeof createCoreStub>;
  readonly structure: PlaneStructure;
  readonly container: FakeNode;
  readonly view: FakeWindow;
  readonly doc: FakeDocument;
  readonly controls: ReturnType<typeof createFakeControls>;
  readonly canvas: FakeNode;
  readonly renderer: ReturnType<typeof createFakeRenderer>;
  /** Quality tier the renderer factory was asked for. */
  readonly quality: string;
};

const live: Mounted[] = [];

function mount(
  options: {
    reducedMotion?: boolean;
    steps?: number;
    structure?: PlaneStructure;
    engine?: EngineOptions;
  } = {},
): Mounted {
  const { container, doc, view } = createFakeDom(800, 600);
  if (options.reducedMotion === true) view.matchMedia = () => ({ matches: true });

  const core = createCoreStub();
  const structure = options.structure ?? makeStructure(options.steps ?? 4);
  let canvas: FakeNode | null = null;
  const controls = createFakeControls();
  let renderer: ReturnType<typeof createFakeRenderer> | null = null;
  const qualities: string[] = [];

  const engine = new FoldEngine(
    container as unknown as HTMLElement,
    structure,
    options.engine ?? {},
    {
      core,
      rendererFactory: (c, quality) => {
        canvas = c as unknown as FakeNode;
        qualities.push(quality);
        renderer = createFakeRenderer(canvas);
        return renderer;
      },
      controlsFactory: () => controls,
    },
  );

  const mounted: Mounted = {
    engine,
    core,
    structure,
    container,
    view,
    doc,
    controls,
    get canvas(): FakeNode {
      if (!canvas) throw new Error("renderer factory never ran");
      return canvas;
    },
    get renderer(): ReturnType<typeof createFakeRenderer> {
      if (!renderer) throw new Error("renderer factory never ran");
      return renderer;
    },
    get quality(): string {
      const tier = qualities[0];
      if (tier === undefined) throw new Error("renderer factory never ran");
      return tier;
    },
  };
  live.push(mounted);
  return mounted;
}

afterEach(() => {
  for (const m of live.splice(0)) m.engine.dispose();
});

/** Camera tweens are the only tweens whose target carries an azimuth. */
function cameraTweens(): unknown[] {
  return gsap.globalTimeline.getChildren(true, true, false).filter((child) => {
    const target = (child as { targets?: () => unknown[] }).targets?.()[0];
    return typeof target === "object" && target !== null && "azimuthDeg" in target;
  });
}

describe("FoldEngine construction", () => {
  it("mounts a canvas and sizes the renderer to the container", () => {
    const { container, canvas, renderer } = mount();
    expect(container.children).toContain(canvas);
    expect(renderer.setSize).toHaveBeenCalledWith(800, 600, false);
    // devicePixelRatio is capped at 2 so a 3x phone does not melt.
    expect(renderer.setPixelRatio).toHaveBeenCalledWith(2);
  });

  it("calls onReady once the stage is live", () => {
    const { container } = createFakeDom();
    const onReady = vi.fn();
    const engine = new FoldEngine(
      container as unknown as HTMLElement,
      makeStructure(2),
      { onReady },
      {
        core: createCoreStub(),
        rendererFactory: (c) => createFakeRenderer(c as unknown as FakeNode),
        controlsFactory: () => createFakeControls(),
      },
    );
    expect(onReady).toHaveBeenCalledTimes(1);
    engine.dispose();
  });

  /**
   * The hangar's frame budget, gated where it is deterministic.
   *
   * Waking two live scenes cost 67ms a frame on a throttled phone before the
   * previews got their own tier and 17ms after, and the whole difference is
   * pixels: a preview draws at one device pixel with no multisampling and no
   * shadow map. Measuring that as wall-clock in CI turned out to measure the
   * runner (see tests/e2e/hangar-perf.spec.ts), so the mechanism is pinned here
   * instead, where it is three exact values rather than a number that drifts.
   */
  it("spends a hangar preview's pixels differently from the tutorial stage's", () => {
    const full = mount();
    expect(full.quality).toBe("full");
    expect(full.renderer.setPixelRatio).toHaveBeenCalledWith(2);
    expect(full.engine["keyLight"].castShadow).toBe(true);

    const preview = mount({ engine: { quality: "preview" } });
    expect(preview.quality).toBe("preview");
    // One device pixel per CSS pixel: on a 3x phone that is a ninth of the fill.
    expect(preview.renderer.setPixelRatio).toHaveBeenCalledWith(1);
    expect(preview.engine["keyLight"].castShadow).toBe(false);
  });

  it("lands on step 0 paused at progress 0, not mid-fold", () => {
    const { engine } = mount();
    expect(engine.currentStep).toBe(0);
    expect(engine.timeline.progress()).toBe(0);
    expect(engine.timeline.paused).toBe(true);
    expect(engine.timeline.duration).toBeGreaterThan(0);
  });
});

describe("FoldEngine step control", () => {
  it("gotoStep with animate:false snaps to the settled state and reports completion", () => {
    const { engine, core } = mount();
    const completed: unknown[] = [];
    engine.on("stepComplete", (p) => completed.push(p));

    engine.gotoStep(2, { animate: false });

    expect(engine.currentStep).toBe(2);
    expect(engine.timeline.progress()).toBe(1);
    expect(completed).toEqual([2]);
    expect(core.calls.at(-1)).toEqual({ fn: "posesForState", facets: 4 });
  });

  it("gotoStep autoplays by default", () => {
    const { engine } = mount();
    engine.gotoStep(1);
    expect(engine.timeline.paused).toBe(false);
  });

  it("clamps the step index to the sequence", () => {
    const { engine } = mount({ steps: 3 });
    engine.gotoStep(50, { animate: false });
    expect(engine.currentStep).toBe(2);
    engine.gotoStep(-9, { animate: false });
    expect(engine.currentStep).toBe(0);
  });

  it("memoises fold states so stepping back and forth never recomputes", () => {
    const { engine, core } = mount();
    engine.gotoStep(1, { animate: false });
    engine.gotoStep(2, { animate: false });
    const computes = core.calls.filter((c) => c.fn === "computeFoldState").length;
    engine.gotoStep(1, { animate: false });
    engine.gotoStep(2, { animate: false });
    expect(core.calls.filter((c) => c.fn === "computeFoldState").length).toBe(computes);
  });

  it("emits progress while scrubbing and replay() rewinds", () => {
    const { engine } = mount();
    const seen: number[] = [];
    engine.on("progress", (p) => seen.push(p as number));
    engine.gotoStep(1, { animate: false });
    seen.length = 0;

    engine.timeline.progress(0.4);
    expect(seen.at(-1)).toBeCloseTo(0.4, 5);

    engine.replay();
    expect(engine.timeline.progress()).toBeLessThan(0.4);
    expect(engine.timeline.paused).toBe(false);
  });
});

describe("FoldEngine camera", () => {
  it("snaps straight to a preset under reduced motion", () => {
    const { engine, controls } = mount({ reducedMotion: true });
    engine.setCameraPreset("top");
    const expected = orbitToPosition(
      { ...CAMERA_PRESETS.top, distance: 1 },
      new Vector3(),
    ).normalize();
    const actual = engine["camera"].position.clone().sub(controls.target).normalize();
    expect(actual.x).toBeCloseTo(expected.x, 4);
    expect(actual.y).toBeCloseTo(expected.y, 4);
    expect(actual.z).toBeCloseTo(expected.z, 4);
  });

  it("tweens toward a preset, and a pointer-down on the canvas kills the tween", () => {
    const { engine, canvas } = mount();
    expect(cameraTweens()).toHaveLength(0);

    engine.setCameraPreset("front");
    expect(cameraTweens()).toHaveLength(1);

    const registered = canvas.addEventListener.mock.calls.find((c) => c[0] === "pointerdown");
    expect(registered).toBeDefined();
    (registered?.[1] as () => void)();

    // User intent wins: nothing is still driving the camera.
    expect(cameraTweens()).toHaveLength(0);
  });

  it("keeps up as +Z so table-space poses need no re-basing", () => {
    const { engine } = mount();
    expect(engine["camera"].up.toArray()).toEqual([0, 0, 1]);
  });

  /**
   * A display surface shows the finished aircraft, and the last step's camera
   * hint is authored for the fold, not for the result - the Dart's is `top`-like
   * nose-on `front`, where a dart is a sliver. Pinning is what keeps the hangar
   * card and the preflight hero on the catalogue's 3/4 angle.
   */
  it("pins the camera to the given preset instead of following step hints", () => {
    const withTopLastStep = (): PlaneStructure => {
      const base = makeStructure(2);
      const camera: CameraHint = { preset: "top" };
      return { ...base, steps: base.steps.map((step) => ({ ...step, camera })) };
    };
    const direction = (m: Mounted): Vector3 =>
      m.engine["camera"].position.clone().sub(m.controls.target).normalize();
    const unit = (preset: "top" | "threeQuarter"): Vector3 =>
      orbitToPosition({ ...CAMERA_PRESETS[preset], distance: 1 }, new Vector3()).normalize();

    const free = mount({ reducedMotion: true, structure: withTopLastStep() });
    free.engine.gotoStep(1, { animate: false });
    expect(direction(free).z).toBeCloseTo(unit("top").z, 4);

    const pinned = mount({
      reducedMotion: true,
      structure: withTopLastStep(),
      engine: { cameraPreset: "threeQuarter" },
    });
    pinned.engine.gotoStep(1, { animate: false });
    const expected = unit("threeQuarter");
    const actual = direction(pinned);
    expect(actual.x).toBeCloseTo(expected.x, 4);
    expect(actual.y).toBeCloseTo(expected.y, 4);
    expect(actual.z).toBeCloseTo(expected.z, 4);
  });

  /**
   * The camera is placed once per step and holds while the paper moves, so the
   * framing has to cover both ends of the step. Measuring only where the meshes
   * happen to sit when the timeline is built means measuring the step's START,
   * which is why a finished plane came out framed for the state before it.
   */
  it("frames the whole step, not the pose the timeline was built on", () => {
    const { engine } = mount();
    engine.gotoStep(1, { animate: false });
    // The stub parks the settled state at x=1000 and the step's start near x=0.
    const bounds = engine["stepBounds"];
    expect(bounds).not.toBeNull();
    expect(bounds?.min.x).toBeLessThan(100);
    expect(bounds?.max.x).toBeGreaterThan(1000);
  });
});

describe("FoldEngine annotations", () => {
  it("emits a projected screen anchor and hides it once the fold settles", () => {
    const { engine } = mount();
    const anchors: AnnotationAnchor[] = [];
    engine.on("annotation", (p) => anchors.push(p as AnnotationAnchor));

    engine.gotoStep(1);
    engine.timeline.progress(0.5);
    engine.renderFrame();
    const midFold = anchors.at(-1);
    expect(midFold).toBeDefined();
    expect(midFold?.visible).toBe(true);
    expect(midFold?.x).toBeGreaterThan(0);
    expect(midFold?.x).toBeLessThan(800);
    expect(Number.isFinite(midFold?.y)).toBe(true);

    engine.timeline.progress(1);
    engine.renderFrame();
    expect(anchors.at(-1)?.visible).toBe(false);
  });

  it("only re-emits when the anchor actually moves", () => {
    const { engine } = mount();
    engine.gotoStep(1, { animate: false });
    const anchors: AnnotationAnchor[] = [];
    engine.on("annotation", (p) => anchors.push(p as AnnotationAnchor));
    engine.renderFrame();
    engine.renderFrame();
    engine.renderFrame();
    expect(anchors.length).toBeLessThanOrEqual(1);
  });
});

describe("FoldEngine dispose", () => {
  it("releases the context, controls, listeners, RAF and every GPU resource", () => {
    const m = mount();
    const { engine, container, canvas, renderer, controls, view } = m;
    live.splice(live.indexOf(m), 1); // this test owns the teardown

    const geometries: BufferGeometry[] = [];
    engine["scene"].traverse((object) => {
      if (object instanceof Mesh || object instanceof LineSegments) geometries.push(object.geometry);
    });
    expect(geometries.length).toBeGreaterThan(0);
    const geometrySpies = geometries.map((g) => vi.spyOn(g, "dispose"));

    engine.dispose();

    for (const spy of geometrySpies) expect(spy).toHaveBeenCalledTimes(1);
    expect(renderer.disposeSpy).toHaveBeenCalledTimes(1);
    expect(renderer.forceContextLossSpy).toHaveBeenCalledTimes(1);
    expect(controls.disposeSpy).toHaveBeenCalledTimes(1);
    expect(view.cancelAnimationFrame).toHaveBeenCalled();
    // Every listener the engine added to the canvas is taken back off.
    expect(canvas.listenerCount()).toBe(0);
    expect(container.children).not.toContain(canvas);
    expect(cameraTweens()).toHaveLength(0);
  });

  it("is idempotent and inert afterwards", () => {
    const m = mount();
    live.splice(live.indexOf(m), 1);
    const cb = vi.fn();
    m.engine.on("stepComplete", cb);
    m.engine.dispose();
    expect(() => {
      m.engine.dispose();
      m.engine.gotoStep(2, { animate: false });
      m.engine.replay();
      m.engine.resize();
      m.engine.setCameraPreset("front");
      m.engine.renderFrame();
    }).not.toThrow();
    expect(cb).not.toHaveBeenCalled();
    expect(m.renderer.disposeSpy).toHaveBeenCalledTimes(1);
  });
});
