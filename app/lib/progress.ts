"use client";

/**
 * Cadet progress: the one place the app reads and writes "where am I".
 *
 * localStorage is a shared mutable resource with no change notification inside
 * a tab, so three screens reading it independently would drift (fold a plane,
 * go back to the hangar, and the wings marker would be missing until reload).
 * This module owns a single cached snapshot behind `useSyncExternalStore`, so
 * every subscriber re-renders together on any write, and cross-tab `storage`
 * events invalidate it too.
 *
 * Hydration: the server snapshot is always empty, which is what the static
 * export prerenders. React re-renders with the real snapshot immediately after
 * hydration, so badges and resume state appear without a mismatch warning.
 */
import { useSyncExternalStore } from "react";
import type { PlaneId } from "@/content/types";
import type { PaperFormat } from "@/engine/core/types";
import { mergeFlightResult } from "@/engine/flight/results";
import type { FlightRecord, FlightRunResult } from "@/engine/flight/types";
import { readStored, writeStored, type Stored } from "./storage";

const EMPTY: Stored = { progress: {}, completed: {} };

let cache: Stored | null = null;
let windowBound = false;
const listeners = new Set<() => void>();

function invalidate(): void {
  cache = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  if (!windowBound && typeof window !== "undefined") {
    windowBound = true;
    window.addEventListener("storage", invalidate);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Stored {
  // Identity must be stable between writes or useSyncExternalStore loops.
  cache ??= readStored();
  return cache;
}

function getServerSnapshot(): Stored {
  return EMPTY;
}

// --- Selectors (pure; unit-tested without React) -------------------------

export type PlaneProgress = {
  /** 0-based step to resume at, or null if the cadet has never started. */
  readonly resumeStep: number | null;
  readonly completed: boolean;
};

export function planeProgress(stored: Stored, planeId: PlaneId): PlaneProgress {
  const entry = stored.progress[planeId];
  return {
    resumeStep: entry && Number.isInteger(entry.step) && entry.step > 0 ? entry.step : null,
    completed: stored.completed[planeId] !== undefined,
  };
}

/** Which sheet the cadet said they have, if they have said. */
export function paperChoice(stored: Stored, planeId: PlaneId): PaperFormat | null {
  return stored.paperChoice?.[planeId] ?? null;
}

export function wingsEarned(stored: Stored): number {
  return Object.keys(stored.completed).length;
}

export function flightRecord(stored: Stored, planeId: PlaneId): FlightRecord | null {
  return stored.flights?.[planeId] ?? null;
}

// --- Mutations -----------------------------------------------------------

export function recordStep(planeId: PlaneId, step: number): void {
  if (!Number.isInteger(step) || step < 0) return;
  writeStored((prev) => ({
    ...prev,
    progress: { ...prev.progress, [planeId]: { step, updatedAt: new Date().toISOString() } },
  }));
  invalidate();
}

export function recordCompletion(planeId: PlaneId): void {
  writeStored((prev) =>
    // Wings keep the date they were first earned; re-folding never resets it.
    prev.completed[planeId] !== undefined
      ? prev
      : { ...prev, completed: { ...prev.completed, [planeId]: { at: new Date().toISOString() } } },
  );
  invalidate();
}

/**
 * Record which sheet the cadet is folding from. Changing it changes the fold
 * sequence (paper prep runs in front of it), so the resume position from the
 * old sheet no longer refers to the same step and is dropped.
 */
export function setPaperChoice(planeId: PlaneId, paper: PaperFormat): void {
  writeStored((prev) => {
    if (prev.paperChoice?.[planeId] === paper) return prev;
    const progress = { ...prev.progress };
    delete progress[planeId];
    return { ...prev, progress, paperChoice: { ...prev.paperChoice, [planeId]: paper } };
  });
  invalidate();
}

/** Forget the resume position. Wings, once earned, are never taken away. */
export function clearProgress(planeId: PlaneId): void {
  writeStored((prev) => {
    const next = { ...prev.progress };
    delete next[planeId];
    return { ...prev, progress: next };
  });
  invalidate();
}

export function recordFlightResult(planeId: PlaneId, result: FlightRunResult): void {
  if (
    !Number.isFinite(result.elapsedMs) ||
    result.elapsedMs <= 0 ||
    !Number.isInteger(result.closePasses) ||
    result.closePasses < 0 ||
    !Number.isInteger(result.bestChain) ||
    result.bestChain < 0
  ) {
    return;
  }
  writeStored((prev) => ({
    ...prev,
    flights: {
      ...prev.flights,
      [planeId]: mergeFlightResult(
        prev.flights?.[planeId],
        result,
        new Date().toISOString(),
      ),
    },
  }));
  invalidate();
}

// --- Hooks ---------------------------------------------------------------

export function useProgressSnapshot(): Stored {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Whether this render is looking at real stored data yet.
 *
 * An empty snapshot is ambiguous and two screens now have to resolve it. The
 * static export prerenders against `getServerSnapshot`, which is empty by
 * definition, so "no wings, no progress, nothing started" is what the first
 * render says on every machine - including one where the cadet finished all six
 * planes a moment ago. Reading that literally is how the Hangar would open on
 * the Dart for someone who has already folded it, and how the completion route
 * would flash "you have not earned this" at someone who just did.
 *
 * A separate signal rather than a sentinel inside `Stored`, because it is a
 * fact about the render pass and not about the cadet: it must be false in the
 * prerendered HTML and true immediately after hydration, which is exactly what
 * the server/client snapshot pair of `useSyncExternalStore` expresses. The
 * constants are frozen so the store never reports a changed value and loops.
 */
const HYDRATED = true;
const NOT_HYDRATED = false;

export function useProgressHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => HYDRATED,
    () => NOT_HYDRATED,
  );
}

export function usePlaneProgress(planeId: PlaneId): PlaneProgress {
  return planeProgress(useProgressSnapshot(), planeId);
}

export function usePaperChoice(planeId: PlaneId): PaperFormat | null {
  return paperChoice(useProgressSnapshot(), planeId);
}

export function useWingsEarned(): number {
  return wingsEarned(useProgressSnapshot());
}

export function useFlightRecord(planeId: PlaneId): FlightRecord | null {
  return flightRecord(useProgressSnapshot(), planeId);
}

/** Test-only: drop the cached snapshot so a fresh localStorage read happens. */
export function __resetProgressCache(): void {
  invalidate();
}
