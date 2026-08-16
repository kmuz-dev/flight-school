/**
 * `FoldEngine` end-to-end against fakes: no browser, no WebGL, no core math.
 * Everything the engine touches outside Three.js is injected, which is exactly
 * what makes the leak-prone parts (contexts, listeners, RAF) testable at all.
 */
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { gsap } from "gsap";
import { BufferGeometry, LineSegments, Mesh, Vector3 } from "three";
import { CAMERA_PRESETS, FoldEngine, floatPhase, orbitToPosition } from "@/engine/render/renderer";
import { STAGE_THEME } from "@/engine/render/sceneModel";
import { HERO_VIEW } from "@/engine/view";
import { PLANES } from "@/content";
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
      paperTextures: Promise.resolve(null),
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

  it("calls onReady once the paper material is ready", async () => {
    const { container } = createFakeDom();
    const onReady = vi.fn();
    let resolvePaper!: (value: null) => void;
    const paperTextures = new Promise<null>((resolve) => {
      resolvePaper = resolve;
    });
    const engine = new FoldEngine(
      container as unknown as HTMLElement,
      makeStructure(2),
      { onReady },
      {
        core: createCoreStub(),
        paperTextures,
        rendererFactory: (c) => createFakeRenderer(c as unknown as FakeNode),
        controlsFactory: () => createFakeControls(),
      },
    );
    expect(onReady).not.toHaveBeenCalled();
    resolvePaper(null);
    await vi.waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
    engine.dispose();
  });

  it("reports failed material assets, keeps WebGL truthful, and readies the fallback", async () => {
    const { container } = createFakeDom();
    const onReady = vi.fn();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const engine = new FoldEngine(
      container as unknown as HTMLElement,
      makeStructure(2),
      { onReady },
      {
        core: createCoreStub(),
        paperTextures: Promise.reject(new Error("paper CDN unavailable")),
        rendererFactory: (c) => createFakeRenderer(c as unknown as FakeNode),
        controlsFactory: () => createFakeControls(),
      },
    );

    await vi.waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
    expect(engine.renderMode).toBe("webgl");
    expect(warn).toHaveBeenCalledWith(
      "[fold-engine] paper material unavailable, using procedural paper:",
      "paper CDN unavailable",
    );
    warn.mockRestore();
    engine.dispose();
  });

  it("disposes paper maps that finish loading after their renderer has gone", async () => {
    const { container } = createFakeDom();
    let resolvePaper!: (value: {
      albedo: import("three").Texture;
      normal: import("three").Texture;
      roughness: import("three").Texture;
    }) => void;
    const paperTextures = new Promise<{
      albedo: import("three").Texture;
      normal: import("three").Texture;
      roughness: import("three").Texture;
    }>((resolve) => {
      resolvePaper = resolve;
    });
    const textures = {
      albedo: new (await import("three")).Texture(),
      normal: new (await import("three")).Texture(),
      roughness: new (await import("three")).Texture(),
    };
    const disposals = Object.values(textures).map((texture) => vi.spyOn(texture, "dispose"));
    const engine = new FoldEngine(
      container as unknown as HTMLElement,
      makeStructure(2),
      {},
      {
        core: createCoreStub(),
        paperTextures,
        rendererFactory: (c) => createFakeRenderer(c as unknown as FakeNode),
        controlsFactory: () => createFakeControls(),
      },
    );

    engine.dispose();
    resolvePaper(textures);
    await paperTextures;
    await Promise.resolve();
    disposals.forEach((dispose) => expect(dispose).toHaveBeenCalledTimes(1));
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

/**
 * Where the plane sits this frame, read off the group matrix the way the GPU
 * would.
 *
 * The placement rotates about `target`, so transforming that point recovers
 * the drift and the height alone with no bank term mixed in.
 */
function placementOf(m: Mounted, nowMs = 0): {
  drift: number;
  height: number;
  bankRad: number;
} {
  m.engine.renderFrame(nowMs);
  const pivot = m.engine["target"] as Vector3;
  const matrix = m.engine["model"].root.matrix;
  const moved = pivot.clone().applyMatrix4(matrix);
  const e = matrix.elements;
  return {
    drift: moved.x - pivot.x,
    height: moved.z - pivot.z,
    bankRad: Math.atan2(e[8]!, e[0]!),
  };
}

/** Height above the neutral lift: the bob alone. */
function bobOf(m: Mounted, nowMs: number): number {
  return placementOf(m, nowMs).height - (m.engine["liftMm"] as number);
}

describe("FoldEngine display staging", () => {
  it("identifies the live renderer truthfully", () => {
    expect(mount().engine.renderMode).toBe("webgl");
  });

  /**
   * A hangar card is a 3:2 decoration and six of them share one phone. None of
   * this is visible in anything a card renders, so nothing else would catch a
   * regression until the hangar was slow on a real device.
   */
  it("builds no floor and no depth pass, at either quality tier", () => {
    for (const quality of ["preview", "full"] as const) {
      const { engine } = mount({ engine: { display: true, quality } });
      // Not hidden - never built. It is a 4000mm plane carrying the most
      // expensive shader compile this scene does.
      expect(engine["floorMesh"]).toBeNull();
      expect(engine["floorMaterial"]).toBeNull();
      expect(engine["scene"].getObjectByName("stage-floor")).toBeUndefined();
      // A shadow map would land on nothing once the floor is gone.
      expect(engine["keyLight"].castShadow).toBe(false);
      expect(engine["shadow"]).not.toBeNull();
      expect(engine["scene"].getObjectByName("contact-shadow")).toBeDefined();
    }
  });

  it("keeps the graph-paper floor for a tutorial, and grows no backdrop", () => {
    const { engine } = mount();
    expect(engine["floorMesh"]).not.toBeNull();
    expect(engine["backdrop"]).toBeNull();
    expect(engine["shadow"]).toBeNull();
  });

  /**
   * The Hangar bay's ground is a photograph, and a stage that paints its own
   * replaced that room with a field of cream - taking the composition, the
   * legibility of the white type over it, and the point of the screen with it.
   *
   * The contact shadow still has to be there: a transparent stage is an
   * aircraft standing on something, not a cut-out floating over the page.
   */
  it("paints no ground at all when the caller owns what is behind the canvas", () => {
    const { engine, quality } = mount({
      engine: { display: true, quality: "preview", transparent: true },
    });
    expect(engine["scene"].background).toBeNull();
    expect(engine["backdrop"]).toBeNull();
    expect(engine["shadow"]).not.toBeNull();
    expect(quality).toBe("preview");
  });

  it("still paints its own ground when nobody asked for transparency", () => {
    const { engine } = mount({ engine: { display: true } });
    expect(engine["scene"].background).not.toBeNull();
    expect(engine["backdrop"]).not.toBeNull();
  });

  it("asks for an alpha buffer only when it is going to use one", () => {
    const asked: boolean[] = [];
    for (const transparent of [true, false]) {
      const { container } = createFakeDom(800, 600);
      const engine = new FoldEngine(
        container as unknown as HTMLElement,
        makeStructure(4),
        { display: true, transparent },
        {
          core: createCoreStub(),
          paperTextures: Promise.resolve(null),
          rendererFactory: (c, _quality, isTransparent) => {
            asked.push(isTransparent);
            return createFakeRenderer(c as unknown as FakeNode);
          },
          controlsFactory: () => createFakeControls(),
        },
      );
      engine.dispose();
    }
    // An alpha buffer costs bandwidth on every frame of every tutorial that
    // will never once see through its own canvas.
    expect(asked).toEqual([true, false]);
  });

  /**
   * The hangar's LRU wakes and sleeps scenes constantly, so a texture leaked
   * per wake is not hypothetical - it is one per hover.
   */
  it("disposes the backdrop with the stage", () => {
    const m = mount({ engine: { display: true } });
    live.splice(live.indexOf(m), 1);
    const backdrop = m.engine["backdrop"] as { dispose: () => void } | null;
    expect(backdrop).not.toBeNull();
    const spy = vi.spyOn(backdrop!, "dispose");
    m.engine.dispose();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  /**
   * The hero angle is deliberately NOT a `cameraPreset`: presets are authored
   * into fold steps, and no step may ask for the angle a finished aircraft is
   * photographed from. A display stage carries it itself.
   */
  it("opens on the hero angle without being asked, and a pin still beats it", () => {
    const { engine } = mount({ engine: { display: true } });
    expect(engine["orbit"].azimuthDeg).toBe(HERO_VIEW.azimuthDeg);
    expect(engine["orbit"].elevationDeg).toBe(HERO_VIEW.elevationDeg);

    const pinned = mount({
      engine: {
        display: true,
        displayView: { azimuthDeg: 118, elevationDeg: 37 },
        cameraPreset: "top",
      },
    });
    expect(pinned.engine["orbit"].azimuthDeg).toBe(CAMERA_PRESETS.top.azimuthDeg);
    expect(pinned.engine["orbit"].elevationDeg).toBe(CAMERA_PRESETS.top.elevationDeg);

    // And a fold step's own hint never moves a display stage off it.
    const { engine: held } = mount({ engine: { display: true }, steps: 4 });
    held.gotoStep(2, { animate: false });
    expect(held["orbit"].azimuthDeg).toBe(HERO_VIEW.azimuthDeg);
  });

  it("holds a supplied aircraft display view across step changes", () => {
    const displayView = { azimuthDeg: 118, elevationDeg: 37 };
    const { engine } = mount({ engine: { display: true, displayView }, steps: 4 });
    expect(engine["orbit"].azimuthDeg).toBe(displayView.azimuthDeg);
    expect(engine["orbit"].elevationDeg).toBe(displayView.elevationDeg);

    engine.gotoStep(2, { animate: false });
    expect(engine["orbit"].azimuthDeg).toBe(displayView.azimuthDeg);
    expect(engine["orbit"].elevationDeg).toBe(displayView.elevationDeg);
  });

  it("makes display imply the same geometry-derived rest used by SVG", () => {
    const { engine, core } = mount({ engine: { display: true, rest: false } });

    expect(engine["rest"]).toBe(true);
    expect(core.calls.some((call) => call.fn === "restTransform")).toBe(true);
  });

  it("frames the ground the shadow lands on, not just the lifted plane", () => {
    const { engine } = mount({ engine: { display: true } });
    // Neutral lift is a fraction of the radius, so it is never zero for a
    // stage with a model in it.
    expect(engine["liftMm"]).toBeGreaterThan(0);
    const shadow = engine["shadow"] as { mesh: { position: Vector3 } };
    // The pool sits on the ground plane while the plane is well above it.
    expect(shadow.mesh.position.z).toBeLessThan(engine["liftMm"] as number);
  });
});

describe("FoldEngine float", () => {
  /**
   * A stable per-plane phase, not `Math.random`: two cards must never breathe
   * together, and a card the LRU evicted and re-woke must breathe the same way
   * it did before, or the eye is drawn to exactly the thing meant to be
   * unremarkable.
   */
  it("gives the six real planes six distinct phases, and repeats them", () => {
    const ids = Object.keys(PLANES);
    expect(ids.length).toBeGreaterThanOrEqual(6);
    const phases = ids.map((id) => floatPhase(id));
    expect(new Set(phases).size).toBe(ids.length);
    for (const p of phases) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(1);
    }
    expect(ids.map((id) => floatPhase(id))).toEqual(phases);
  });

  /**
   * A function of the rAF timestamp, not of frame count. Driven by a counter,
   * a backgrounded tab would resume mid-stride and a slow frame would slow the
   * breathing down with it.
   */
  it("is a function of injected time, not of how many frames have run", () => {
    const m = mount({ engine: { display: true } });
    const a = placementOf(m, 1234);
    for (let i = 0; i < 20; i += 1) m.engine.renderFrame(9999);
    const b = placementOf(m, 1234);
    expect(b.height).toBeCloseTo(a.height, 12);
    expect(b.drift).toBeCloseTo(a.drift, 12);
    expect(b.bankRad).toBeCloseTo(a.bankRad, 12);
  });

  it("repeats the bob every 4 seconds and the sway every 6.5", () => {
    const m = mount({ engine: { display: true } });
    const t0 = 500;
    expect(bobOf(m, t0 + 4000)).toBeCloseTo(bobOf(m, t0), 9);
    // Half a period is the opposite displacement, which is what proves the
    // period is 4s rather than some divisor of it.
    expect(bobOf(m, t0 + 2000)).toBeCloseTo(-bobOf(m, t0), 9);
    expect(placementOf(m, t0 + 6500).drift).toBeCloseTo(placementOf(m, t0).drift, 9);
    expect(bobOf(m, t0)).not.toBeCloseTo(0, 6);
  });

  /**
   * Amplitudes are fractions of the bounding radius, never millimetres:
   * `framingDistance` fits the frame to that same radius, so the motion has to
   * subtend the same angle on a 179mm Square Cruiser and a 310mm Dart or the
   * small planes would look like they were barely moving.
   */
  it("scales with the model, so every card breathes by the same angle", () => {
    const small = mount({ engine: { display: true }, steps: 2 });
    const large = mount({ engine: { display: true }, steps: 9 });
    large.engine.gotoStep(8, { animate: false });

    const rSmall = small.engine["modelRadius"] as number;
    const rLarge = large.engine["modelRadius"] as number;
    expect(rLarge / rSmall).toBeGreaterThan(1.5);

    // Same plane id, so same phase: the two bobs differ by exactly the radius.
    const t = 900;
    expect(bobOf(large, t) / rLarge).toBeCloseTo(bobOf(small, t) / rSmall, 12);
    expect(placementOf(large, t).drift / rLarge).toBeCloseTo(
      placementOf(small, t).drift / rSmall,
      12,
    );
    // The bank is an angle already, so it does NOT scale.
    expect(placementOf(large, t).bankRad).toBeCloseTo(placementOf(small, t).bankRad, 12);
  });

  /** The bank is the derivative of the drift: the plane rolls into its slide. */
  it("banks into the drift rather than wobbling against it", () => {
    const m = mount({ engine: { display: true } });
    let seen = 0;
    for (let ms = 0; ms < 6500; ms += 130) {
      const before = placementOf(m, ms).drift;
      const after = placementOf(m, ms + 60).drift;
      const bank = placementOf(m, ms + 30).bankRad;
      if (Math.abs(after - before) < 1e-6) continue;
      seen += 1;
      expect(Math.sign(bank)).toBe(-Math.sign(after - before));
    }
    expect(seen).toBeGreaterThan(20);
  });

  /**
   * The staging is not motion. A cadet with the setting on gets a still
   * photograph of the same scene, not a plane back on the ground.
   */
  it("holds still under reduced motion but stays lifted", () => {
    const m = mount({ reducedMotion: true, engine: { display: true } });
    const lift = m.engine["liftMm"] as number;
    expect(lift).toBeGreaterThan(0);
    for (const ms of [0, 700, 3300, 12_000]) {
      const p = placementOf(m, ms);
      expect(p.height).toBeCloseTo(lift, 9);
      expect(p.drift).toBe(0);
      expect(p.bankRad).toBe(0);
    }
    // A still shadow is the shadow the theme names, not a faint one.
    expect((m.engine["shadow"] as { opacity: number }).opacity).toBeCloseTo(
      STAGE_THEME.shadowOpacity,
      9,
    );
  });

  it("fades the shadow as the plane rises, so the lift does not read as a zoom", () => {
    const m = mount({ engine: { display: true } });
    const shadow = m.engine["shadow"] as { opacity: number };

    let highest = { bob: -Infinity, opacity: 0 };
    let lowest = { bob: Infinity, opacity: 0 };
    for (let ms = 0; ms <= 4000; ms += 25) {
      const bob = bobOf(m, ms);
      if (bob > highest.bob) highest = { bob, opacity: shadow.opacity };
      if (bob < lowest.bob) lowest = { bob, opacity: shadow.opacity };
    }
    expect(highest.bob).toBeGreaterThan(0);
    expect(lowest.bob).toBeLessThan(0);
    expect(highest.opacity).toBeLessThan(lowest.opacity);
  });

  it("never breathes on a tutorial stage, even once the plane is lifted", () => {
    const m = mount({ steps: 3 });
    m.engine.gotoStep(2, { animate: false });
    const lift = m.engine["liftMm"] as number;
    expect(lift).toBeGreaterThan(0);
    // A cadet is about to be handed a certificate, not a screensaver.
    expect(placementOf(m, 0).height).toBeCloseTo(lift, 9);
    expect(placementOf(m, 2100).height).toBeCloseTo(lift, 9);
    expect(placementOf(m, 2100).drift).toBe(0);
  });
});

describe("FoldEngine closing lift", () => {
  it("leaves the table on the last step and nowhere else", () => {
    const m = mount({ steps: 4 });
    m.engine.gotoStep(2, { animate: false });
    expect(placementOf(m, 0).height).toBe(0);

    m.engine.gotoStep(3, { animate: false });
    const lift = m.engine["liftMm"] as number;
    expect(lift).toBeGreaterThan(0);
    // The no-animate path is how a resumed cadet arrives: fully lifted, no tween.
    expect(m.engine["liftProgress"]).toBe(1);
    expect(m.engine["liftTween"]).toBeNull();
    expect(placementOf(m, 0).height).toBeCloseTo(lift, 9);

    // Stepping back is folding again.
    m.engine.gotoStep(2, { animate: false });
    expect(m.engine["liftProgress"]).toBe(0);
    expect(placementOf(m, 0).height).toBe(0);
  });

  it("eases up when the last fold plays out, and snaps down on a backward scrub", () => {
    const m = mount({ steps: 3 });
    m.engine.gotoStep(2);
    m.engine.timeline.progress(1);
    expect(m.engine["liftProgress"]).toBeGreaterThanOrEqual(0);
    expect(m.engine["liftTween"]).not.toBeNull();

    // The cadet owns the playhead while dragging; a 0.9s ease chasing a drag
    // feels broken, so this snaps.
    m.engine.timeline.progress(0.4);
    expect(m.engine["liftProgress"]).toBe(0);
    expect(m.engine["liftTween"]).toBeNull();
  });

  it("snaps under reduced motion rather than easing", () => {
    const m = mount({ steps: 3, reducedMotion: true });
    m.engine.gotoStep(2);
    m.engine.timeline.progress(1);
    expect(m.engine["liftProgress"]).toBe(1);
    expect(m.engine["liftTween"]).toBeNull();
  });

  it("kills the lift tween on dispose", () => {
    const m = mount({ steps: 3 });
    live.splice(live.indexOf(m), 1);
    m.engine.gotoStep(2);
    m.engine.timeline.progress(1);
    const tween = m.engine["liftTween"] as { isActive: () => boolean } | null;
    expect(tween).not.toBeNull();
    m.engine.dispose();
    expect(tween!.isActive()).toBe(false);
  });
});

describe("FoldEngine render activity", () => {
  it("suspends and resumes one RAF chain idempotently", () => {
    const { engine, view } = mount();
    expect(view.requestAnimationFrame).toHaveBeenCalledTimes(1);

    engine.setRenderActive(false);
    expect(view.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    engine.setRenderActive(false);
    expect(view.cancelAnimationFrame).toHaveBeenCalledTimes(1);

    engine.setRenderActive(true);
    expect(view.requestAnimationFrame).toHaveBeenCalledTimes(2);
    engine.setRenderActive(true);
    expect(view.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it("paints a changed step once while inactive without changing timeline pause state", () => {
    const { engine, renderer } = mount();
    engine.timeline.pause();
    engine.setRenderActive(false);
    const before = renderer.renderCount();

    engine.gotoStep(2, { animate: false });

    expect(renderer.renderCount()).toBe(before + 1);
    expect(engine.timeline.paused).toBe(true);
  });

  it("can be disposed while inactive and remains inert", () => {
    const m = mount();
    live.splice(live.indexOf(m), 1);
    m.engine.setRenderActive(false);
    m.engine.dispose();

    expect(() => {
      m.engine.setRenderActive(true);
      m.engine.gotoStep(2);
      m.engine.replay();
    }).not.toThrow();
    expect(m.view.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(m.renderer.disposeSpy).toHaveBeenCalledTimes(1);
  });
});

describe("FoldEngine camera", () => {
  it("constrains orbit and zoom while leaving pan disabled", () => {
    const { controls } = mount({ engine: { display: true } });
    expect(controls.enablePan).toBe(false);
    expect(controls.minPolarAngle!).toBeGreaterThan(0);
    expect(controls.maxPolarAngle!).toBeLessThan(Math.PI / 2);
    expect(controls.minDistance!).toBeGreaterThan(0);
    expect(controls.maxDistance!).toBeGreaterThan(controls.minDistance!);
  });

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

  it("resets a dragged display camera to its authored view, target, and fitted distance", () => {
    const displayView = { azimuthDeg: 121, elevationDeg: 31 };
    const { engine, controls } = mount({
      reducedMotion: true,
      engine: { display: true, displayView },
    });
    const authoredTarget = engine["target"].clone();
    const fittedDistance = engine["defaultDistance"] as number;
    controls.target.set(400, -300, 200);
    engine["camera"].position.set(-900, 800, 100);

    engine.resetView();

    expect(controls.target.toArray()).toEqual(authoredTarget.toArray());
    expect(engine["camera"].position.distanceTo(authoredTarget)).toBeCloseTo(fittedDistance, 5);
    const expected = orbitToPosition(
      { ...displayView, distance: 1 },
      new Vector3(),
    ).normalize();
    const actual = engine["camera"].position.clone().sub(authoredTarget).normalize();
    expect(actual.x).toBeCloseTo(expected.x, 5);
    expect(actual.y).toBeCloseTo(expected.y, 5);
    expect(actual.z).toBeCloseTo(expected.z, 5);
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
