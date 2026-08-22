import type { PlaneId } from "@/content/types";

export type FlightEra = "1950s" | "1980s" | "today";
export type FlightPhase =
  | "ready"
  | "launching"
  | "flying"
  | "paused"
  | "crashed"
  | "timed-out"
  | "finished";

export type Vec3 = { x: number; y: number; z: number };

export type FlightInput = {
  turn: number;
  pitch: number;
};

export type GuidedLaunch = {
  readonly power: number;
  readonly heading: number;
  readonly pitch: number;
};

export type FlightState = {
  position: Vec3;
  yaw: number;
  pitch: number;
  roll: number;
  yawRate: number;
  pitchRate: number;
  speed: number;
};

export type FlightProfile = {
  readonly planeId: PlaneId;
  readonly spanMm: number;
  readonly lengthMm: number;
  readonly heightMm: number;
  readonly projectedAreaMm2: number;
  readonly cruiseSpeed: number;
  readonly maxSpeed: number;
  readonly turnResponse: number;
  readonly pitchResponse: number;
  readonly stability: number;
  readonly glideRetention: number;
  readonly gustResponse: number;
};

export type FlightRunResult = {
  readonly elapsedMs: number;
  readonly closePasses: number;
  readonly bestChain: number;
};

export type FlightRecord = {
  readonly bestTimeMs: number;
  readonly bestClosePasses: number;
  readonly bestChain: number;
  readonly updatedAt: string;
};

export type FlightSnapshot = FlightRunResult & {
  readonly phase: FlightPhase;
  readonly remainingMs: number;
  readonly currentChain: number;
  readonly speed: number;
  readonly era: FlightEra;
  readonly progress: number;
  readonly muted: boolean;
  readonly reducedMotion: boolean;
  readonly tiltEnabled: boolean;
};

export type FlightEvent =
  | { readonly type: "state"; readonly phase: FlightPhase }
  | { readonly type: "gust"; readonly gustId: string }
  | { readonly type: "close-pass"; readonly hazardId: string; readonly chain: number }
  | { readonly type: "collision"; readonly hazardId: string; readonly kind: "person" | "clutter" | "surface" }
  | { readonly type: "finish"; readonly result: FlightRunResult };
