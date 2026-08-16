/**
 * The Hangar bay's flight model: where every aircraft in frame is, right now.
 *
 * Pure arithmetic over (flights, time, bay size), deliberately free of React
 * and of the DOM. That is what makes an animation testable at all - the
 * component below it does nothing but read a clock and write transforms, and
 * every claim worth making about the motion ("the two aircraft can never trade
 * places", "no two breathe together", "reduced motion holds them still") is a
 * claim about this file that a unit test can check without a browser.
 *
 * The numbers come from two places and it matters which. The float constants
 * are the shipped engine's own (`app/engine/render/renderer.ts` FLOAT), so an
 * aircraft breathes identically whether it is beauty art in the bay or a live
 * WebGL stage that has woken over it - the handover has no seam. The swap
 * constants are the bay's own.
 */

/** The idle float, shared with the 3D stage so a woken scene does not jump. */
export const FLOAT = {
  bob: 0.06,
  drift: 0.035,
  bankDeg: 5,
  /**
   * 4 and 6.5 seconds are close to 8:13, so the compound path takes about 26
   * seconds to repeat and reads as drift rather than as a loop.
   */
  bobSeconds: 4,
  swaySeconds: 6.5,
} as const;

export const SWAP = {
  ms: 680,
  /** Reduced motion still changes aircraft; it just does not fly them. */
  reducedMs: 180,
  /** The follower enters shortly after the leader departs, on the same route. */
  followDelay: 0.04,
  /**
   * The direction the aircraft points on screen, measured off the artwork: the
   * nose sits low-left and the tail high-right, so a plane leaving nose-first
   * travels down and to the left. Travelling along any other axis is what makes
   * a swap read as a sticker sliding on a rail.
   */
  noseAxis: { x: -0.82, y: 0.57 },
  /** How far along that axis a departing aircraft travels, in bay widths. */
  travel: 0.74,
  /** It is coming toward you, so it grows on the way out. */
  exitScale: 1.12,
  /** And arrives from far off, so it grows into place. */
  enterScale: 0.62,
  /** Lift on the arc, as a fraction of bay height. Straight lines read flat. */
  arc: 0.055,
  rollDeg: 4,
  /**
   * The closest a departing aircraft and its replacement may be on the shared
   * route. Without it, interrupting a swap mid-flight can seat the newcomer
   * ahead of the aircraft it is replacing and the two cross over.
   */
  minimumGap: 0.76,
} as const;

export type FlightRole = "rest" | "in" | "out";

export type Flight = {
  readonly planeId: string;
  readonly role: Exclude<FlightRole, "rest">;
  /** Clock reading at which this leg began, in the same units as `now`. */
  readonly start: number;
  /** +1 when the fleet advanced, -1 when it went back. */
  readonly dir: 1 | -1;
  /** Signed route position at `start`. */
  readonly fromQ: number;
  readonly toQ: number;
  readonly duration: number;
};

export type Placement = {
  readonly planeId: string;
  /** Offset from the aircraft's anchor point, in pixels. */
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly rollDeg: number;
  readonly alpha: number;
  /** Rendered width in pixels, before `scale`. */
  readonly width: number;
};

export type Shadow = {
  readonly opacity: number;
  readonly scaleX: number;
  readonly scaleY: number;
};

export type BaySize = { readonly width: number; readonly height: number };

/** FNV-1a, the engine's own phase hash, so no two aircraft breathe together. */
export function floatPhase(id: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return ((hash >>> 0) % 1024) / 1024;
}

const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));

export function transitionMs(reducedMotion: boolean): number {
  return reducedMotion ? SWAP.reducedMs : SWAP.ms;
}

/** Signed position on the one shared route: -1 entering, 0 resting, +1 gone. */
export function flightPosition(flight: Flight, now: number): number {
  const t = clamp01((now - flight.start) / flight.duration);
  return flight.fromQ + (flight.toQ - flight.fromQ) * t;
}

/**
 * The pair of legs that move the bay from `fromId` to `toId`.
 *
 * Interrupting is the point: whatever is currently arriving becomes the thing
 * leaving, from wherever it happens to have got to, so holding an arrow key
 * feels like flicking through a reel rather than waiting out a queue. That is
 * why both legs are built from the CURRENT positions of any flights already in
 * the air rather than from a standing start.
 */
export function beginSwap(options: {
  readonly fromId: string;
  readonly toId: string;
  readonly dir: 1 | -1;
  readonly now: number;
  readonly inFlight: readonly Flight[];
  readonly reducedMotion: boolean;
}): Flight[] {
  const { fromId, toId, dir, now, inFlight, reducedMotion } = options;
  const span = transitionMs(reducedMotion);

  const leaving = inFlight.find((flight) => flight.planeId === fromId);
  const returning = inFlight.find((flight) => flight.planeId === toId);
  const leavingQ = leaving ? flightPosition(leaving, now) : 0;

  let enteringQ = returning ? flightPosition(returning, now) : -dir * SWAP.travel;
  const furthestAllowed = leavingQ - dir * SWAP.minimumGap;
  enteringQ =
    dir > 0 ? Math.min(enteringQ, furthestAllowed) : Math.max(enteringQ, furthestAllowed);

  /*
   * One earlier departure is kept so a fast triple-tap still shows a queue of
   * aircraft leaving rather than snapping the middle one out of existence.
   * Only one: any more and the bay fills with traffic nobody asked for.
   */
  const stillLeaving = inFlight.filter(
    (flight) =>
      flight.role === "out" &&
      flight.dir === dir &&
      flight.planeId !== fromId &&
      flight.planeId !== toId &&
      (now - flight.start) / flight.duration < 1,
  );

  return [
    ...stillLeaving.slice(-1),
    {
      planeId: fromId,
      role: "out",
      start: now,
      dir,
      fromQ: leavingQ,
      toQ: dir,
      duration: span * Math.abs(dir - leavingQ),
    },
    {
      planeId: toId,
      role: "in",
      start: now + span * SWAP.followDelay,
      dir,
      fromQ: enteringQ,
      toQ: 0,
      duration: span * Math.abs(enteringQ),
    },
  ];
}

/** Drop the legs that have finished. A departure ends; an arrival becomes rest. */
export function pruneFlights(flights: readonly Flight[], now: number): Flight[] {
  return flights.filter((flight) => (now - flight.start) / flight.duration < 1);
}

/** How wide an aircraft is drawn, before its own optical correction. */
export function baseWidth(size: BaySize): number {
  return size.width * (size.width <= 860 ? 0.62 : 0.43);
}

export type FrameInput = {
  readonly restId: string;
  readonly flights: readonly Flight[];
  /** Milliseconds from an arbitrary origin; only differences are used. */
  readonly now: number;
  readonly size: BaySize;
  readonly reducedMotion: boolean;
  /** Per-aircraft optical correction from the presentation manifest. */
  readonly scaleOf: (planeId: string) => number;
};

export type Frame = {
  readonly placements: readonly Placement[];
  readonly shadow: Shadow;
};

/**
 * Every aircraft in frame this tick, plus the contact shadow under the one at
 * rest.
 *
 * The travel is layered OVER the float rather than replacing it, which is what
 * makes the handover seamless: an arriving aircraft is already breathing on the
 * way in, so nothing starts or stops at the moment it settles.
 */
export function frame(input: FrameInput): Frame {
  const { restId, flights, now, size, reducedMotion, scaleOf } = input;
  const seconds = now / 1000;
  const breathe = reducedMotion ? 0 : 1;

  const active: readonly { planeId: string; flight: Flight | null }[] = [
    ...(flights.some((f) => f.planeId === restId) ? [] : [{ planeId: restId, flight: null }]),
    ...flights.map((flight) => ({ planeId: flight.planeId, flight })),
  ];

  const placements: Placement[] = [];
  let resting: { bob: number; alpha: number; scale: number } | null = null;

  for (const { planeId, flight } of active) {
    const width = baseWidth(size) * scaleOf(planeId);
    const radius = width / 2;

    // --- the idle float, identical for every aircraft in frame ---
    const phase = 2 * Math.PI * floatPhase(planeId);
    // Golden-ratio offset, so an aircraft's bob and sway are not in step either.
    const swayPhase = 2 * Math.PI * ((floatPhase(planeId) * 1.618033988749895) % 1);
    const sway = (2 * Math.PI * seconds) / FLOAT.swaySeconds + swayPhase;
    const bob =
      breathe * FLOAT.bob * radius * Math.sin((2 * Math.PI * seconds) / FLOAT.bobSeconds + phase);
    const drift = breathe * FLOAT.drift * radius * Math.sin(sway);
    // The bank is the DERIVATIVE of the drift, which is what rolls the aircraft
    // INTO the slide instead of wobbling it against one.
    const bank = -breathe * FLOAT.bankDeg * Math.cos(sway);

    let x = drift;
    let y = -bob;
    let scale = 1;
    let rollDeg = bank;
    let alpha = 1;
    let settled = flight === null;

    // --- the travel, layered over the float so the handover has no seam ---
    if (flight) {
      const t = clamp01((now - flight.start) / flight.duration);
      const q = now < flight.start ? flight.fromQ : flightPosition(flight, now);
      const lane = q * flight.dir;
      const away = SWAP.travel * size.width * q;

      x += SWAP.noseAxis.x * away;
      y += SWAP.noseAxis.y * away;
      y += Math.sin(Math.PI * lane) * SWAP.arc * size.height;

      if (q >= 0) {
        scale = 1 + (SWAP.exitScale - 1) * Math.abs(q);
        alpha = 1 - clamp01((Math.abs(q) - 0.52) / 0.48) ** 1.25;
      } else {
        scale = 1 - (1 - SWAP.enterScale) * Math.abs(q);
        alpha = clamp01((1 - Math.abs(q)) / 0.3);
      }
      rollDeg += Math.sin(Math.PI * lane) * SWAP.rollDeg * flight.dir;

      if (flight.role === "out" && t >= 1) continue;
      settled = flight.role === "in" && t >= 0.98;
    }

    placements.push({ planeId, x, y, scale, rollDeg, alpha, width });
    if (settled) {
      resting = { bob: breathe === 0 ? 0 : bob / (FLOAT.bob * radius || 1), alpha, scale };
    }
  }

  /*
   * The contact shadow answers the bob: higher reads as wider and fainter,
   * which is what tells you the aircraft rose rather than that it grew.
   */
  const s = resting ?? { bob: 0, alpha: 1, scale: 1 };
  const spread = 1 + s.bob * 0.16;
  return {
    placements,
    shadow: {
      opacity: (0.5 * s.alpha) / spread,
      scaleX: spread * s.scale,
      scaleY: spread * 0.9,
    },
  };
}
