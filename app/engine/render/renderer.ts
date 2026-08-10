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
import type { CoreApi, PoseMap } from "./coreApi";
import { Annotations, annotationChanged } from "./annotations";
import {
  SceneModel,
  createStageFloorMaterial,
  stageTheme,
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

/** Distance at which a sphere of `radius` fills the frame with a little air. */
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

  private readonly floorMesh: Mesh;
  private readonly floorMaterial: MeshStandardMaterial;
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
  private readonly target = new Vector3();
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

    const doc = container.ownerDocument;
    this.view = doc.defaultView as (Window & typeof globalThis) | null;
    this.reducedMotion =
      this.view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

    const canvas = doc.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
    this.quality = opts.quality === "preview" ? "preview" : "full";
    this.renderer = (deps.rendererFactory ?? createDefaultRenderer)(canvas, this.quality);
    container.appendChild(this.renderer.domElement);

    this.scene.background = new Color(this.theme.background);
    this.scene.add(this.stage);

    this.camera = new PerspectiveCamera(FOV_DEG, 1, 1, 20000);
    // Table space is z=0 with +Z up; tell Three before OrbitControls is built.
    this.camera.up.set(0, 0, 1);
    this.orbit = { ...CAMERA_PRESETS[DEFAULT_PRESET], distance: this.defaultDistance };

    this.model = new SceneModel(this.theme);
    this.annotations = new Annotations(this.theme);
    this.stage.add(this.model.root, this.annotations.root);

    const floorSpan = 4000;
    this.floorMaterial = createStageFloorMaterial(this.theme, floorSpan * 0.42);
    this.floorMesh = new Mesh(new PlaneGeometry(floorSpan, floorSpan), this.floorMaterial);
    this.floorMesh.position.z = -1.5;
    this.floorMesh.receiveShadow = true;
    this.floorMesh.name = "stage-floor";
    this.stage.add(this.floorMesh);

    this.hemiLight = new HemisphereLight(
      new Color(this.theme.hemiSky),
      new Color(this.theme.hemiGround),
      this.theme.hemiIntensity,
    );
    this.keyLight = new DirectionalLight(new Color(this.theme.keyColor), this.theme.keyIntensity);
    this.keyLight.castShadow = QUALITY[this.quality].shadows;
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
    this.floorMesh.geometry.dispose();
    this.floorMaterial.dispose();
    this.floorMesh.removeFromParent();
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

    this.stepTimeline?.kill();
    // Build meshes from the post-step state: splits happen up front so the mesh
    // set never changes mid-animation, and pose keys stay stable.
    this.model.sync(to);

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
        this.emit("progress", t);
      },
      onComplete: () => {
        this.annotations.setVisible(false);
        this.emit("stepComplete", index);
      },
    });

    this.refit();
    this.setTargetCrease(step);
    this.annotations.setVisible(mode !== "end");

    if (mode === "end") this.stepTimeline.complete();
    else if (mode === "play") this.stepTimeline.play();

    const next = resolveCameraHint(step?.camera, this.orbit, this.defaultDistance);
    this.tweenCamera(next, mode !== "start");
  }

  /** Re-measure the model and re-aim the lights, floor fade and camera framing. */
  private refit(): void {
    const bounds = this.model.computeBounds();
    this.target.copy(bounds.center);
    this.target.z = Math.max(bounds.maxZ * 0.5, 0);
    this.modelRadius = bounds.radius;
    this.modelTopZ = bounds.maxZ;
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
    const frame = (): void => {
      if (this.disposed) return;
      this.raf = view.requestAnimationFrame(frame);
      this.renderFrame();
    };
    this.raf = view.requestAnimationFrame(frame);
  }

  /** One frame: damping, draw, then report the label anchor if it moved. */
  renderFrame(): void {
    if (this.disposed) return;
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
