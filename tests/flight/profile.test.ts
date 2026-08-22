import { describe, expect, it } from "vitest";
import { PLANES, PLANE_IDS } from "@/content";
import { deriveFlightProfile } from "@/engine/flight";

describe("geometry-derived aircraft profiles", () => {
  it.each(PLANE_IDS)("derives a finite bounded profile for %s", (planeId) => {
    const profile = deriveFlightProfile(PLANES[planeId]!);
    for (const value of Object.values(profile)) {
      if (typeof value === "number") expect(Number.isFinite(value)).toBe(true);
    }
    expect(profile.spanMm).toBeGreaterThan(20);
    expect(profile.lengthMm).toBeGreaterThan(20);
    expect(profile.turnResponse).toBeGreaterThanOrEqual(0.9);
    expect(profile.turnResponse).toBeLessThanOrEqual(1.1);
    expect(profile.glideRetention).toBeGreaterThanOrEqual(0.94);
    expect(profile.glideRetention).toBeLessThanOrEqual(1.08);
  });

  it("does not collapse the fleet to one authored handling profile", () => {
    const speeds = new Set(PLANE_IDS.map((id) => deriveFlightProfile(PLANES[id]!).cruiseSpeed.toFixed(3)));
    const turns = new Set(PLANE_IDS.map((id) => deriveFlightProfile(PLANES[id]!).turnResponse.toFixed(3)));
    expect(speeds.size).toBeGreaterThan(1);
    expect(turns.size).toBeGreaterThan(1);
  });

  it("agrees with the authored speed ladder without using ratings as coefficients", () => {
    const profiles = PLANE_IDS.map((id) => ({ plane: PLANES[id]!, profile: deriveFlightProfile(PLANES[id]!) }));
    for (const faster of profiles) {
      for (const slower of profiles) {
        if (faster.plane.ratings.speed <= slower.plane.ratings.speed) continue;
        expect(faster.profile.cruiseSpeed, `${faster.plane.id} over ${slower.plane.id}`).toBeGreaterThan(slower.profile.cruiseSpeed);
      }
    }
    expect(deriveFlightProfile(PLANES.harrier!).glideRetention).toBeGreaterThan(deriveFlightProfile(PLANES.dart!).glideRetention);
    expect(deriveFlightProfile(PLANES["sea-glider"]!).glideRetention).toBeGreaterThan(deriveFlightProfile(PLANES.bulldog!).glideRetention);
  });
});
