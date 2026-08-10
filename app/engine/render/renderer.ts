/**
 * The WebGL stage: renderer, scene, camera, lighting, graph-paper floor,
 * OrbitControls and the frame loop. Implements `FoldEngineHandle`.
 *
 * World space is the core's TABLE space: the table is z=0 and +Z is up, so pose
 * matrices from `@/engine/core/pose` go straight into `Mesh.matrix` with no
 * re-basing. Units are millimetres throughout.
 *
 * Zero React. All DOM access goes through `container.ownerDocument` and its
 * `defaultView`, which keeps the class testable headlessly and correct inside
 * iframes.
 */
import { gsap } from "gsap";
import {
  ACESFilmicToneMapping,
  Color,
  type DataTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Camera,
  type MeshStandardMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type {
  AnnotationAnchor,
  CameraHint,
  EngineEvent,
  EngineOptions,
  FoldEngineHandle,
  FoldState,
  FoldStep,
} from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { HERO_VIEW } from "@/engine/view";
import type { CoreApi, PoseMap } from "./coreApi";
import { Annotations, annotationChanged } from "./annotations";
import {
  ContactShadow,
  SceneModel,
  createBackdropTexture,
  createStageFloorMaterial,
  displayBounds,
  stageTheme,
  unionBounds,
  type ModelBounds,
  type StageTheme,
  type ThemeName,
} from "./sceneModel";
import { createStepTimeline, type StepTimeline } from "./timeline";

export type CameraPreset = NonNullable<CameraHint["preset"]>;

/**
 * Camera presets, per the engine spec. Azimuth is measured in the table plane
 * from +Y (the top of the sheet, where a plane's nose points) rotating toward
 * +X; elevation is measured up from the table.
 */
export const CAMERA_PRESETS: Readonly<
  Record<CameraPreset, { readonly azimuthDeg: number; readonly elevationDeg: number }>
> = {
  front: { azimuthDeg: 0, elevationDeg: 5 },
  threeQuarter: { azimuthDeg: -35, elevationDeg: 25 },
  top: { azimuthDeg: 0, elevationDeg: 85 },
};

export const DEFAULT_PRESET: CameraPreset = "threeQuarter";

/** Never look from under the table, never sit exactly on the +Z pole. */
export const MIN_ELEVATION_DEG = 2;
export const MAX_ELEVATION_DEG = 88;

export type Orbit = {
  readonly azimuthDeg: number;
  readonly elevationDeg: number;
  readonly distance: number;
};

/** Orbit (azimuth/elevation/distance about `target`) -> world position. */
export function orbitToPosition(orbit: Orbit, target: Vector3, out = new Vector3()): Vector3 {
  const az = MathUtils.degToRad(orbit.azimuthDeg);
  const el = MathUtils.degToRad(
    MathUtils.clamp(orbit.elevationDeg, MIN_ELEVATION_DEG, MAX_ELEVATION_DEG),
  );
  const horizontal = Math.cos(el) * orbit.distance;
  return out.set(
    target.x + Math.sin(az) * horizontal,
    target.y + Math.cos(az) * horizontal,
    target.z + Math.sin(el) * orbit.distance,
  );
}

/** Inverse of `orbitToPosition`, used to read back a user-dragged camera. */
export function positionToOrbit(position: Vector3, target: Vector3): Orbit {
  const dx = position.x - target.x;
  const dy = position.y - target.y;
  const dz = position.z - target.z;
  const distance = Math.max(Math.hypot(dx, dy, dz), 1e-6);
  return {
    azimuthDeg: MathUtils.radToDeg(Math.atan2(dx, dy)),
    elevationDeg: MathUtils.radToDeg(Math.asin(MathUtils.clamp(dz / distance, -1, 1))),
    distance,
  };
}

/**
 * Fold a step's optional `CameraHint` over the current orbit. A hint may name a
 * preset, override individual angles, or both; anything it omits is inherited.
 */
export function resolveCameraHint(
  hint: CameraHint | undefined,
  current: Orbit,
  defaultDistance: number,
): Orbit {
  const base = hint?.preset ? CAMERA_PRESETS[hint.preset] : current;
  const distance = hint?.distance ?? (hint?.preset ? defaultDistance : current.distance);
  return {
    azimuthDeg: hint?.azimuthDeg ?? base.azimuthDeg,
    elevationDeg: MathUtils.clamp(
      hint?.elevationDeg ?? base.elevationDeg,
      MIN_ELEVATION_DEG,
      MAX_ELEVATION_DEG,
    ),
    distance,
  };
}

/**
 * Distance at which a sphere of `radius` fills the frame with a little air.
 *
 * A sphere, not the model's box, because every stage here says DRAG TO ORBIT: a
 * distance fitted to the silhouette at one angle clips as soon as the cadet
 * turns the plane, and a dart is 57mm across and 310mm long, so nose-on and
 * side-on differ by more than five times. Framing the bounding sphere is the
 * only answer that is safe from every angle.
 *
 * It costs some frame. The tightest orbit-safe distance - the cylinder the model
 * sweeps as it turns, solved across the whole elevation band - came out 12%
 * nearer than this on the finished Dart, which is not worth solving for. What it
 * does mean is that a preset looking down the long axis (the Dart's last steps
 * ask for `front`, to show the wing V) shows a small plane, and no framing maths
 * fixes that: it is the shape, seen end-on.
 */
export function framingDistance(radius: number, fovDeg: number, aspect: number): number {
  const vertical = radius / Math.sin(MathUtils.degToRad(fovDeg) / 2);
  const widen = aspect < 1 ? 1 / Math.max(aspect, 0.35) : 1;
  return vertical * 1.15 * widen;
}

/** The slice of `WebGLRenderer` the stage actually drives. */
export type RendererLike = {
  domElement: HTMLCanvasElement;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  setPixelRatio(value: number): void;
  render(scene: Scene, camera: Camera): void;
  dispose(): void;
  forceContextLoss?: () => void;
};

/** The slice of `OrbitControls` the stage actually drives. */
export type ControlsLike = {
  target: Vector3;
  enabled: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  update(delta?: number): boolean | void;
  dispose(): void;
};

export type FoldEngineDeps = {
  readonly core: CoreApi;
  readonly rendererFactory?: (canvas: HTMLCanvasElement, quality: StageQuality) => RendererLike;
  readonly controlsFactory?: (camera: PerspectiveCamera, dom: HTMLElement) => ControlsLike;
};

const FOV_DEG = 34;
const CAMERA_TWEEN_SECONDS = 0.7;

/**
 * Neutral height of a display stage's aircraft, as a fraction of the model's
 * bounding radius rather than millimetres - `framingDistance` fits the frame to
 * that same radius, so a height expressed this way subtends the same angle on a
 * 179mm Square Cruiser as on a 310mm Dart, and reads identically on both cards.
 */
const DISPLAY_LIFT = 0.3;

/**
 * The idle float, in fractions of the model's bounding radius rather than
 * millimetres, for the same reason as `DISPLAY_LIFT`.
 *
 * 4 and 6.5 seconds are close to 8:13, so the compound path takes about 26
 * seconds to repeat and reads as drift rather than as a loop.
 */
const FLOAT = {
  /** Vertical amplitude. */
  bob: 0.06,
  /** Lateral amplitude. */
  drift: 0.035,
  /** Degrees of roll at the extremes of the drift. */
  bankDeg: 5,
  bobSeconds: 4,
  swaySeconds: 6.5,
} as const;

/** How long the finished plane takes to leave the table on the last step. */
const LIFT_SECONDS = 0.9;

/**
 * A stable per-plane phase in [0, 1), FNV-1a over the plane id.
 *
 * Not `Math.random`: two cards must never breathe together, which random gives,
 * but a card must also breathe the SAME way every time it wakes, which random
 * does not - the hangar's LRU evicts and re-wakes scenes constantly, and a
 * plane that jumped to a new phase on every wake would draw the eye to exactly
 * the thing the float is meant to make unremarkable.
 */
export function floatPhase(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 1024) / 1024;
}

export type StageQuality = NonNullable<EngineOptions["quality"]>;

/**
 * The cost knobs, in one table so the two tiers can be compared at a glance.
 * Everything here is fill-rate: at the two-scene ceiling on a throttled phone,
 * frame time tracked pixel count almost linearly, so the pixel ratio is the
 * lever that matters and multisampling and shadow mapping ride along with it.
 */
const QUALITY: Record<StageQuality, { antialias: boolean; shadows: boolean; maxPixelRatio: number }> =
  {
    full: { antialias: true, shadows: true, maxPixelRatio: 2 },
    preview: { antialias: false, shadows: false, maxPixelRatio: 1 },
  };

export function createDefaultRenderer(
  canvas: HTMLCanvasElement,
  quality: StageQuality = "full",
): RendererLike {
  const tier = QUALITY[quality];
  const renderer = new WebGLRenderer({
    canvas,
    antialias: tier.antialias,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = tier.shadows;
  renderer.shadowMap.type = PCFSoftShadowMap;
  return renderer;
}

export function createDefaultControls(
  camera: PerspectiveCamera,
  dom: HTMLElement,
): ControlsLike {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.rotateSpeed = 0.75;
  controls.zoomSpeed = 0.8;
  // Up is +Z, so polar 0 is straight overhead and PI/2 is the horizon.
  controls.minPolarAngle = MathUtils.degToRad(90 - MAX_ELEVATION_DEG);
  controls.maxPolarAngle = MathUtils.degToRad(90 - MIN_ELEVATION_DEG);
  return controls;
}

type Listener = (payload: unknown) => void;

export class FoldEngine implements FoldEngineHandle {
  private readonly core: CoreApi;
  private readonly structure: PlaneStructure;
  private readonly theme: StageTheme;
  private readonly themeName: ThemeName;
  private readonly quality: StageQuality;

  private readonly container: HTMLElement;
  private readonly view: (Window & typeof globalThis) | null;
  private readonly renderer: RendererLike;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly controls: ControlsLike;
  private readonly model: SceneModel;
  private readonly annotations: Annotations;
  private readonly stage = new Group();

  /** Null on a display stage, which has a backdrop and a shadow instead. */
  private readonly floorMesh: Mesh | null;
  private readonly floorMaterial: MeshStandardMaterial | null;
  private readonly backdrop: DataTexture | null;
  private readonly shadow: ContactShadow | null;
  /** Neutral height above the ground, in mm. Zero on a tutorial stage. */
  private liftMm = 0;
  /**
   * How much of the lift is in effect, 0 to 1. Display surfaces start at 1 and
   * never move it; a tutorial starts at 0 and tweens to 1 when the last fold
   * settles, which is the beat that hands off to the CERTIFIED stamp.
   */
  private liftProgress: number;
  private liftTween: ReturnType<typeof gsap.to> | null = null;
  /** True when the model group holds no placement, so a still stage writes once. */
  private placementNeutral = true;
  private readonly startMs: number;
  private readonly bobPhase: number;
  private readonly swayPhase: number;
  private readonly keyLight: DirectionalLight;
  private readonly fillLight: DirectionalLight;
  private readonly rimLight: DirectionalLight;
  private readonly hemiLight: HemisphereLight;

  private readonly listeners = new Map<EngineEvent, Set<Listener>>();
  private readonly stateCache = new Map<number, FoldState>();

  private stepIndex = 0;
  private stepTimeline: StepTimeline | null = null;
  private cameraTween: ReturnType<typeof gsap.to> | null = null;
  private orbit: Orbit;
  /** Set on a display surface; overrides every step's own camera hint. */
  private readonly pinnedPreset: CameraPreset | undefined;
  /** Stand the model up once it has a bend. See EngineOptions.rest. */
  private readonly rest: boolean;
  /** Present a finished aircraft rather than a table. See EngineOptions.display. */
  private readonly display: boolean;
  private readonly target = new Vector3();
  /** What the current step spans, so a resize re-frames the same geometry. */
  private stepBounds: ModelBounds | null = null;
  private defaultDistance = 420;
  private modelRadius = 150;
  private modelTopZ = 0;

  private width = 0;
  private height = 0;
  private raf = 0;
  private disposed = false;
  private lastAnnotation: AnnotationAnchor | null = null;
  private readonly reducedMotion: boolean;

  private resizeObserver: ResizeObserver | null = null;
  private readonly onPointerDown = (): void => this.killCameraTween();
  private readonly onContextLost = (event: Event): void => {
    event.preventDefault();
    this.emit("webglLost", undefined);
  };
  private readonly onWindowResize = (): void => this.resize();

  constructor(
    container: HTMLElement,
    structure: PlaneStructure,
    opts: EngineOptions,
    deps: FoldEngineDeps,
  ) {
    this.container = container;
    this.structure = structure;
    this.core = deps.core;
    this.themeName = opts.theme === "night" ? "night" : "paper";
    this.theme = stageTheme(this.themeName);
    // Read before anything is built: these decide what the stage IS, and the
    // scene furniture below branches on them.
    this.rest = opts.rest === true;
    this.display = opts.display === true;
    // A display surface is already showing a finished aircraft; only a tutorial
    // has a fold to finish first.
    this.liftProgress = this.display ? 1 : 0;
    this.startMs = 0;
    const phase = floatPhase(structure.id);
    this.bobPhase = 2 * Math.PI * phase;
    // Golden-ratio decorrelated, so one plane's two terms are not locked to
    // each other either.
    this.swayPhase = 2 * Math.PI * ((phase * 1.618033988749895) % 1);

    const doc = container.ownerDocument;
    this.view = doc.defaultView as (Window & typeof globalThis) | null;
    this.reducedMotion =
      this.view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

    const canvas = doc.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
    this.quality = opts.quality === "preview" ? "preview" : "full";
    this.renderer = (deps.rendererFactory ?? createDefaultRenderer)(canvas, this.quality);
    container.appendChild(this.renderer.domElement);

    // A display stage swaps the flat clear colour for a vertical grade. It has
    // to be drawn in GL: the canvas is `alpha: false`, so the CSS gradients on
    // the panels around it have never once shown through.
    this.backdrop = this.display ? createBackdropTexture(this.theme) : null;
    this.scene.background = this.backdrop ?? new Color(this.theme.background);
    this.scene.add(this.stage);

    this.camera = new PerspectiveCamera(FOV_DEG, 1, 1, 20000);
    // Table space is z=0 with +Z up; tell Three before OrbitControls is built.
    this.camera.up.set(0, 0, 1);
    this.pinnedPreset = opts.cameraPreset;
    // A display surface opens on the catalogue's hero angle, which is not a
    // preset and cannot be asked for by a fold step.
    this.orbit = {
      ...(this.display && !this.pinnedPreset
        ? HERO_VIEW
        : CAMERA_PRESETS[this.pinnedPreset ?? DEFAULT_PRESET]),
      distance: this.defaultDistance,
    };

    this.model = new SceneModel(this.theme);
    this.annotations = new Annotations(this.theme);
    this.stage.add(this.model.root, this.annotations.root);

    // Not built at all on a display stage rather than hidden: it is a 4000mm
    // plane carrying the most expensive shader compile this scene does, and a
    // hangar card would be paying for a grid nobody sees.
    if (this.display) {
      this.floorMaterial = null;
      this.floorMesh = null;
      this.shadow = new ContactShadow(this.theme);
      this.stage.add(this.shadow.mesh);
    } else {
      const floorSpan = 4000;
      this.floorMaterial = createStageFloorMaterial(this.theme, floorSpan * 0.42);
      this.floorMesh = new Mesh(new PlaneGeometry(floorSpan, floorSpan), this.floorMaterial);
      this.floorMesh.position.z = -1.5;
      this.floorMesh.receiveShadow = true;
      this.floorMesh.name = "stage-floor";
      this.stage.add(this.floorMesh);
      this.shadow = null;
    }

    this.hemiLight = new HemisphereLight(
      new Color(this.theme.hemiSky),
      new Color(this.theme.hemiGround),
      this.theme.hemiIntensity,
    );
    this.keyLight = new DirectionalLight(new Color(this.theme.keyColor), this.theme.keyIntensity);
    // A display stage has nothing to receive a shadow map - the floor is gone
    // and the contact shadow is drawn, not cast. Without this the Preflight
    // hero, which runs at "full", would pay for a 1024-square depth pass that
    // lands on nothing AND look different from a hangar card, which cannot
    // afford one at all.
    this.keyLight.castShadow = QUALITY[this.quality].shadows && !this.display;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.bias = -0.0008;
    this.keyLight.shadow.normalBias = 0.6;
    this.fillLight = new DirectionalLight(
      new Color(this.theme.fillColor),
      this.theme.fillIntensity,
    );
    this.rimLight = new DirectionalLight(new Color(this.theme.rimColor), this.theme.rimIntensity);
    this.scene.add(
      this.hemiLight,
      this.keyLight,
      this.keyLight.target,
      this.fillLight,
      this.rimLight,
    );

    this.controls = (deps.controlsFactory ?? createDefaultControls)(
      this.camera,
      this.renderer.domElement,
    );
    // A display surface turns on the spot; a tutorial stage never does, because
    // a moving camera during a fold makes it impossible to see what moved.
    this.controls.autoRotate = opts.autoRotate === true && !this.reducedMotion;
    this.controls.autoRotateSpeed = 0.6;

    // User intent beats any scripted camera move.
    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown, {
      capture: true,
      passive: true,
    });
    this.renderer.domElement.addEventListener("wheel", this.onPointerDown, { passive: true });
    this.renderer.domElement.addEventListener("webglcontextlost", this.onContextLost, false);

    const engine = this;
    this.timeline = {
      play(): void {
        engine.annotations.setVisible(true);
        engine.stepTimeline?.play();
      },
      pause(): void {
        engine.stepTimeline?.pause();
      },
      progress(v?: number): number {
        return engine.stepTimeline?.progress(v) ?? 0;
      },
      get duration(): number {
        return engine.stepTimeline?.duration ?? 0;
      },
      get paused(): boolean {
        return engine.stepTimeline?.paused ?? true;
      },
    };

    this.observeSize();
    this.resize();
    this.setStep(0, "start");
    this.snapCamera(this.orbit);
    this.startLoop();
    opts.onReady?.();
  }

  // --- FoldEngineHandle -----------------------------------------------------

  gotoStep(n: number, opts?: { animate?: boolean }): void {
    if (this.disposed) return;
    const animate = opts?.animate !== false;
    this.setStep(n, animate ? "play" : "end");
  }

  replay(): void {
    if (this.disposed) return;
    this.annotations.setVisible(true);
    this.stepTimeline?.restart();
  }

  readonly timeline: FoldEngineHandle["timeline"];

  setCameraPreset(preset: CameraPreset): void {
    if (this.disposed) return;
    const next = resolveCameraHint({ preset }, this.orbit, this.defaultDistance);
    this.tweenCamera(next, true);
  }

  on(event: EngineEvent, cb: (payload: unknown) => void): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(cb);
    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  }

  resize(): void {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth || 0, 1);
    const height = Math.max(this.container.clientHeight || 0, 1);
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(
      Math.min(this.view?.devicePixelRatio ?? 1, QUALITY[this.quality].maxPixelRatio),
    );
    this.renderer.setSize(width, height, false);
    this.refit();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    if (this.raf !== 0) this.view?.cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.killCameraTween();
    this.liftTween?.kill();
    this.liftTween = null;
    this.stepTimeline?.kill();
    this.stepTimeline = null;

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.view?.removeEventListener("resize", this.onWindowResize);

    const dom = this.renderer.domElement;
    dom.removeEventListener("pointerdown", this.onPointerDown, { capture: true });
    dom.removeEventListener("wheel", this.onPointerDown);
    dom.removeEventListener("webglcontextlost", this.onContextLost, false);

    this.controls.dispose();
    this.model.dispose();
    this.annotations.dispose();
    this.floorMesh?.geometry.dispose();
    this.floorMaterial?.dispose();
    this.floorMesh?.removeFromParent();
    this.shadow?.dispose();
    // The hangar wakes and sleeps scenes constantly, so a texture leaked per
    // wake is a real leak rather than a theoretical one.
    this.backdrop?.dispose();
    this.keyLight.dispose();
    this.fillLight.dispose();
    this.rimLight.dispose();
    this.hemiLight.dispose();
    this.scene.clear();
    this.stage.clear();

    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
    dom.parentNode?.removeChild(dom);

    this.listeners.clear();
    this.stateCache.clear();
    this.lastAnnotation = null;
  }

  // --- internals ------------------------------------------------------------

  /** Fold state after steps `0..n`; `n < 0` is the fresh sheet. Memoised. */
  private stateAfter(n: number): FoldState {
    const index = Math.max(-1, Math.min(n, this.structure.steps.length - 1));
    const cached = this.stateCache.get(index);
    if (cached) return cached;
    const state = this.core.computeFoldState(this.structure, index);
    this.stateCache.set(index, state);
    return state;
  }

  private step(index: number): FoldStep | undefined {
    return this.structure.steps[index];
  }

  private setStep(n: number, mode: "start" | "play" | "end"): void {
    const index = Math.max(0, Math.min(n, Math.max(this.structure.steps.length - 1, 0)));
    this.stepIndex = index;

    const from = this.stateAfter(index - 1);
    const to = this.stateAfter(index);
    const step = this.step(index);
    const isLast = index === this.structure.steps.length - 1;

    this.stepTimeline?.kill();
    // Stepping anywhere puts the plane back on the table: a cadet who moves off
    // the last step is folding again. A display surface never leaves 1.
    if (!this.display) this.setLift(isLast && mode === "end" ? 1 : 0, false);
    // Build meshes from the post-step state: splits happen up front so the mesh
    // set never changes mid-animation, and pose keys stay stable.
    this.model.sync(to);
    // Before the measurements below, so the camera frames the model as it will
    // actually stand. Computed once per step and held for the whole step: it is
    // a property of the settled state, not of the frame.
    this.model.setRest(this.rest ? this.core.restTransform(to) : null);

    // Measure where the step ENDS before building the timeline, because building
    // it leaves the meshes posed where the step BEGINS. The camera is placed
    // once and holds for the whole step, so it has to frame both: measuring only
    // the start leaves the finished plane small (the Dart's last step starts
    // with the wings shut), and measuring only the end crops the larger sheet
    // the step opens on.
    this.model.applyPoses(this.core.posesForState(to));
    const settledBounds = this.model.computeBounds();

    const apply = (poses: PoseMap): void => this.model.applyPoses(poses);
    this.stepTimeline = createStepTimeline({
      core: this.core,
      structure: this.structure,
      stepIndex: index,
      settled: to,
      step,
      apply,
      reducedMotion: this.reducedMotion,
      onProgress: (t) => {
        this.annotations.setVisible(t < 1);
        // Scrubbing back off the end puts the plane down again, and snaps
        // rather than eases: the cadet owns the playhead while dragging, and a
        // 0.9s tween chasing a drag feels broken.
        if (t < 1 && this.liftProgress !== 0 && !this.display) this.setLift(0, false);
        this.emit("progress", t);
      },
      onComplete: () => {
        this.annotations.setVisible(false);
        // The plane is finished, so it leaves the table. Fires once whether the
        // end was reached by playback or by a scrub, which is the right rule
        // either way.
        if (isLast && !this.display) this.setLift(1, mode === "play");
        this.emit("stepComplete", index);
      },
    });

    // Measured at neutral height, then the lift is derived from it and the box
    // grown to include the ground the shadow lands on. Breaking the circularity
    // this way - lift is a fraction of the radius, radius is measured through
    // the lift - is what keeps the framing stable while the model breathes.
    const raw = unionBounds(this.model.computeBounds(), settledBounds);
    this.liftMm = this.display || isLast ? DISPLAY_LIFT * raw.radius : 0;
    this.refit(this.liftMm > 0 ? displayBounds(raw, this.liftMm) : raw);
    this.placeShadow(raw);
    this.setTargetCrease(step);
    this.annotations.setVisible(mode !== "end");

    if (mode === "end") this.stepTimeline.complete();
    else if (mode === "play") this.stepTimeline.play();

    // A display surface holds the hero angle whatever the step asked for; a
    // pinned preset beats both, and a tutorial follows the step's own hint.
    const hint: CameraHint | undefined = this.pinnedPreset
      ? { preset: this.pinnedPreset }
      : this.display
        ? { ...HERO_VIEW, distance: this.defaultDistance }
        : step?.camera;
    const next = resolveCameraHint(hint, this.orbit, this.defaultDistance);
    this.tweenCamera(next, mode !== "start");
  }

  /**
   * Re-aim the lights, floor fade and camera framing at `bounds`. A resize keeps
   * the step's own bounds and only re-solves the distance for the new aspect;
   * re-measuring there would frame whatever mid-fold pose happened to be showing.
   */
  private refit(bounds: ModelBounds = this.stepBounds ?? this.model.computeBounds()): void {
    this.stepBounds = bounds;
    this.target.copy(bounds.center);
    this.modelRadius = bounds.radius;
    this.modelTopZ = bounds.max.z;
    this.defaultDistance = framingDistance(bounds.radius, FOV_DEG, this.camera.aspect);
    this.controls.target.copy(this.target);

    const d = bounds.radius * 4;
    this.keyLight.position.set(
      this.target.x - d * 0.55,
      this.target.y - d * 0.75,
      this.target.z + d * 1.2,
    );
    this.keyLight.target.position.copy(this.target);
    this.keyLight.target.updateMatrixWorld();
    const shadow = this.keyLight.shadow.camera;
    const extent = bounds.radius * 1.8;
    shadow.left = -extent;
    shadow.right = extent;
    shadow.top = extent;
    shadow.bottom = -extent;
    shadow.near = 1;
    shadow.far = d * 3;
    shadow.updateProjectionMatrix();

    this.fillLight.position.set(
      this.target.x + d * 0.9,
      this.target.y + d * 0.3,
      this.target.z + d * 0.5,
    );
    this.rimLight.position.set(
      this.target.x + d * 0.2,
      this.target.y + d * 1.1,
      this.target.z + d * 0.25,
    );
  }

  /**
   * The display float, evaluated from the clock rather than tweened.
   *
   * One scalar drives the bob, the drift, the bank and the shadow's answer to
   * all three, so they cannot slide out of step with each other the way four
   * repeating tweens would - and there is no infinite tween to leak past
   * `dispose()`.
   *
   * The bank is the DERIVATIVE of the drift, so the plane rolls into the
   * direction it is sliding. That is what makes it read as a bank rather than a
   * wobble.
   */
  private updatePlacement(nowMs: number): void {
    const lifted = this.liftProgress > 0 || this.liftTween !== null;
    if (!this.display && !lifted) {
      // A tutorial mid-fold wants the model exactly where the poses put it.
      // Written once on the way down rather than every frame.
      if (!this.placementNeutral) {
        this.placementNeutral = true;
        this.model.setPlacement(this.target, 0, 0, 0);
      }
      return;
    }
    this.placementNeutral = false;

    const t = (nowMs - this.startMs) / 1000;
    // Only a display surface breathes. A tutorial lifts the finished plane and
    // then holds it: the cadet is about to be handed a certificate, not a
    // screensaver.
    const breathing = this.display && !this.reducedMotion ? 1 : 0;
    const r = this.modelRadius;

    const bob = breathing * FLOAT.bob * r * Math.sin((2 * Math.PI * t) / FLOAT.bobSeconds + this.bobPhase);
    const sway = (2 * Math.PI * t) / FLOAT.swaySeconds + this.swayPhase;
    const drift = breathing * FLOAT.drift * r * Math.sin(sway);
    const bankRad = -breathing * MathUtils.degToRad(FLOAT.bankDeg) * Math.cos(sway);

    const height = this.liftMm * this.liftProgress + bob;
    this.model.setPlacement(this.target, drift, height, bankRad);
    // -1 at the bottom of the bob, +1 at the top; zero amplitude reads as
    // neutral, which is what keeps a reduced-motion stage from a faint shadow.
    this.shadow?.follow(breathing === 0 || r === 0 ? 0 : bob / (FLOAT.bob * r));
  }

  /**
   * Take the plane off the table, or put it back.
   *
   * `animate` eases; a scrub or a step change snaps. Reduced motion always
   * snaps, exactly as the camera tween does - the staging is not motion, so a
   * cadet with the setting on still gets the lifted plane, just not the rise.
   */
  private setLift(to: number, animate: boolean): void {
    this.liftTween?.kill();
    this.liftTween = null;
    if (!animate || this.reducedMotion || this.liftProgress === to) {
      this.liftProgress = to;
      return;
    }
    const proxy = { v: this.liftProgress };
    this.liftTween = gsap.to(proxy, {
      v: to,
      duration: LIFT_SECONDS,
      ease: "power2.out",
      onUpdate: () => {
        this.liftProgress = proxy.v;
      },
      onComplete: () => {
        this.liftProgress = to;
        this.liftTween = null;
      },
    });
  }

  /**
   * Put the contact shadow under the model, offset along the direction the key
   * light actually points so it lands where the light says rather than looking
   * like a sticker. One source of truth for the lighting.
   */
  private placeShadow(bounds: ModelBounds): void {
    if (!this.shadow) return;
    const toLight = this.keyLight.position.clone().sub(this.target);
    const drop = toLight.z !== 0 ? this.liftMm / toLight.z : 0;
    this.shadow.fit(bounds, -toLight.x * drop, -toLight.y * drop, bounds.radius * 0.35);
  }

  private setTargetCrease(step: FoldStep | undefined): void {
    const action = step?.action;
    if (action?.type === "fold") {
      this.annotations.setTarget({
        line: action.crease,
        topZ: this.modelTopZ,
        span: this.modelRadius * 2.3,
        center: this.target,
      });
    } else {
      this.annotations.setTarget(null);
    }
    this.annotations.setFallbackAnchor(this.target, this.modelTopZ);
  }

  private snapCamera(orbit: Orbit): void {
    this.orbit = orbit;
    orbitToPosition(orbit, this.target, this.camera.position);
    this.camera.lookAt(this.target);
    this.controls.target.copy(this.target);
  }

  private tweenCamera(orbit: Orbit, animate: boolean): void {
    this.killCameraTween();
    if (!animate || this.reducedMotion) {
      this.snapCamera(orbit);
      return;
    }
    const current = positionToOrbit(this.camera.position, this.controls.target);
    // Take the short way round the table.
    let deltaAz = orbit.azimuthDeg - current.azimuthDeg;
    while (deltaAz > 180) deltaAz -= 360;
    while (deltaAz < -180) deltaAz += 360;

    const proxy = {
      azimuthDeg: current.azimuthDeg,
      elevationDeg: current.elevationDeg,
      distance: current.distance,
    };
    this.cameraTween = gsap.to(proxy, {
      azimuthDeg: current.azimuthDeg + deltaAz,
      elevationDeg: orbit.elevationDeg,
      distance: orbit.distance,
      duration: CAMERA_TWEEN_SECONDS,
      ease: "power2.inOut",
      onUpdate: () => {
        this.orbit = { ...proxy };
        orbitToPosition(this.orbit, this.target, this.camera.position);
        this.camera.lookAt(this.target);
      },
      onComplete: () => {
        this.orbit = orbit;
        this.cameraTween = null;
      },
    });
  }

  private killCameraTween(): void {
    if (!this.cameraTween) return;
    this.cameraTween.kill();
    this.cameraTween = null;
    this.orbit = positionToOrbit(this.camera.position, this.controls.target);
  }

  private observeSize(): void {
    const Observer = this.view?.ResizeObserver;
    if (typeof Observer === "function") {
      this.resizeObserver = new Observer(() => this.resize());
      this.resizeObserver.observe(this.container);
    } else {
      this.view?.addEventListener("resize", this.onWindowResize);
    }
  }

  private startLoop(): void {
    const view = this.view;
    if (!view || typeof view.requestAnimationFrame !== "function") return;
    const frame = (nowMs: number): void => {
      if (this.disposed) return;
      this.raf = view.requestAnimationFrame(frame);
      this.renderFrame(nowMs);
    };
    this.raf = view.requestAnimationFrame(frame);
  }

  /**
   * One frame: breathe, damping, draw, then report the label anchor if it moved.
   *
   * `nowMs` is the rAF timestamp. Optional so the existing tests that drive
   * frames by hand still compile, and so a test can hand it exact milliseconds
   * and assert the float is a function of time rather than of frame count.
   */
  renderFrame(nowMs = 0): void {
    if (this.disposed) return;
    this.updatePlacement(nowMs);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    const anchor = this.annotations.project(this.camera, this.width, this.height);
    if (annotationChanged(this.lastAnnotation, anchor)) {
      this.lastAnnotation = anchor;
      this.emit("annotation", anchor);
    }
  }

  private emit(event: EngineEvent, payload: unknown): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const cb of [...set]) cb(payload);
  }

  /** Current step index, for the shell's own bookkeeping and for tests. */
  get currentStep(): number {
    return this.stepIndex;
  }
}
