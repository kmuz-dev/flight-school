import { describe, expect, it } from "vitest";
import { PLANES } from "@/content";
import { FLIGHT_TUNING, applyGust, createFlightState, deriveFlightProfile, normalizeLaunch, stepFlight } from "@/engine/flight";

describe("guided hallway flight", () => {
  it("bounds a weak or malformed throw to a recoverable launch", () => {
    expect(normalizeLaunch({ power: -5, heading: Infinity, pitch: NaN })).toEqual({
      power: FLIGHT_TUNING.launchMinPower,
      heading: 0,
      pitch: 0.08,
    });
  });

  it("produces the same state for the same fixed-step input", () => {
    const profile = deriveFlightProfile(PLANES.dart!);
    const simulate = () => {
      const state = createFlightState(profile, { power: 0.7, heading: 0, pitch: 0.08 });
      for (let index = 0; index < 240; index += 1) stepFlight(state, { turn: 0.42, pitch: 0.28 }, profile, 1 / 120);
      return state;
    };
    expect(simulate()).toEqual(simulate());
  });

  it("clamps input and keeps the handling state inside its envelope", () => {
    const profile = deriveFlightProfile(PLANES.dart!);
    const simulate = (turn: number, pitch: number) => {
      const state = createFlightState(profile, { power: 1, heading: 0, pitch: 0.08 });
      for (let index = 0; index < 1_200; index += 1) stepFlight(state, { turn, pitch }, profile, 1 / 120);
      return state;
    };
    const clamped = simulate(1, 1);
    expect(simulate(50, 50)).toEqual(clamped);
    expect(Math.abs(clamped.pitch)).toBeLessThanOrEqual(FLIGHT_TUNING.maxPitch);
    expect(Math.abs(clamped.roll)).toBeLessThanOrEqual(FLIGHT_TUNING.maxBank);
    expect(clamped.speed).toBeGreaterThanOrEqual(FLIGHT_TUNING.minSpeed);
    expect(clamped.speed).toBeLessThanOrEqual(profile.maxSpeed);
  });

  it("auto-levels after the cadet releases pitch", () => {
    const profile = deriveFlightProfile(PLANES.dart!);
    const state = createFlightState(profile, { power: 0.7, heading: 0, pitch: 0.08 });
    for (let index = 0; index < 120; index += 1) stepFlight(state, { turn: 0, pitch: 1 }, profile, 1 / 120);
    const before = Math.abs(state.pitch);
    for (let index = 0; index < 900; index += 1) stepFlight(state, { turn: 0, pitch: 0 }, profile, 1 / 120);
    expect(Math.abs(state.pitch)).toBeLessThan(before);
    expect(Math.abs(state.pitch)).toBeLessThan(0.1);
  });

  it("accumulates a damped turn instead of setting position directly", () => {
    const profile = deriveFlightProfile(PLANES.dart!);
    const state = createFlightState(profile, { power: 0.7, heading: 0, pitch: 0.08 });
    const start = { ...state.position };
    stepFlight(state, { turn: 1, pitch: 0 }, profile, 1 / 120);
    expect(state.position.z).toBeLessThan(start.z);
    expect(state.position.x).toBeGreaterThan(start.x);
    expect(state.yawRate).toBeGreaterThan(0);
    expect(state.yawRate).toBeLessThan(FLIGHT_TUNING.maxYawRate * profile.turnResponse);
  });

  it("makes a gust finite, useful, and bounded by the plane profile", () => {
    const profile = deriveFlightProfile(PLANES.dart!);
    const state = createFlightState(profile, { power: 0.5, heading: 0, pitch: 0 });
    const before = state.speed;
    applyGust(state, profile);
    expect(state.speed).toBeGreaterThan(before);
    expect(state.speed).toBeLessThanOrEqual(profile.maxSpeed);
    expect(state.position.y).toBeLessThan(FLIGHT_TUNING.ceilingY);
  });
});
