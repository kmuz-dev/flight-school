/**
 * @vitest-environment jsdom
 *
 * The progress store lives in the `unit` project rather than `components`
 * because it is a store, not a screen - but the bug it exists to prevent (a
 * stale cached snapshot after a write) only reproduces through React's
 * subscription, so this one file opts into jsdom locally.
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  __resetProgressCache,
  clearProgress,
  planeProgress,
  recordCompletion,
  recordStep,
  usePlaneProgress,
  useProgressSnapshot,
  useWingsEarned,
  wingsEarned,
} from "@/lib/progress";
import { readStored } from "@/lib/storage";

beforeEach(() => {
  window.localStorage.clear();
  __resetProgressCache();
});

afterEach(() => {
  window.localStorage.clear();
  __resetProgressCache();
});

describe("selectors", () => {
  it("reports no resume position for a plane never started", () => {
    expect(planeProgress({ progress: {}, completed: {} }, "dart")).toEqual({
      resumeStep: null,
      completed: false,
    });
  });

  it("treats step 0 as not-yet-started, so the button reads Start not Resume", () => {
    const stored = { progress: { dart: { step: 0, updatedAt: "x" } }, completed: {} };
    expect(planeProgress(stored, "dart").resumeStep).toBeNull();
  });

  it("counts one wing per completed plane", () => {
    expect(wingsEarned({ progress: {}, completed: { dart: { at: "x" }, hammer: { at: "y" } } })).toBe(2);
  });
});

describe("mutations", () => {
  it("persists a step and reads it back", () => {
    recordStep("dart", 4);
    expect(readStored().progress.dart?.step).toBe(4);
  });

  it("ignores a nonsensical step index rather than corrupting storage", () => {
    recordStep("dart", -1);
    recordStep("dart", 1.5);
    expect(readStored().progress.dart).toBeUndefined();
  });

  it("keeps the date wings were first earned when a plane is re-folded", () => {
    recordCompletion("dart");
    const first = readStored().completed.dart?.at;
    recordCompletion("dart");
    expect(readStored().completed.dart?.at).toBe(first);
  });

  it("clears the resume position without taking earned wings away", () => {
    recordStep("dart", 7);
    recordCompletion("dart");
    clearProgress("dart");
    const stored = readStored();
    expect(stored.progress.dart).toBeUndefined();
    expect(stored.completed.dart).toBeDefined();
  });
});

describe("subscription", () => {
  it("re-renders subscribers after a write, so the hangar stamp never lags", () => {
    const { result } = renderHook(() => usePlaneProgress("dart"));
    expect(result.current).toEqual({ resumeStep: null, completed: false });

    act(() => recordStep("dart", 5));
    expect(result.current.resumeStep).toBe(5);

    act(() => recordCompletion("dart"));
    expect(result.current.completed).toBe(true);
  });

  it("hands every subscriber the same snapshot identity between writes", () => {
    const a = renderHook(() => useProgressSnapshot());
    const b = renderHook(() => useProgressSnapshot());
    expect(a.result.current).toBe(b.result.current);
  });

  it("updates the wings counter from a write made on another screen", () => {
    const { result } = renderHook(() => useWingsEarned());
    expect(result.current).toBe(0);
    act(() => recordCompletion("harrier"));
    expect(result.current).toBe(1);
  });

  it("picks up a write from another tab", () => {
    const { result } = renderHook(() => useWingsEarned());
    window.localStorage.setItem(
      "flightschool.v1",
      JSON.stringify({ progress: {}, completed: { hammer: { at: "x" } } }),
    );
    act(() => {
      window.dispatchEvent(new StorageEvent("storage"));
    });
    expect(result.current).toBe(1);
  });
});
