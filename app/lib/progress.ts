"use client";

/**
 * Cadet progress: the one place the app reads and writes "where am I".
 *
 * localStorage is a shared mutable resource with no change notification inside
 * a tab, so three screens reading it independently would drift (fold a plane,
 * go back to the hangar, and the wings stamp would be missing until reload).
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

export function wingsEarned(stored: Stored): number {
  return Object.keys(stored.completed).length;
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

/** Forget the resume position. Wings, once earned, are never taken away. */
export function clearProgress(planeId: PlaneId): void {
  writeStored((prev) => {
    const next = { ...prev.progress };
    delete next[planeId];
    return { ...prev, progress: next };
  });
  invalidate();
}

// --- Hooks ---------------------------------------------------------------

export function useProgressSnapshot(): Stored {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function usePlaneProgress(planeId: PlaneId): PlaneProgress {
  return planeProgress(useProgressSnapshot(), planeId);
}

export function useWingsEarned(): number {
  return wingsEarned(useProgressSnapshot());
}

/** Test-only: drop the cached snapshot so a fresh localStorage read happens. */
export function __resetProgressCache(): void {
  invalidate();
}
