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
import { HERO_VIEW, closeness, project, viewBasis } from "@/engine/view";
import { PLANES } from "@/content";
import { computeFoldState } from "@/engine/core/state";
import { restTransform } from "@/engine/core/rest";
import { multiply, poseForFacet, transformPoint } from "@/engine/core/pose";

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

/**
 * The SVG behind every hangar card and the live scene that wakes over it are
 * two different renderers, and they have to agree about where the viewer is
 * standing. They did not: the flat projection looked at the tail while the
 * stage looked at the nose, and worse, the flat projection was not a camera at
 * all. Its screen axes were built from yaw and pitch independently and came out
 * 26 degrees from perpendicular, so the picture was drawn from one place and
 * depth-sorted from another - a bug that a shared, orthonormal basis makes
 * unrepresentable rather than merely fixed.
 */
describe("one camera convention", () => {
  const dot = (a: readonly number[], b: readonly number[]) =>
    a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
  const norm = (a: readonly number[]) => Math.hypot(a[0]!, a[1]!, a[2]!);

  it("builds an orthonormal screen basis at every angle", () => {
    for (const [azimuthDeg, elevationDeg] of [
      [HERO_VIEW.azimuthDeg, HERO_VIEW.elevationDeg],
      [0, 5],
      [0, 85],
      [140, 60],
      [-179, 2],
    ]) {
      const b = viewBasis(azimuthDeg!, elevationDeg!);
      const at = `az ${azimuthDeg} el ${elevationDeg}`;
      expect(norm(b.right), at).toBeCloseTo(1, 12);
      expect(norm(b.down), at).toBeCloseTo(1, 12);
      expect(norm(b.eye), at).toBeCloseTo(1, 12);
      expect(dot(b.right, b.down), at).toBeCloseTo(0, 12);
      expect(dot(b.right, b.eye), at).toBeCloseTo(0, 12);
      // The one that used to be -0.9.
      expect(dot(b.down, b.eye), at).toBeCloseTo(0, 12);
    }
  });

  it("is right-handed, so the picture is not mirrored", () => {
    const b = viewBasis(HERO_VIEW.azimuthDeg, HERO_VIEW.elevationDeg);
    const cross = [
      b.right[1] * b.down[2] - b.right[2] * b.down[1],
      b.right[2] * b.down[0] - b.right[0] * b.down[2],
      b.right[0] * b.down[1] - b.right[1] * b.down[0],
    ];
    for (let i = 0; i < 3; i += 1) expect(cross[i]).toBeCloseTo(-b.eye[i]!, 12);
  });

  it("puts the flat projection's camera exactly where an orbit at the same angle would", () => {
    // The assertion that stops the SVG and the stage drifting apart again: both
    // build their camera from HERO_VIEW, and this is the proof that the two
    // constructions agree. They used to be 90 degrees of azimuth apart, which
    // is why waking a hangar card swung the aircraft round.
    const b = viewBasis(HERO_VIEW.azimuthDeg, HERO_VIEW.elevationDeg);
    const orbit = orbitToPosition({ ...HERO_VIEW, distance: 1 }, ORIGIN);
    expect(b.eye[0]).toBeCloseTo(orbit.x, 9);
    expect(b.eye[1]).toBeCloseTo(orbit.y, 9);
    expect(b.eye[2]).toBeCloseTo(orbit.z, 9);
  });

  it("keeps the hero angle out of the fold steps' own presets", () => {
    // Two different questions. A preset answers "where does this fold read
    // best" and is authored into content; the hero angle answers "where does
    // this aircraft look like itself" and no step may ask for it.
    for (const preset of Object.values(CAMERA_PRESETS)) {
      expect(preset).not.toEqual(HERO_VIEW);
    }
  });

  it("hides motion along the view axis, which is what orthographic means", () => {
    // The decisive symptom: a point pushed 100mm directly away from the viewer
    // used to slide 90mm up the page.
    const b = viewBasis(HERO_VIEW.azimuthDeg, HERO_VIEW.elevationDeg);
    const away: [number, number, number] = [b.eye[0] * 100, b.eye[1] * 100, b.eye[2] * 100];
    const [x0, y0] = project(b, [0, 0, 0]);
    const [x1, y1] = project(b, away);
    expect(x1 - x0).toBeCloseTo(0, 9);
    expect(y1 - y0).toBeCloseTo(0, 9);
    expect(closeness(b, away)).toBeCloseTo(100, 9);
  });

  it.each(Object.keys(PLANES))("shows %s its nose, not its tail", (id) => {
    // The property a cadet actually sees, stated in the product's terms.
    //
    // The nose is found as the SHARP end - the end where the model is narrow -
    // rather than by assuming an axis. Every plane in the catalogue ends with a
    // 180-degree `rotate`, so the apex the sequence builds at +y is at -y when
    // it is finished, and a test that assumed +y passed while asserting the
    // exact opposite of what it claimed. That is how the hero angle came to be
    // pointed at the catalogue's tails in the first place.
    const b = viewBasis(HERO_VIEW.azimuthDeg, HERO_VIEW.elevationDeg);
    const plane = PLANES[id]!;
    const state = computeFoldState(plane, plane.steps.length - 1);
    const rest = restTransform(state);
    const pts: [number, number, number][] = [];
    for (const facet of state.facets) {
      const pose = multiply(rest, poseForFacet(facet));
      for (const p of facet.polygon) pts.push(transformPoint(pose, p));
    }
    const ys = pts.map((p) => p[1]);
    const lowY = Math.min(...ys);
    const highY = Math.max(...ys);
    const spanAt = (from: number, to: number) => {
      const xs = pts.filter((p) => p[1] >= from && p[1] <= to).map((p) => p[0]);
      return Math.max(...xs) - Math.min(...xs);
    };
    const band = (highY - lowY) * 0.12;
    const noseAtLowY = spanAt(lowY, lowY + band) < spanAt(highY - band, highY);
    const nose = pts.find((p) => p[1] === (noseAtLowY ? lowY : highY))!;
    const tail = pts.find((p) => p[1] === (noseAtLowY ? highY : lowY))!;
    expect(closeness(b, nose), `${id}: the nose must face the viewer`).toBeGreaterThan(
      closeness(b, tail),
    );
  });
});
