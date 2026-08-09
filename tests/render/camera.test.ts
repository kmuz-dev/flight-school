/**
 * Camera is presentation only and never part of fold state, so all of its maths
 * is pure and testable without a canvas.
 */
import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import {
  CAMERA_PRESETS,
  MAX_ELEVATION_DEG,
  MIN_ELEVATION_DEG,
  framingDistance,
  orbitToPosition,
  positionToOrbit,
  resolveCameraHint,
} from "@/engine/render/renderer";

const ORIGIN = new Vector3(0, 0, 0);

describe("camera presets", () => {
  it("match the engine spec", () => {
    expect(CAMERA_PRESETS.front).toEqual({ azimuthDeg: 0, elevationDeg: 5 });
    expect(CAMERA_PRESETS.threeQuarter).toEqual({ azimuthDeg: -35, elevationDeg: 25 });
    expect(CAMERA_PRESETS.top).toEqual({ azimuthDeg: 0, elevationDeg: 85 });
  });

  it("front looks down the +Y axis, nearly level with the table", () => {
    const p = orbitToPosition({ ...CAMERA_PRESETS.front, distance: 100 }, ORIGIN);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(Math.cos((5 * Math.PI) / 180) * 100, 4);
    expect(p.z).toBeCloseTo(Math.sin((5 * Math.PI) / 180) * 100, 4);
  });

  it("top looks almost straight down the +Z axis", () => {
    const p = orbitToPosition({ ...CAMERA_PRESETS.top, distance: 100 }, ORIGIN);
    expect(p.z).toBeGreaterThan(99);
    expect(Math.hypot(p.x, p.y)).toBeLessThan(9);
  });

  it("three-quarter swings off-axis and lifts the eye", () => {
    const p = orbitToPosition({ ...CAMERA_PRESETS.threeQuarter, distance: 100 }, ORIGIN);
    expect(p.x).toBeLessThan(0);
    expect(p.y).toBeGreaterThan(0);
    expect(p.z).toBeGreaterThan(0);
  });
});

describe("orbitToPosition / positionToOrbit", () => {
  it("round-trip for every preset and an offset target", () => {
    const target = new Vector3(12, -30, 4);
    for (const preset of Object.values(CAMERA_PRESETS)) {
      const orbit = { ...preset, distance: 380 };
      const position = orbitToPosition(orbit, target);
      const back = positionToOrbit(position, target);
      expect(back.azimuthDeg).toBeCloseTo(orbit.azimuthDeg, 4);
      expect(back.elevationDeg).toBeCloseTo(orbit.elevationDeg, 4);
      expect(back.distance).toBeCloseTo(orbit.distance, 4);
    }
  });

  it("never places the camera under the table", () => {
    const low = orbitToPosition({ azimuthDeg: 0, elevationDeg: -60, distance: 100 }, ORIGIN);
    expect(low.z).toBeGreaterThan(0);
    const high = orbitToPosition({ azimuthDeg: 0, elevationDeg: 120, distance: 100 }, ORIGIN);
    expect(positionToOrbit(high, ORIGIN).elevationDeg).toBeCloseTo(MAX_ELEVATION_DEG, 4);
    expect(positionToOrbit(low, ORIGIN).elevationDeg).toBeCloseTo(MIN_ELEVATION_DEG, 4);
  });
});

describe("resolveCameraHint", () => {
  const current = { azimuthDeg: 90, elevationDeg: 40, distance: 500 };

  it("keeps the current orbit when a step declares no hint", () => {
    expect(resolveCameraHint(undefined, current, 300)).toEqual(current);
  });

  it("adopts a preset and its framing distance", () => {
    expect(resolveCameraHint({ preset: "top" }, current, 300)).toEqual({
      azimuthDeg: 0,
      elevationDeg: 85,
      distance: 300,
    });
  });

  it("lets explicit angles override the preset", () => {
    expect(resolveCameraHint({ preset: "front", azimuthDeg: 20 }, current, 300)).toEqual({
      azimuthDeg: 20,
      elevationDeg: 5,
      distance: 300,
    });
  });

  it("applies a bare angle override on top of the current orbit", () => {
    expect(resolveCameraHint({ elevationDeg: 10 }, current, 300)).toEqual({
      azimuthDeg: 90,
      elevationDeg: 10,
      distance: 500,
    });
  });

  it("clamps a hint that would put the camera under or on top of the table", () => {
    expect(resolveCameraHint({ elevationDeg: -20 }, current, 300).elevationDeg).toBe(
      MIN_ELEVATION_DEG,
    );
    expect(resolveCameraHint({ elevationDeg: 100 }, current, 300).elevationDeg).toBe(
      MAX_ELEVATION_DEG,
    );
  });

  it("honours an explicit distance", () => {
    expect(resolveCameraHint({ preset: "front", distance: 42 }, current, 300).distance).toBe(42);
  });
});

describe("framingDistance", () => {
  it("scales with the model and pulls back further on narrow viewports", () => {
    const wide = framingDistance(100, 34, 16 / 9);
    const tall = framingDistance(100, 34, 9 / 16);
    expect(wide).toBeGreaterThan(100);
    expect(tall).toBeGreaterThan(wide);
    expect(framingDistance(200, 34, 16 / 9)).toBeCloseTo(wide * 2, 6);
  });
});
