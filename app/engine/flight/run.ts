import { FLIGHT_TUNING } from "./config";

export function advanceRunTimer(elapsedMs: number, deltaSeconds: number): { elapsedMs: number; timedOut: boolean } {
  const safeElapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const safeDelta = Number.isFinite(deltaSeconds) ? Math.max(0, deltaSeconds) : 0;
  const next = Math.min(FLIGHT_TUNING.runLimitMs, safeElapsed + safeDelta * 1000);
  return { elapsedMs: next, timedOut: next >= FLIGHT_TUNING.runLimitMs };
}
