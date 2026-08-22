import * as THREE from "three";
import { computeFoldState } from "@/engine/core/state";
import { posesForState } from "@/engine/core/pose";
import { restTransform } from "@/engine/core/rest";
import { SceneModel, STAGE_THEME } from "@/engine/render/sceneModel";
import { loadPaperTextures } from "@/engine/render/paperMaterial";
import { HallwayFlightAudio } from "./audio";
import {
  AIRCRAFT_VISUAL_TUNING,
  CAMERA_TUNING,
  FLIGHT_RENDER_TUNING,
  FLIGHT_TUNING,
  PERSON_VISUAL_TUNING,
} from "./config";
import {
  AIR_GUSTS,
  HALLWAY_HAZARDS,
  HALLWAY_SECTIONS,
  collidingHazard,
  courseProgress,
  enteredGust,
  nearbyPerson,
  personConcern,
  sectionAt,
  surfaceCollision,
  type HallwayHazard,
} from "./course";
import { clamp, damp } from "./math";
import { applyGust, createFlightState, stepFlight } from "./model";
import {
  aircraftSecondaryPose,
  chaseCameraRoll,
  deriveAircraftPresentation,
  type AircraftPresentation,
} from "./presentation";
import { advanceRunTimer } from "./run";
import { deriveFlightProfile } from "./profile";
import { flightPixelRatio } from "./renderQuality";
import {
  CLUTTER_ART_BY_HAZARD,
  CORRIDOR_DRESSING,
  COURSE_BACKDROP_ART,
  COURSE_SURFACE_ART,
  PERSON_ART_BY_HAZARD,
  type PersonArtState,
} from "./visualAssets";
import type {
  HallwayFlightDiagnostics,
  HallwayFlightGameFactory,
  HallwayFlightGameHandle,
  HallwayFlightGameOptions,
} from "./client";
import type { FlightEvent, FlightInput, FlightPhase, FlightSnapshot, FlightState, GuidedLaunch } from "./types";

type PersonVisual = {
  readonly group: THREE.Group;
  readonly fallback: THREE.Group;
  readonly planes: Readonly<Record<PersonArtState, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>>;
  readonly materials: Readonly<Record<PersonArtState, THREE.MeshBasicMaterial>>;
  readonly baseX: number;
  readonly dodgeDirection: number;
  state: PersonArtState;
  reaction: number;
  concern: number;
};

type GustVisual = {
  readonly group: THREE.Group;
  readonly rings: readonly THREE.Mesh[];
};

type BackdropVisual = {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  readonly material: THREE.MeshBasicMaterial;
  readonly z: number;
};

type AirflowTrail = {
  readonly line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  readonly material: THREE.LineBasicMaterial;
  readonly positions: Float32Array;
  readonly wingX: number;
};

const PERSON_ART_STATES: readonly PersonArtState[] = ["idle", "notice", "dodge"];

function createAircraftShadow(): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 62);
    gradient.addColorStop(0, "rgba(16, 26, 36, 0.68)");
    gradient.addColorStop(0.42, "rgba(16, 26, 36, 0.34)");
    gradient.addColorStop(1, "rgba(16, 26, 36, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  const material = new THREE.MeshBasicMaterial({
    color: 0x17202a,
    map: texture,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    toneMapped: false,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
}

class HallwayFlightGame implements HallwayFlightGameHandle {
  private readonly options: HallwayFlightGameOptions;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(CAMERA_TUNING.baseFov, 1, 0.1, 1500);
  private readonly aircraft = new THREE.Group();
  private readonly aircraftVisual = new THREE.Group();
  private readonly aircraftShadow = createAircraftShadow();
  private readonly paperMount = new THREE.Group();
  private readonly paperModel = new SceneModel(STAGE_THEME, false);
  private readonly audio = new HallwayFlightAudio();
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly profile;
  private readonly aircraftPresentation: AircraftPresentation;
  private readonly personVisuals = new Map<string, PersonVisual>();
  private readonly gustVisuals = new Map<string, GustVisual>();
  private readonly backdropVisuals: BackdropVisual[] = [];
  private readonly reactedPeople = new Set<string>();
  private readonly passedPeople = new Set<string>();
  private readonly usedGusts = new Set<string>();
  private readonly input: FlightInput = { turn: 0, pitch: 0 };
  private readonly cameraPosition = new THREE.Vector3();
  private readonly cameraTarget = new THREE.Vector3();
  private readonly desiredCamera = new THREE.Vector3();
  private readonly desiredTarget = new THREE.Vector3();
  private readonly forward = new THREE.Vector3(0, 0, -1);
  private readonly cameraRight = new THREE.Vector3(1, 0, 0);
  private readonly cameraViewAxis = new THREE.Vector3(0, 0, -1);
  private readonly shadowAxis = new THREE.Vector3(0, 1, 0);
  private readonly shadowYaw = new THREE.Quaternion();
  private readonly shadowFlat = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    -Math.PI / 2,
  );
  private readonly airflowTip = new THREE.Vector3();
  private readonly airflowTrails: AirflowTrail[] = [];
  private readonly resizeObserver: ResizeObserver | null;
  private state: FlightState;
  private phase: FlightPhase = "ready";
  private elapsedMs = 0;
  private launchElapsed = 0;
  private closePasses = 0;
  private currentChain = 0;
  private bestChain = 0;
  private accumulator = 0;
  private lastFrameTime = 0;
  private frameMs = 0;
  private snapshotTimer = 0;
  private crashElapsed = 0;
  private visualElapsed = 0;
  private airflowAccumulator = 0;
  private airflowInitialized = false;
  private frameRequest = 0;
  private muted: boolean;
  private reducedMotion: boolean;
  private tiltEnabled = false;
  private destroyed = false;

  constructor(options: HallwayFlightGameOptions) {
    this.options = options;
    this.profile = deriveFlightProfile(options.structure);
    this.aircraftPresentation = deriveAircraftPresentation(this.profile);
    this.state = createFlightState(this.profile, { power: 0.65, heading: 0, pitch: 0.08 });
    this.muted = options.muted ?? false;
    this.reducedMotion = options.reducedMotion ?? false;
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: options.canvas,
        antialias: true,
        alpha: false,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
      });
    } catch (cause) {
      throw new Error("The hallway flight renderer could not start.", { cause });
    }
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene.background = new THREE.Color(0x1b2730);
    this.scene.fog = new THREE.Fog(
      0xd8caaa,
      FLIGHT_RENDER_TUNING.backdropFogNear,
      FLIGHT_RENDER_TUNING.backdropFogFar,
    );

    this.buildLighting();
    this.buildHallway();
    this.buildDressing();
    this.buildHazards();
    this.buildGusts();
    this.buildFinish();
    this.buildAircraft();
    if (process.env.NODE_ENV === "development") this.buildCollisionDiagnostics();
    this.reset();
    this.audio.setMuted(this.muted);

    this.resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(this.resize);
    this.resizeObserver?.observe(options.canvas);
    window.addEventListener("resize", this.resize);
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.resize();
    this.publish();
    this.frameRequest = window.requestAnimationFrame(this.frame);
  }

  launch(launch: GuidedLaunch): void {
    if (this.phase !== "ready") return;
    this.state = createFlightState(this.profile, launch);
    this.launchElapsed = 0;
    void this.audio.start().then(() => this.audio.setPaused(false));
    this.setPhase("launching");
  }

  setInput(input: FlightInput): void {
    this.input.turn = clamp(Number.isFinite(input.turn) ? input.turn : 0, -1, 1);
    this.input.pitch = clamp(Number.isFinite(input.pitch) ? input.pitch : 0, -1, 1);
  }

  pause(): void {
    if (this.phase !== "flying" && this.phase !== "launching") return;
    this.input.turn = 0;
    this.input.pitch = 0;
    this.accumulator = 0;
    this.crashElapsed = 0;
    this.audio.setPaused(true);
    this.setPhase("paused");
  }

  resume(): void {
    if (this.phase !== "paused") return;
    this.accumulator = 0;
    this.audio.setPaused(false);
    this.setPhase(this.launchElapsed < 0.38 ? "launching" : "flying");
  }

  restart(): void {
    this.reset();
    this.publish();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.audio.setMuted(muted);
    this.publish();
  }

  setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
    this.publish();
  }

  setTiltEnabled(enabled: boolean): void {
    this.tiltEnabled = enabled;
    this.publish();
  }

  snapshot(): FlightSnapshot {
    return {
      phase: this.phase,
      elapsedMs: Math.round(this.elapsedMs),
      remainingMs: Math.max(0, FLIGHT_TUNING.runLimitMs - Math.round(this.elapsedMs)),
      closePasses: this.closePasses,
      currentChain: this.currentChain,
      bestChain: this.bestChain,
      speed: Math.round(this.state.speed),
      era: sectionAt(this.state.position.z).id,
      progress: courseProgress(this.state.position.z),
      muted: this.muted,
      reducedMotion: this.reducedMotion,
      tiltEnabled: this.tiltEnabled,
    };
  }

  diagnostics(): HallwayFlightDiagnostics {
    let nearestPerson: HallwayFlightDiagnostics["nearestPerson"];
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const [id, visual] of this.personVisuals) {
      const distanceAhead = this.state.position.z - visual.group.position.z;
      if (distanceAhead < -4 || distanceAhead >= nearestDistance) continue;
      nearestDistance = distanceAhead;
      nearestPerson = { id, distanceAhead, concern: visual.concern, state: visual.state };
    }
    return {
      profile: this.profile,
      input: { ...this.input },
      position: { ...this.state.position },
      yaw: this.state.yaw,
      pitch: this.state.pitch,
      roll: this.state.roll,
      frameMs: this.frameMs,
      section: sectionAt(this.state.position.z).id,
      pixelRatio: this.renderer.getPixelRatio(),
      renderWidth: this.renderer.domElement.width,
      renderHeight: this.renderer.domElement.height,
      nearestPerson,
    };
  }

  dispose(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    window.cancelAnimationFrame(this.frameRequest);
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.audio.dispose();
    this.paperModel.dispose();
    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Line) && !(object instanceof THREE.Sprite)) return;
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
        material.dispose();
      });
    });
    this.renderer.dispose();
  }

  private readonly frame = (time: number): void => {
    if (this.destroyed) return;
    const raw = this.lastFrameTime === 0 ? 0 : (time - this.lastFrameTime) / 1000;
    const delta = Math.min(Math.max(raw, 0), FLIGHT_TUNING.maxFrameDelta);
    this.frameMs = raw * 1000;
    this.lastFrameTime = time;

    if (this.phase === "launching" || this.phase === "flying") {
      this.accumulator += delta;
      while (this.accumulator >= FLIGHT_TUNING.fixedStep) {
        this.fixedUpdate(FLIGHT_TUNING.fixedStep);
        this.accumulator -= FLIGHT_TUNING.fixedStep;
      }
    }
    this.updateAircraft(delta);
    this.updateAirflow(delta);
    this.updateCamera(delta);
    this.updatePeople(delta);
    this.updateGusts(time / 1000);
    this.updateBackdrops();
    this.renderer.render(this.scene, this.camera);
    this.snapshotTimer += delta;
    if (this.snapshotTimer >= 0.05) {
      this.snapshotTimer = 0;
      this.publish();
    }
    this.frameRequest = window.requestAnimationFrame(this.frame);
  };

  private fixedUpdate(delta: number): void {
    stepFlight(this.state, this.phase === "launching" ? { turn: 0, pitch: 0 } : this.input, this.profile, delta);
    if (this.phase === "launching") {
      this.launchElapsed += delta;
      if (this.launchElapsed >= 0.38) this.setPhase("flying");
      return;
    }
    const timer = advanceRunTimer(this.elapsedMs, delta);
    this.elapsedMs = timer.elapsedMs;
    this.audio.setFlight((this.state.speed - FLIGHT_TUNING.minSpeed) / (this.profile.maxSpeed - FLIGHT_TUNING.minSpeed));

    const surface = surfaceCollision(this.state.position);
    if (surface) {
      this.crash("hallway-surface", "surface");
      return;
    }
    const hazard = collidingHazard(this.state.position);
    if (hazard) {
      this.crash(hazard.id, hazard.kind);
      return;
    }

    for (const candidate of HALLWAY_HAZARDS) {
      if (candidate.kind !== "person" || this.passedPeople.has(candidate.id)) continue;
      const distanceAhead = this.state.position.z - candidate.position.z;
      const visual = this.personVisuals.get(candidate.id);
      if (distanceAhead < -3.5) {
        this.passedPeople.add(candidate.id);
        if (!this.reactedPeople.has(candidate.id)) this.currentChain = 0;
        if (visual) {
          visual.concern = 0;
          if (visual.reaction <= 0) this.setPersonArt(visual, "idle");
        }
      } else if (!this.reactedPeople.has(candidate.id) && visual) {
        visual.concern = personConcern(this.state.position, this.state.speed, candidate);
        if (visual.reaction <= 0) this.setPersonArt(visual, visual.concern > 0 ? "notice" : "idle");
      }
    }

    const person = nearbyPerson(this.state.position, this.reactedPeople);
    if (person) {
      this.reactedPeople.add(person.id);
      const visual = this.personVisuals.get(person.id);
      if (visual) {
        visual.reaction = 1;
        visual.concern = 1;
        this.setPersonArt(visual, "dodge");
      }
      this.closePasses += 1;
      this.currentChain += 1;
      this.bestChain = Math.max(this.bestChain, this.currentChain);
      this.audio.closePass(this.currentChain);
      this.emit({ type: "close-pass", hazardId: person.id, chain: this.currentChain });
    }

    const gust = enteredGust(this.state.position, this.usedGusts);
    if (gust) {
      this.usedGusts.add(gust.id);
      applyGust(this.state, this.profile);
      this.audio.gust();
      this.emit({ type: "gust", gustId: gust.id });
    }

    if (this.state.position.z <= FLIGHT_TUNING.finishZ) {
      this.setPhase("finished");
      const result = { elapsedMs: Math.round(this.elapsedMs), closePasses: this.closePasses, bestChain: this.bestChain };
      this.audio.finish();
      this.emit({ type: "finish", result });
      return;
    }
    if (timer.timedOut) {
      this.currentChain = 0;
      this.setPhase("timed-out");
    }
  }

  private crash(id: string, kind: "person" | "clutter" | "surface"): void {
    this.currentChain = 0;
    this.input.turn = 0;
    this.input.pitch = 0;
    this.audio.collision();
    if (kind === "person") {
      const visual = this.personVisuals.get(id);
      if (visual) {
        visual.reaction = 1;
        visual.concern = 1;
        this.setPersonArt(visual, "dodge");
      }
    }
    this.setPhase("crashed");
    this.emit({ type: "collision", hazardId: id, kind });
  }

  private reset(): void {
    this.state = createFlightState(this.profile, { power: 0.65, heading: 0, pitch: 0.08 });
    this.phase = "ready";
    this.elapsedMs = 0;
    this.launchElapsed = 0;
    this.closePasses = 0;
    this.currentChain = 0;
    this.bestChain = 0;
    this.accumulator = 0;
    this.crashElapsed = 0;
    this.visualElapsed = 0;
    this.airflowAccumulator = 0;
    this.airflowInitialized = false;
    this.reactedPeople.clear();
    this.passedPeople.clear();
    this.usedGusts.clear();
    this.input.turn = 0;
    this.input.pitch = 0;
    for (const visual of this.personVisuals.values()) {
      visual.reaction = 0;
      visual.concern = 0;
      visual.group.position.x = visual.baseX;
      visual.group.rotation.z = 0;
      this.setPersonArt(visual, "idle");
    }
    for (const visual of this.gustVisuals.values()) visual.group.visible = true;
    this.audio.setPaused(true);
    this.updateAircraft();
    this.resetAirflow();
    this.cameraPosition.set(0, 9, 32);
    this.cameraTarget.set(0, 4, -10);
    this.emit({ type: "state", phase: "ready" });
  }

  private updateAircraft(delta = 0): void {
    if (this.phase === "launching" || this.phase === "flying") this.visualElapsed += delta;
    this.aircraft.position.set(this.state.position.x, this.state.position.y, this.state.position.z);
    this.aircraftShadow.position.set(this.state.position.x, FLIGHT_TUNING.floorY + 0.025, this.state.position.z);
    const shadowMaterial = this.aircraftShadow.material as THREE.MeshBasicMaterial;
    shadowMaterial.opacity = clamp(0.34 - (this.state.position.y - FLIGHT_TUNING.floorY) * 0.024, 0.06, 0.26);
    const shadowScale = 1 + (this.state.position.y - FLIGHT_TUNING.floorY) * 0.028;
    this.aircraftShadow.scale.set(
      this.aircraftPresentation.span * AIRCRAFT_VISUAL_TUNING.shadowWidth * 0.5 * shadowScale,
      this.aircraftPresentation.length * AIRCRAFT_VISUAL_TUNING.shadowLength * 0.5 * shadowScale,
      1,
    );
    this.shadowYaw.setFromAxisAngle(this.shadowAxis, -this.state.yaw);
    this.aircraftShadow.quaternion.copy(this.shadowYaw).multiply(this.shadowFlat);
    if (this.phase === "crashed") {
      this.crashElapsed += delta;
      if (!this.reducedMotion) {
        this.aircraft.rotation.x += delta * 1.8;
        this.aircraft.rotation.z += delta * 2.6;
      }
      this.aircraft.position.y -= Math.min(this.state.position.y - FLIGHT_TUNING.floorY, this.crashElapsed * (this.reducedMotion ? 2 : 5));
      return;
    }
    this.aircraft.rotation.set(this.state.pitch, -this.state.yaw, this.state.roll, "YXZ");
    const secondary = aircraftSecondaryPose(
      this.state.speed,
      this.profile.maxSpeed,
      this.state.roll,
      this.visualElapsed,
      this.reducedMotion,
    );
    this.aircraftVisual.rotation.set(secondary.pitch, secondary.yaw, secondary.roll, "YXZ");
  }

  private updateAirflow(delta: number): void {
    const active = this.phase === "launching" || this.phase === "flying";
    if (!active || this.reducedMotion) {
      for (const trail of this.airflowTrails) trail.line.visible = false;
      this.airflowAccumulator = 0;
      return;
    }
    if (!this.airflowInitialized) this.resetAirflow();
    this.airflowAccumulator += Math.max(0, delta);
    const interval = 1 / AIRCRAFT_VISUAL_TUNING.airflowSampleHz;
    let samples = 0;
    while (this.airflowAccumulator >= interval && samples < 4) {
      this.airflowAccumulator -= interval;
      this.sampleAirflow();
      samples += 1;
    }
    const speedRatio = clamp(
      (this.state.speed - FLIGHT_TUNING.minSpeed) / (this.profile.maxSpeed - FLIGHT_TUNING.minSpeed),
      0,
      1,
    );
    for (const trail of this.airflowTrails) {
      const bankBias = 1 + Math.sign(trail.wingX) * this.state.roll * 0.22;
      trail.material.opacity = AIRCRAFT_VISUAL_TUNING.airflowOpacity * (0.35 + speedRatio * 0.65) * bankBias;
      trail.line.visible = true;
    }
  }

  private sampleAirflow(): void {
    this.aircraft.updateMatrixWorld(true);
    for (const trail of this.airflowTrails) {
      this.airflowTip.set(trail.wingX, 0, this.aircraftPresentation.wingtipZ);
      this.aircraftVisual.localToWorld(this.airflowTip);
      trail.positions.copyWithin(3, 0, trail.positions.length - 3);
      trail.positions[0] = this.airflowTip.x;
      trail.positions[1] = this.airflowTip.y;
      trail.positions[2] = this.airflowTip.z;
      const attribute = trail.line.geometry.getAttribute("position") as THREE.BufferAttribute;
      attribute.needsUpdate = true;
    }
  }

  private resetAirflow(): void {
    this.aircraft.updateMatrixWorld(true);
    for (const trail of this.airflowTrails) {
      this.airflowTip.set(trail.wingX, 0, this.aircraftPresentation.wingtipZ);
      this.aircraftVisual.localToWorld(this.airflowTip);
      for (let index = 0; index < trail.positions.length; index += 3) {
        trail.positions[index] = this.airflowTip.x;
        trail.positions[index + 1] = this.airflowTip.y;
        trail.positions[index + 2] = this.airflowTip.z;
      }
      const attribute = trail.line.geometry.getAttribute("position") as THREE.BufferAttribute;
      attribute.needsUpdate = true;
      trail.line.visible = false;
    }
    this.airflowInitialized = true;
  }

  private updatePeople(delta: number): void {
    for (const visual of this.personVisuals.values()) {
      const distanceAhead = this.state.position.z - visual.group.position.z;
      const inVisualRange = distanceAhead > -32 && distanceAhead < 260;
      visual.group.visible = inVisualRange;
      if (distanceAhead > -32 && distanceAhead < 230) this.prewarmMaterial(visual.materials.idle);
      if (distanceAhead > -32 && distanceAhead < 180) this.prewarmMaterial(visual.materials.notice);
      if (distanceAhead > -32 && distanceAhead < 135) this.prewarmMaterial(visual.materials.dodge);
      visual.group.rotation.y = Math.atan2(
        this.camera.position.x - visual.group.position.x,
        this.camera.position.z - visual.group.position.z,
      );
      visual.reaction = Math.max(0, visual.reaction - delta / PERSON_VISUAL_TUNING.dodgeDuration);
      const dodgeEnvelope = visual.reaction > 0 ? Math.sin((1 - visual.reaction) * Math.PI) : 0;
      const noticeLean = visual.state === "notice" ? visual.dodgeDirection * visual.concern * 0.026 : 0;
      const targetLean = this.reducedMotion
        ? 0
        : noticeLean + visual.dodgeDirection * dodgeEnvelope * PERSON_VISUAL_TUNING.dodgeLean;
      const targetX = this.reducedMotion
        ? visual.baseX
        : visual.baseX + visual.dodgeDirection * dodgeEnvelope * PERSON_VISUAL_TUNING.dodgeTravel;
      visual.group.rotation.z = damp(visual.group.rotation.z, targetLean, 9, delta);
      visual.group.position.x = damp(visual.group.position.x, targetX, 8, delta);

      if (visual.reaction <= 0 && visual.state === "dodge") {
        this.setPersonArt(visual, visual.concern > 0 ? "notice" : "idle");
      }

      for (const state of PERSON_ART_STATES) {
        const material = visual.materials[state];
        const target = state === visual.state && material.userData.ready === true ? 1 : 0;
        material.opacity = this.reducedMotion
          ? target
          : damp(material.opacity, target, PERSON_VISUAL_TUNING.crossfadeResponse, delta);
        visual.planes[state].visible = inVisualRange && material.userData.ready === true && material.opacity > 0.002;
      }
      visual.fallback.visible = inVisualRange && visual.materials.idle.userData.ready !== true;
    }
  }

  private updateBackdrops(): void {
    for (const backdrop of this.backdropVisuals) {
      const distanceAhead = this.state.position.z - backdrop.z;
      backdrop.mesh.visible = distanceAhead > -8;
      backdrop.material.opacity = 0.99 * clamp((distanceAhead - 5) / 42, 0, 1);
    }
  }

  private updateGusts(time: number): void {
    for (const [id, visual] of this.gustVisuals) {
      if (this.usedGusts.has(id)) visual.group.visible = false;
      visual.group.rotation.z = this.reducedMotion ? 0 : time * 0.35;
      visual.rings.forEach((ring, index) => {
        const pulse = this.reducedMotion ? 1 : 0.9 + Math.sin(time * 3.2 + index) * 0.08;
        ring.scale.setScalar(pulse);
      });
    }
  }

  private updateCamera(delta: number): void {
    const subject = this.aircraft.position;
    this.forward.set(Math.sin(this.state.yaw), Math.sin(this.state.pitch) * 0.35, -Math.cos(this.state.yaw)).normalize();
    this.cameraRight.set(Math.cos(this.state.yaw), 0, Math.sin(this.state.yaw));
    this.desiredCamera.copy(subject).addScaledVector(this.forward, -CAMERA_TUNING.distance);
    this.desiredCamera.addScaledVector(this.cameraRight, CAMERA_TUNING.shoulderOffset);
    this.desiredCamera.y += CAMERA_TUNING.height - this.forward.y * CAMERA_TUNING.pitchHeightCompensation;
    this.desiredTarget.copy(subject).addScaledVector(this.forward, CAMERA_TUNING.lookAhead);
    const response = 1 - Math.exp(-CAMERA_TUNING.followResponse * Math.max(delta, 0));
    this.cameraPosition.lerp(this.desiredCamera, response);
    this.cameraTarget.lerp(this.desiredTarget, response);
    this.camera.position.copy(this.cameraPosition);
    this.cameraViewAxis.copy(this.cameraTarget).sub(this.cameraPosition).normalize();
    this.camera.up
      .set(0, 1, 0)
      .applyAxisAngle(this.cameraViewAxis, chaseCameraRoll(this.state.roll, this.reducedMotion));
    this.camera.lookAt(this.cameraTarget);
    const ratio = clamp((this.state.speed - FLIGHT_TUNING.minSpeed) / (this.profile.maxSpeed - FLIGHT_TUNING.minSpeed), 0, 1);
    const targetFov = this.reducedMotion ? CAMERA_TUNING.baseFov : CAMERA_TUNING.baseFov + ratio * (CAMERA_TUNING.speedFov - CAMERA_TUNING.baseFov);
    const nextFov = damp(this.camera.fov, targetFov, CAMERA_TUNING.fovResponse, delta);
    if (Math.abs(nextFov - this.camera.fov) > 0.001) {
      this.camera.fov = nextFov;
      this.camera.updateProjectionMatrix();
    }
  }

  private buildLighting(): void {
    this.scene.add(new THREE.HemisphereLight(0xfff3d5, 0x263541, 1.25));
    const key = new THREE.DirectionalLight(0xffe8bf, 2.9);
    key.position.set(-8, 15, 12);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xc9deee, 0.58);
    fill.position.set(9, 5, -4);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xfff8e8, 0.38);
    rim.position.set(2, 9, -13);
    this.scene.add(rim);
  }

  private buildHallway(): void {
    for (const section of HALLWAY_SECTIONS) {
      const length = section.startZ - section.endZ;
      const centerZ = (section.startZ + section.endZ) / 2;
      const art = COURSE_SURFACE_ART[section.id];
      const wall = this.surfaceMaterial(art.wall, section.wall, length / 7.5, 2.2, 0.8);
      const ceilingMaterial = this.surfaceMaterial(art.wall, section.wall, 7, length / 7.5, 0.86);
      const floor = this.surfaceMaterial(art.floor, section.floor, 7, length / 7, 0.46, 0.08, 0.18);
      const trim = this.surfaceMaterial(art.trim, section.accent, length / 7.5, 1.25, 0.62, 0.05);
      const accent = new THREE.MeshStandardMaterial({ color: section.accent, roughness: 0.55, metalness: 0.04 });

      const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, length), floor);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(0, FLIGHT_TUNING.floorY, centerZ);
      floorMesh.receiveShadow = true;
      this.scene.add(floorMesh);
      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(28, length), ceilingMaterial);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(0, FLIGHT_TUNING.ceilingY, centerZ);
      this.scene.add(ceiling);
      for (const side of [-1, 1]) {
        const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(length, 15.5), wall);
        sideWall.position.set(side * FLIGHT_TUNING.corridorHalfWidth, 6.25, centerZ);
        sideWall.rotation.y = side * -Math.PI / 2;
        sideWall.receiveShadow = true;
        this.scene.add(sideWall);

        const wainscot = new THREE.Mesh(new THREE.PlaneGeometry(length, 5.1), trim);
        wainscot.position.set(side * (FLIGHT_TUNING.corridorHalfWidth - 0.018), 1.05, centerZ);
        wainscot.rotation.y = side * -Math.PI / 2;
        wainscot.renderOrder = 0;
        this.scene.add(wainscot);

        const capRail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, length), accent);
        capRail.position.set(side * (FLIGHT_TUNING.corridorHalfWidth - 0.11), 3.65, centerZ);
        this.scene.add(capRail);
      }

      const panelCount = Math.max(1, Math.floor(length / 28));
      const panelGeometry = new THREE.BoxGeometry(0.26, 15.2, 0.3);
      const panels = new THREE.InstancedMesh(panelGeometry, accent, panelCount * 2);
      const matrix = new THREE.Matrix4();
      for (let index = 0; index < panelCount; index += 1) {
        const z = section.startZ - 14 - index * (length / panelCount);
        matrix.makeTranslation(-13.78, 6.1, z);
        panels.setMatrixAt(index * 2, matrix);
        matrix.makeTranslation(13.78, 6.1, z - 8);
        panels.setMatrixAt(index * 2 + 1, matrix);
      }
      this.scene.add(panels);

      const lightGeometry = new THREE.BoxGeometry(4.8, 0.12, 1.2);
      const lightMaterial = new THREE.MeshBasicMaterial({ color: section.light });
      const lights = new THREE.InstancedMesh(lightGeometry, lightMaterial, panelCount);
      for (let index = 0; index < panelCount; index += 1) {
        const z = section.startZ - 10 - index * (length / panelCount);
        matrix.makeTranslation(0, 13.75, z);
        lights.setMatrixAt(index, matrix);
      }
      this.scene.add(lights);

      this.buildBackdrop(section.id, section.endZ + 22);

      if (section !== HALLWAY_SECTIONS[0]) this.buildThreshold(section.startZ, section.id, section.accent);
    }
  }

  private buildBackdrop(era: keyof typeof COURSE_BACKDROP_ART, z: number): void {
    let mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    const art = COURSE_BACKDROP_ART[era];
    const material = this.spriteMaterial(art.src, () => {
      mesh.visible = true;
    });
    material.opacity = 1;
    material.fog = false;
    const height = 16.5;
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(29.2, height * art.aspectRatio), height), material);
    mesh.position.set(0, 6.25, z);
    mesh.visible = false;
    mesh.renderOrder = -2;
    this.backdropVisuals.push({ mesh, material, z });
    this.scene.add(mesh);
  }

  private buildDressing(): void {
    for (const dressing of CORRIDOR_DRESSING) {
      let mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      const material = this.spriteMaterial(dressing.image, () => {
        mesh.visible = true;
      });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(dressing.width, dressing.height), material);
      mesh.position.set(dressing.position.x, dressing.position.y, dressing.position.z);
      mesh.rotation.y = dressing.rotationY;
      mesh.visible = false;
      mesh.renderOrder = 1;
      this.scene.add(mesh);
    }
  }

  private buildThreshold(z: number, label: string, color: number): void {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.62 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(28, 1.1, 1.2), material);
    top.position.set(0, 13.2, z);
    this.scene.add(top);
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(1.1, 15, 1.2), material);
      post.position.set(side * 13.3, 6, z);
      this.scene.add(post);
    }
    const sprite = this.textSprite(label, "#f7f3e9", "#10223b");
    sprite.position.set(0, 10.8, z + 0.75);
    sprite.scale.set(8, 2, 1);
    this.scene.add(sprite);
  }

  private buildHazards(): void {
    for (const hazard of HALLWAY_HAZARDS) {
      if (hazard.kind === "person") this.buildPerson(hazard);
      else this.buildClutter(hazard);
    }
  }

  private buildPerson(hazard: HallwayHazard): void {
    const group = new THREE.Group();
    group.position.set(hazard.position.x, FLIGHT_TUNING.floorY, hazard.position.z);
    const groundShadow = new THREE.Mesh(
      new THREE.CircleGeometry(hazard.radius * 1.05, 28),
      new THREE.MeshBasicMaterial({ color: 0x16202a, transparent: true, opacity: 0.2, depthWrite: false }),
    );
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.set(hazard.position.x, FLIGHT_TUNING.floorY + 0.018, hazard.position.z);
    groundShadow.scale.y = 0.42;
    groundShadow.renderOrder = 1;
    this.scene.add(groundShadow);
    const eraColor = hazard.era === "1950s" ? 0x29475e : hazard.era === "1980s" ? 0xc34a39 : 0x2c6873;
    const clothing = new THREE.MeshStandardMaterial({ color: eraColor, roughness: 0.88 });
    const skin = new THREE.MeshStandardMaterial({ color: hazard.label === "staff" ? 0x9c6446 : 0xc88b62, roughness: 0.9 });
    const fallback = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 2.4, 5, 10), clothing);
    body.position.y = 2.4;
    fallback.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.64, 14, 10), skin);
    head.position.y = 4.85;
    fallback.add(head);
    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0x132942 }));
    eyes.position.set(0, 5.02, 0.58);
    fallback.add(eyes);
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 1.6, 4, 8), clothing);
      arm.position.set(side * 0.96, 3, 0);
      arm.rotation.z = side * -0.08;
      fallback.add(arm);
    }
    group.add(fallback);

    const art = PERSON_ART_BY_HAZARD[hazard.id];
    if (!art) {
      this.options.onError?.(new Error(`Missing character art for ${hazard.id}`));
      this.scene.add(group);
      return;
    }

    const materials = {
      idle: this.spriteMaterial(art.idle, undefined, 0, false),
      notice: this.spriteMaterial(art.notice, undefined, 0, false),
      dodge: this.spriteMaterial(art.dodge, undefined, 0, false),
    } as const;
    const visualHeight = hazard.height * 1.16 * PERSON_VISUAL_TUNING.displayScale;
    const visualWidth = hazard.height * 0.76 * PERSON_VISUAL_TUNING.displayScale;
    const geometry = new THREE.PlaneGeometry(visualWidth, visualHeight);
    const planes = {
      idle: new THREE.Mesh(geometry, materials.idle),
      notice: new THREE.Mesh(geometry, materials.notice),
      dodge: new THREE.Mesh(geometry, materials.dodge),
    } as const;
    PERSON_ART_STATES.forEach((state, index) => {
      const plane = planes[state];
      plane.position.y = visualHeight / 2;
      plane.visible = false;
      plane.renderOrder = 3 + index;
      group.add(plane);
    });
    this.personVisuals.set(hazard.id, {
      group,
      planes,
      fallback,
      materials,
      baseX: hazard.position.x,
      dodgeDirection: hazard.position.x >= 0 ? 1 : -1,
      state: "idle",
      reaction: 0,
      concern: 0,
    });
    this.scene.add(group);
  }

  private buildClutter(hazard: HallwayHazard): void {
    const material = new THREE.MeshStandardMaterial({ color: hazard.era === "1980s" ? 0xe1a545 : 0x865744, roughness: 0.8 });
    const geometry = hazard.label === "decoration"
      ? new THREE.OctahedronGeometry(hazard.radius)
      : new THREE.BoxGeometry(hazard.radius * 2, hazard.height, hazard.radius * 2);
    const fallback = new THREE.Mesh(geometry, material);
    fallback.position.set(hazard.position.x, hazard.position.y, hazard.position.z);
    this.scene.add(fallback);

    const art = CLUTTER_ART_BY_HAZARD[hazard.id];
    if (!art) return;
    let plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    const spriteMaterial = this.spriteMaterial(art, () => {
      plane.visible = true;
      fallback.visible = false;
    });
    const width = hazard.label === "decoration" ? hazard.radius * 3.5 : hazard.radius * 2.4;
    const height = hazard.label === "decoration" ? hazard.height * 2.2 : hazard.height * 1.35;
    plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), spriteMaterial);
    plane.position.set(hazard.position.x, hazard.position.y, hazard.position.z + 0.02);
    plane.visible = false;
    plane.renderOrder = 2;
    this.scene.add(plane);
  }

  private buildGusts(): void {
    for (const gust of AIR_GUSTS) {
      const group = new THREE.Group();
      group.position.set(gust.position.x, gust.position.y, gust.position.z);
      const rings: THREE.Mesh[] = [];
      for (let index = 0; index < 4; index += 1) {
        const material = new THREE.MeshBasicMaterial({
          color: gust.era === "today" ? 0x9edbe2 : 0xf4c45f,
          transparent: true,
          opacity: 0.38 - index * 0.05,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(gust.radius * (0.72 + index * 0.08), 0.1, 6, 32), material);
        ring.position.z = index * 1.1;
        rings.push(ring);
        group.add(ring);
      }
      this.gustVisuals.set(gust.id, { group, rings });
      this.scene.add(group);
    }
  }

  private buildFinish(): void {
    const arch = new THREE.Mesh(new THREE.BoxGeometry(28, 1.4, 1.4), new THREE.MeshStandardMaterial({ color: 0xa42f2f, roughness: 0.55 }));
    arch.position.set(0, 12.8, FLIGHT_TUNING.finishZ);
    this.scene.add(arch);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.7), new THREE.MeshStandardMaterial({ color: 0xe6b84d, metalness: 0.55, roughness: 0.32 }));
    bell.position.set(0, 10.3, FLIGHT_TUNING.finishZ + 0.5);
    bell.rotation.x = Math.PI;
    this.scene.add(bell);
  }

  private buildAircraft(): void {
    const finished = computeFoldState(this.options.structure, this.options.structure.steps.length - 1);
    this.paperModel.sync(finished);
    this.paperModel.setRest(restTransform(finished));
    this.paperModel.applyPoses(posesForState(finished));
    const bounds = this.paperModel.computeBounds();
    const scale = this.aircraftPresentation.scale;
    const center = bounds.center;
    const centered = new THREE.Group();
    centered.position.set(-center.x, -center.y, -center.z);
    centered.add(this.paperModel.root);
    const scaled = new THREE.Group();
    scaled.scale.setScalar(scale);
    scaled.add(centered);
    this.paperMount.rotation.set(-Math.PI / 2, Math.PI, 0);
    this.paperMount.add(scaled);
    this.aircraftVisual.add(this.paperMount);
    this.aircraft.add(this.aircraftVisual);
    this.scene.add(this.aircraft);
    this.aircraftShadow.rotation.x = -Math.PI / 2;
    this.aircraftShadow.renderOrder = 0;
    this.scene.add(this.aircraftShadow);
    this.buildAirflow();

    void loadPaperTextures(this.renderer.capabilities.getMaxAnisotropy())
      .then((textures) => {
        if (this.destroyed) {
          Object.values(textures).forEach((texture) => texture.dispose());
          return;
        }
        Object.values(textures).forEach((texture) => this.renderer.initTexture(texture));
        this.paperModel.applyPaperTextures(textures);
      })
      .catch((cause: unknown) => this.options.onError?.(cause instanceof Error ? cause : new Error("Paper texture unavailable")));
  }

  private buildAirflow(): void {
    for (const wingX of [-this.aircraftPresentation.wingtipX, this.aircraftPresentation.wingtipX]) {
      const positions = new Float32Array(AIRCRAFT_VISUAL_TUNING.airflowPoints * 3);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
      );
      const material = new THREE.LineBasicMaterial({
        color: 0xd9eef0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      line.visible = false;
      line.renderOrder = 4;
      this.airflowTrails.push({ line, material, positions, wingX });
      this.scene.add(line);
    }
  }

  private buildCollisionDiagnostics(): void {
    const material = new THREE.MeshBasicMaterial({
      color: 0x55f0bd,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      depthTest: false,
    });
    const aircraftVolume = new THREE.Mesh(new THREE.SphereGeometry(0.72, 10, 8), material);
    aircraftVolume.renderOrder = 20;
    this.aircraft.add(aircraftVolume);

    for (const hazard of HALLWAY_HAZARDS) {
      const volume = new THREE.Mesh(
        new THREE.CylinderGeometry(hazard.radius + 0.72, hazard.radius + 0.72, hazard.height + 1.44, 12),
        material,
      );
      volume.position.set(hazard.position.x, hazard.position.y, hazard.position.z);
      volume.renderOrder = 20;
      this.scene.add(volume);
    }
  }

  private setPersonArt(visual: PersonVisual, state: PersonArtState): void {
    if (visual.state === state) return;
    visual.state = state;
  }

  private surfaceMaterial(
    url: string,
    fallbackColor: number,
    repeatX: number,
    repeatY: number,
    roughness: number,
    metalness = 0,
    clearcoat = 0,
  ): THREE.MeshPhysicalMaterial {
    const material = new THREE.MeshPhysicalMaterial({
      color: fallbackColor,
      roughness,
      metalness,
      clearcoat,
      clearcoatRoughness: 0.5,
      side: THREE.DoubleSide,
    });
    this.textureLoader.load(
      url,
      (texture) => {
        if (this.destroyed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(Math.max(1, repeatX), Math.max(1, repeatY));
        texture.anisotropy = Math.min(
          FLIGHT_RENDER_TUNING.maxTextureAnisotropy,
          this.renderer.capabilities.getMaxAnisotropy(),
        );
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        this.renderer.initTexture(texture);
        material.color.set(0xffffff);
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      () => this.options.onError?.(new Error(`Flight surface unavailable: ${url}`)),
    );
    return material;
  }

  private prewarmMaterial(material: THREE.MeshBasicMaterial): void {
    const texture = material.map;
    if (!texture || texture.userData.prewarmed === true) return;
    this.renderer.initTexture(texture);
    texture.userData.prewarmed = true;
  }

  private spriteMaterial(url: string, onReady?: () => void, readyOpacity = 1, prewarm = true): THREE.MeshBasicMaterial {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      premultipliedAlpha: true,
      alphaTest: 0.008,
      alphaToCoverage: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.textureLoader.load(
      url,
      (texture) => {
        if (this.destroyed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.premultiplyAlpha = true;
        texture.anisotropy = Math.min(
          FLIGHT_RENDER_TUNING.maxTextureAnisotropy,
          this.renderer.capabilities.getMaxAnisotropy(),
        );
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        if (prewarm) {
          this.renderer.initTexture(texture);
          texture.userData.prewarmed = true;
        }
        material.map = texture;
        material.opacity = readyOpacity;
        material.userData.ready = true;
        material.needsUpdate = true;
        onReady?.();
      },
      undefined,
      () => this.options.onError?.(new Error(`Flight art unavailable: ${url}`)),
    );
    return material;
  }

  private textSprite(text: string, foreground: string, background: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = foreground;
      context.font = "700 64px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true }));
  }

  private setPhase(phase: FlightPhase): void {
    if (this.phase === phase) return;
    this.phase = phase;
    this.emit({ type: "state", phase });
    this.publish();
  }

  private emit(event: FlightEvent): void {
    this.options.onEvent?.(event);
  }

  private publish(): void {
    this.options.onSnapshot?.(this.snapshot());
  }

  private readonly onBlur = (): void => this.pause();

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.pause();
  };

  private readonly resize = (): void => {
    const width = Math.max(1, this.options.canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, this.options.canvas.clientHeight || window.innerHeight);
    this.renderer.setPixelRatio(flightPixelRatio(width, height, window.devicePixelRatio || 1));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}

export const createHallwayFlightGame: HallwayFlightGameFactory = (options) =>
  new HallwayFlightGame(options);
