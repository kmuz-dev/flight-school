import type { PlaneStructure } from "@/content/types";
import type { FlightEvent, FlightInput, FlightProfile, FlightSnapshot, GuidedLaunch } from "./types";

export type HallwayFlightGameOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly structure: PlaneStructure;
  readonly muted?: boolean;
  readonly reducedMotion?: boolean;
  readonly onSnapshot?: (snapshot: FlightSnapshot) => void;
  readonly onEvent?: (event: FlightEvent) => void;
  readonly onError?: (error: Error) => void;
};

export type HallwayFlightDiagnostics = {
  readonly profile: FlightProfile;
  readonly input: FlightInput;
  readonly position: { readonly x: number; readonly y: number; readonly z: number };
  readonly yaw: number;
  readonly pitch: number;
  readonly roll: number;
  readonly frameMs: number;
  readonly section: string;
  readonly pixelRatio: number;
  readonly renderWidth: number;
  readonly renderHeight: number;
  readonly nearestPerson?: Readonly<{
    id: string;
    distanceAhead: number;
    concern: number;
    state: string;
  }>;
};

export type HallwayFlightGameHandle = {
  readonly launch: (launch: GuidedLaunch) => void;
  readonly setInput: (input: FlightInput) => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly restart: () => void;
  readonly setMuted: (muted: boolean) => void;
  readonly setReducedMotion: (reducedMotion: boolean) => void;
  readonly setTiltEnabled: (enabled: boolean) => void;
  readonly snapshot: () => FlightSnapshot;
  readonly diagnostics: () => HallwayFlightDiagnostics;
  readonly dispose: () => void;
};

export type HallwayFlightGameFactory = (options: HallwayFlightGameOptions) => HallwayFlightGameHandle;

let pending: Promise<HallwayFlightGameFactory> | null = null;

export function loadHallwayFlightGame(): Promise<HallwayFlightGameFactory> {
  pending ??= import("./runtime").then((module) => module.createHallwayFlightGame);
  return pending;
}
