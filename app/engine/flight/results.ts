import type { FlightRecord, FlightRunResult } from "./types";

export function mergeFlightResult(
  previous: FlightRecord | undefined,
  result: FlightRunResult,
  updatedAt: string,
): FlightRecord {
  return {
    bestTimeMs: previous ? Math.min(previous.bestTimeMs, result.elapsedMs) : result.elapsedMs,
    bestClosePasses: Math.max(previous?.bestClosePasses ?? 0, result.closePasses),
    bestChain: Math.max(previous?.bestChain ?? 0, result.bestChain),
    updatedAt,
  };
}
