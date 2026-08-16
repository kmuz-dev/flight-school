/**
 * The Hangar bay's flight model.
 *
 * Every claim below is one you would otherwise have to make by watching the
 * screen and hoping - "they never cross", "no two breathe together", "reduced
 * motion holds them still" - which is exactly why the model was pulled out of
 * the component. None of this needs a browser.
 */
import { describe, expect, it } from "vitest";
import { PLANE_IDS } from "@/content";
import {
  FLOAT,
  SWAP,
  baseWidth,
  beginSwap,
  flightPosition,
  floatPhase,
  frame,
  pruneFlights,
  transitionMs,
  type Flight,
} from "@/components/hangar/flight";

const SIZE = { width: 1200, height: 700 } as const;
const scaleOf = (): number => 1;

function at(options: {
  restId: string;
  flights?: readonly Flight[];
  now: number;
  reducedMotion?: boolean;
}) {
  return frame({
    restId: options.restId,
    flights: options.flights ?? [],
    now: options.now,
    size: SIZE,
    reducedMotion: options.reducedMotion ?? false,
    scaleOf,
  });
}

const find = (f: ReturnType<typeof at>, id: string) =>
  f.placements.find((p) => p.planeId === id);

describe("floatPhase", () => {
  it("gives the six real aircraft six distinct phases", () => {
    const phases = PLANE_IDS.map(floatPhase);
    expect(new Set(phases).size).toBe(PLANE_IDS.length);
    for (const phase of phases) {
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThan(1);
    }
  });

  it("is a pure function of the id, so a reload does not reshuffle the bay", () => {
    expect(floatPhase("dart")).toBe(floatPhase("dart"));
    expect(floatPhase("dart")).not.toBe(floatPhase("hammer"));
  });
});

describe("the idle float", () => {
  it("repeats the bob every 4 seconds and the sway every 6.5", () => {
    const base = at({ restId: "dart", now: 10_000 });
    const bobPeriod = at({ restId: "dart", now: 10_000 + FLOAT.bobSeconds * 1000 });
    const swayPeriod = at({ restId: "dart", now: 10_000 + FLOAT.swaySeconds * 1000 });

    expect(find(bobPeriod, "dart")!.y).toBeCloseTo(find(base, "dart")!.y, 6);
    expect(find(swayPeriod, "dart")!.x).toBeCloseTo(find(base, "dart")!.x, 6);
  });

  it("banks into the drift rather than wobbling against it", () => {
    /*
     * The bank is the DERIVATIVE of the sideways drift, which is what rolls the
     * aircraft into the slide instead of fighting it. Two signals a quarter
     * period apart trace an ellipse, so the invariant is exact at every instant
     * rather than something to eyeball at four sampled points:
     *
     *   (drift / driftMax)^2 + (roll / bankMax)^2 = 1
     *
     * A bank merely correlated with the drift - the wobble this rules out -
     * would sit on a line through the origin instead.
     */
    const radius = baseWidth(SIZE) / 2;
    for (let now = 30_000; now < 30_000 + FLOAT.swaySeconds * 1000; now += 137) {
      const p = find(at({ restId: "dart", now }), "dart")!;
      const drift = p.x / (FLOAT.drift * radius);
      const roll = p.rollDeg / FLOAT.bankDeg;
      expect(drift ** 2 + roll ** 2).toBeCloseTo(1, 6);
    }
  });

  it("scales with the aircraft, so every bay breathes by the same angle", () => {
    const wide = frame({
      restId: "dart",
      flights: [],
      now: 12_345,
      size: SIZE,
      reducedMotion: false,
      scaleOf: () => 2,
    });
    const narrow = at({ restId: "dart", now: 12_345 });
    expect(find(wide, "dart")!.y / find(narrow, "dart")!.y).toBeCloseTo(2, 6);
    // The roll is an angle and must NOT scale with the model.
    expect(find(wide, "dart")!.rollDeg).toBeCloseTo(find(narrow, "dart")!.rollDeg, 6);
  });

  it("holds still under reduced motion, and stays framed", () => {
    const still = at({ restId: "dart", now: 33_333, reducedMotion: true });
    const placement = find(still, "dart")!;
    expect(placement.x).toBe(0);
    expect(placement.y).toBe(-0);
    expect(placement.rollDeg).toBe(-0);
    // Lifted and drawn, not hidden: the staging is not motion.
    expect(placement.alpha).toBe(1);
    expect(placement.width).toBeGreaterThan(0);
  });

  it("is a function of the clock, not of how many frames have run", () => {
    const dense = at({ restId: "dart", now: 5_000 });
    const sparse = at({ restId: "dart", now: 5_000 });
    expect(find(dense, "dart")).toEqual(find(sparse, "dart"));
  });
});

describe("beginSwap", () => {
  const swap = (inFlight: readonly Flight[] = [], now = 1_000, dir: 1 | -1 = 1) =>
    beginSwap({ fromId: "dart", toId: "bulldog", dir, now, inFlight, reducedMotion: false });

  it("sends the leader out and the follower in along the one shared route", () => {
    const [out, into] = swap();
    expect(out!.planeId).toBe("dart");
    expect(out!.role).toBe("out");
    expect(out!.fromQ).toBe(0);
    expect(out!.toQ).toBe(1);
    expect(into!.planeId).toBe("bulldog");
    expect(into!.role).toBe("in");
    expect(into!.toQ).toBe(0);
    expect(into!.fromQ).toBeLessThan(0);
  });

  it("keeps the follower a whole aircraft behind, so the two can never cross", () => {
    const flights = swap();
    for (let t = 0; t <= SWAP.ms; t += 20) {
      const now = 1_000 + t;
      const positions = flights.map((f) => flightPosition(f, now));
      const leader = positions[flights.findIndex((f) => f.role === "out")]!;
      const follower = positions[flights.findIndex((f) => f.role === "in")]!;
      expect(leader).toBeGreaterThanOrEqual(follower);
    }
  });

  it("starts an interrupted swap from where the aircraft actually got to", () => {
    const first = swap();
    const mid = 1_000 + SWAP.ms * 0.4;
    // Now change our mind and go back: what was arriving becomes what leaves.
    const second = beginSwap({
      fromId: "bulldog",
      toId: "dart",
      dir: -1,
      now: mid,
      inFlight: first,
      reducedMotion: false,
    });

    const leaving = second.find((f) => f.planeId === "bulldog" && f.role === "out")!;
    const arriving = second.find((f) => f.planeId === "dart" && f.role === "in")!;
    // Not from a standing start: it picks up mid-arrival.
    expect(leaving.fromQ).toBeCloseTo(flightPosition(first[1]!, mid), 6);
    // And the Dart re-enters from wherever its own departure had reached.
    expect(arriving.fromQ).toBeGreaterThan(0);
    expect(arriving.toQ).toBe(0);
  });

  it("keeps at most one earlier departure, so a triple-tap is a queue not a crowd", () => {
    let flights = beginSwap({
      fromId: "dart", toId: "bulldog", dir: 1, now: 0, inFlight: [], reducedMotion: false,
    });
    flights = beginSwap({
      fromId: "bulldog", toId: "harrier", dir: 1, now: 40, inFlight: flights, reducedMotion: false,
    });
    flights = beginSwap({
      fromId: "harrier", toId: "sea-glider", dir: 1, now: 80, inFlight: flights, reducedMotion: false,
    });
    expect(flights.filter((f) => f.role === "out")).toHaveLength(2);
  });

  it("still swaps under reduced motion, only faster", () => {
    expect(transitionMs(true)).toBe(SWAP.reducedMs);
    expect(transitionMs(false)).toBe(SWAP.ms);
    const quick = beginSwap({
      fromId: "dart", toId: "bulldog", dir: 1, now: 0, inFlight: [], reducedMotion: true,
    });
    expect(quick.every((f) => f.duration <= SWAP.reducedMs)).toBe(true);
  });
});

describe("frame", () => {
  it("draws the resting aircraft when nothing is in flight", () => {
    const f = at({ restId: "harrier", now: 900 });
    expect(f.placements.map((p) => p.planeId)).toEqual(["harrier"]);
  });

  it("layers the travel over the float, so a handover has no seam", () => {
    const flights = beginSwap({
      fromId: "dart", toId: "bulldog", dir: 1, now: 0, inFlight: [], reducedMotion: false,
    });
    const mid = at({ restId: "bulldog", flights, now: SWAP.ms * 0.5 });

    const leaving = find(mid, "dart")!;
    const arriving = find(mid, "bulldog")!;
    // Along the nose axis: down and to the left, never along a horizontal rail.
    expect(leaving.x).toBeLessThan(0);
    expect(leaving.y).toBeGreaterThan(0);
    // Coming toward you on the way out, arriving from far off on the way in.
    expect(leaving.scale).toBeGreaterThan(1);
    expect(arriving.scale).toBeLessThan(1);
  });

  it("drops a departure once it has left, and keeps an arrival to the end", () => {
    const flights = beginSwap({
      fromId: "dart", toId: "bulldog", dir: 1, now: 0, inFlight: [], reducedMotion: false,
    });
    const after = at({ restId: "bulldog", flights, now: SWAP.ms * 2 });
    expect(after.placements.map((p) => p.planeId)).toEqual(["bulldog"]);
    expect(pruneFlights(flights, SWAP.ms * 2)).toEqual([]);
  });

  it("fades the shadow as the aircraft rises, so the lift is not read as a zoom", () => {
    // Sample a whole bob period and check the shadow moves against the height.
    const samples = Array.from({ length: 24 }, (_, i) => {
      const now = 40_000 + (i * FLOAT.bobSeconds * 1000) / 24;
      const f = at({ restId: "dart", now });
      return { y: find(f, "dart")!.y, shadow: f.shadow };
    });
    const highest = samples.reduce((a, b) => (a.y < b.y ? a : b));
    const lowest = samples.reduce((a, b) => (a.y > b.y ? a : b));
    expect(highest.shadow.opacity).toBeLessThan(lowest.shadow.opacity);
    expect(highest.shadow.scaleX).toBeGreaterThan(lowest.shadow.scaleX);
  });

  it("sizes the aircraft off the bay, and gives a phone a bigger share of it", () => {
    expect(baseWidth({ width: 1200, height: 700 })).toBeCloseTo(1200 * 0.43, 6);
    expect(baseWidth({ width: 390, height: 700 })).toBeCloseTo(390 * 0.62, 6);
  });

  it("survives a bay with no size at all rather than dividing by it", () => {
    const f = frame({
      restId: "dart",
      flights: [],
      now: 1_000,
      size: { width: 0, height: 0 },
      reducedMotion: false,
      scaleOf,
    });
    expect(Number.isFinite(f.placements[0]!.x)).toBe(true);
    expect(Number.isFinite(f.shadow.opacity)).toBe(true);
  });
});
