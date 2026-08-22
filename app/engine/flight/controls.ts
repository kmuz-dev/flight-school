import { clamp } from "./math";
import type { FlightInput, GuidedLaunch } from "./types";

export type TiltNeutral = { readonly beta: number; readonly gamma: number };

export function launchFromDrag(deltaX: number, deltaYUp: number): GuidedLaunch {
  const distance = Math.hypot(finite(deltaX), finite(deltaYUp));
  return {
    power: 0.42 + Math.min(1, distance / 180) * 0.58,
    heading: clamp(finite(deltaX) / 650, -0.2, 0.2),
    pitch: clamp(0.05 + finite(deltaYUp) / 700, -0.04, 0.24),
  };
}

export function launchFromCharge(heldMs: number, aim: Pick<GuidedLaunch, "heading" | "pitch">): GuidedLaunch {
  return {
    power: 0.42 + Math.min(1, Math.max(0, finite(heldMs)) / 1100) * 0.58,
    heading: clamp(finite(aim.heading), -0.2, 0.2),
    pitch: clamp(finite(aim.pitch, 0.08), -0.04, 0.24),
  };
}

export function flightPadInput(deltaX: number, deltaYUp: number): FlightInput {
  return {
    turn: clamp(finite(deltaX) / 85, -1, 1),
    pitch: clamp(finite(deltaYUp) / 85, -1, 1),
  };
}

export function tiltInput(beta: number | null, gamma: number | null, neutral: TiltNeutral): FlightInput | null {
  if (!Number.isFinite(beta) || !Number.isFinite(gamma)) return null;
  return {
    turn: clamp((gamma! - neutral.gamma) / 24, -1, 1),
    pitch: clamp((neutral.beta - beta!) / 28, -1, 1),
  };
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}
