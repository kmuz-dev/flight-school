import { describe, expect, it } from "vitest";
import { mergeFlightResult } from "@/engine/flight";

describe("per-plane flight records", () => {
  it("keeps each independent personal best", () => {
    const first = mergeFlightResult(undefined, { elapsedMs: 70_000, closePasses: 4, bestChain: 3 }, "first");
    const second = mergeFlightResult(first, { elapsedMs: 74_000, closePasses: 6, bestChain: 2 }, "second");
    expect(second).toEqual({
      bestTimeMs: 70_000,
      bestClosePasses: 6,
      bestChain: 3,
      updatedAt: "second",
    });
  });
});
