import { describe, expect, it } from "vitest";
import { FLIGHT_TUNING, advanceRunTimer } from "@/engine/flight";

describe("flight timer", () => {
  it("advances deterministically and stops exactly at 90 seconds", () => {
    expect(advanceRunTimer(10_000, 1 / 120)).toEqual({ elapsedMs: 10_000 + 1000 / 120, timedOut: false });
    expect(advanceRunTimer(89_999, 2)).toEqual({ elapsedMs: FLIGHT_TUNING.runLimitMs, timedOut: true });
    expect(advanceRunTimer(Number.NaN, -2)).toEqual({ elapsedMs: 0, timedOut: false });
  });
});
