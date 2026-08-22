import { describe, expect, it } from "vitest";
import { flightPixelRatio } from "@/engine/flight";

describe("flight render quality", () => {
  it("uses high-density rendering on Retina desktop and mobile screens", () => {
    expect(flightPixelRatio(1440, 900, 2.5)).toBeGreaterThan(2.35);
    expect(flightPixelRatio(393, 852, 3)).toBe(2.25);
  });

  it("keeps very large displays inside the render-pixel budget", () => {
    const ratio = flightPixelRatio(1920, 1080, 2);
    expect(ratio).toBeGreaterThan(1.8);
    expect(1920 * 1080 * ratio * ratio).toBeLessThanOrEqual(7_500_001);
  });

  it("never returns a sub-native or non-finite ratio", () => {
    expect(flightPixelRatio(3840, 2160, 2)).toBe(1);
    expect(flightPixelRatio(Number.NaN, Number.NaN, Number.NaN)).toBe(1);
  });
});
