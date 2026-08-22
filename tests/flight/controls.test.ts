import { describe, expect, it } from "vitest";
import { FLIGHT_TUNING, flightPadInput, launchFromCharge, launchFromDrag, tiltInput } from "@/engine/flight";

describe("flight control mapping", () => {
  it("bounds weak, strong, and malformed flicks", () => {
    expect(launchFromDrag(0, 0).power).toBe(FLIGHT_TUNING.launchMinPower);
    const strong = launchFromDrag(10_000, 10_000);
    expect(strong).toEqual({ power: 1, heading: 0.2, pitch: 0.24 });
    expect(launchFromDrag(Number.NaN, Number.NaN)).toEqual({ power: 0.42, heading: 0, pitch: 0.05 });
  });

  it("maps keyboard charge monotonically inside the guided envelope", () => {
    const weak = launchFromCharge(-10, { heading: 0, pitch: 0.08 });
    const medium = launchFromCharge(550, { heading: 0, pitch: 0.08 });
    const strong = launchFromCharge(5_000, { heading: 0, pitch: 0.08 });
    expect(weak.power).toBe(0.42);
    expect(medium.power).toBeGreaterThan(weak.power);
    expect(strong.power).toBe(1);
  });

  it("keeps pointer and tilt axes physical and rejects invalid sensors", () => {
    expect(flightPadInput(85, 85)).toEqual({ turn: 1, pitch: 1 });
    expect(tiltInput(92, 12, { beta: 90, gamma: 0 })).toEqual({ turn: 0.5, pitch: -2 / 28 });
    expect(tiltInput(Number.NaN, 12, { beta: 90, gamma: 0 })).toBeNull();
  });
});
