import { HALLWAY_HAZARDS } from "./course";
import { clamp } from "./math";
import type { FlightInput, FlightProfile, FlightState } from "./types";

/**
 * A deterministic diagnostic pilot, not a player assist. It derives a safe
 * line directly from the same hazards used by rendering and collision so a
 * stale greybox course fails tests instead of shipping an impossible run.
 */
export function diagnosticAutopilot(state: FlightState, _profile: FlightProfile): FlightInput {
  let targetX = 0;
  const targetY = 5.2;
  let nearestAhead = Number.POSITIVE_INFINITY;

  for (const hazard of HALLWAY_HAZARDS) {
    const ahead = state.position.z - hazard.position.z;
    if (ahead <= 2 || ahead >= 72 || ahead >= nearestAhead) continue;
    if (Math.abs(state.position.y - hazard.position.y) > hazard.height / 2 + 1.1) continue;
    nearestAhead = ahead;
    targetX = hazard.position.x >= 0 ? -7.2 : 7.2;
  }

  return {
    turn: clamp((targetX - state.position.x) * 0.13 - state.yaw * 1.7, -1, 1),
    pitch: clamp((targetY - state.position.y) * 0.2 - state.pitch * 1.3, -1, 1),
  };
}
