import { describe, expect, it } from "vitest";
import { PLANES } from "@/content";
import {
  AIR_GUSTS,
  FLIGHT_TUNING,
  applyGust,
  collidingHazard,
  createFlightState,
  deriveFlightProfile,
  diagnosticAutopilot,
  enteredGust,
  stepFlight,
  surfaceCollision,
} from "@/engine/flight";

describe("course diagnostic autopilot", () => {
  it("finds a collision-free line to the bell for every finished aircraft", () => {
    for (const structure of Object.values(PLANES)) {
      const profile = deriveFlightProfile(structure);
      const state = createFlightState(profile, { power: 0.72, heading: 0, pitch: 0.08 });
      const usedGusts = new Set<string>();
      let elapsed = 0;
      let collision: string | null = null;
      while (state.position.z > FLIGHT_TUNING.finishZ && elapsed < FLIGHT_TUNING.runLimitMs) {
        stepFlight(state, diagnosticAutopilot(state, profile), profile, FLIGHT_TUNING.fixedStep);
        const gust = enteredGust(state.position, usedGusts);
        if (gust) {
          usedGusts.add(gust.id);
          applyGust(state, profile);
        }
        const hazard = collidingHazard(state.position);
        collision = surfaceCollision(state.position) ?? hazard?.id ?? null;
        if (collision) break;
        elapsed += FLIGHT_TUNING.fixedStep * 1000;
      }
      expect(collision, `${structure.id} collision`).toBeNull();
      expect(state.position.z, `${structure.id} finish`).toBeLessThanOrEqual(FLIGHT_TUNING.finishZ);
      expect(elapsed, `${structure.id} timer`).toBeLessThan(FLIGHT_TUNING.runLimitMs);
    }
    expect(AIR_GUSTS.length).toBeGreaterThan(0);
  });
});
