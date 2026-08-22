import { describe, expect, it } from "vitest";
import { PLANES, PLANE_IDS } from "@/content";
import {
  AIRCRAFT_VISUAL_TUNING,
  aircraftSecondaryPose,
  chaseCameraRoll,
  deriveAircraftPresentation,
  deriveFlightProfile,
} from "@/engine/flight";

describe("flight aircraft presentation", () => {
  it.each(PLANE_IDS)("fits %s without changing its folded proportions", (planeId) => {
    const profile = deriveFlightProfile(PLANES[planeId]!);
    const presentation = deriveAircraftPresentation(profile);
    expect(Number.isFinite(presentation.scale)).toBe(true);
    expect(presentation.scale).toBeGreaterThan(0);
    expect(presentation.span).toBeLessThanOrEqual(AIRCRAFT_VISUAL_TUNING.targetSpan + 1e-9);
    expect(presentation.length).toBeLessThanOrEqual(AIRCRAFT_VISUAL_TUNING.maxLength + 1e-9);
    expect(presentation.length / presentation.span).toBeCloseTo(profile.lengthMm / profile.spanMm, 9);
  });

  it("keeps the long Dart outside the chase camera instead of scaling by span alone", () => {
    const profile = deriveFlightProfile(PLANES.dart!);
    const presentation = deriveAircraftPresentation(profile);
    expect(presentation.length).toBeCloseTo(AIRCRAFT_VISUAL_TUNING.maxLength, 6);
    expect(presentation.span).toBeGreaterThan(3);
  });

  it("keeps paper compliance subtle and removes animated movement for reduced motion", () => {
    const moving = aircraftSecondaryPose(28, 32, 0.7, 12.4, false);
    expect(Math.abs(moving.pitch - AIRCRAFT_VISUAL_TUNING.angleOfAttack)).toBeLessThan(0.012);
    expect(Math.abs(moving.yaw)).toBeLessThanOrEqual(0.028);
    expect(Math.abs(moving.roll)).toBeLessThan(0.006);
    expect(aircraftSecondaryPose(28, 32, 0.7, 12.4, true)).toEqual({
      pitch: AIRCRAFT_VISUAL_TUNING.angleOfAttack,
      yaw: 0,
      roll: 0,
    });
  });

  it("inherits only a restrained amount of bank in the camera", () => {
    expect(chaseCameraRoll(0.6, false)).toBeCloseTo(0.096, 9);
    expect(chaseCameraRoll(0.6, true)).toBe(0);
  });
});
