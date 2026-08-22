/**
 * A `FoldEngineHandle` that touches no WebGL, so screen tests exercise the
 * React shell rather than the 3D stage (which has its own suite under
 * tests/render).
 */
import type { EngineEvent, EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

export type FakeEngineLog = {
  readonly created: { structure: PlaneStructure; opts: EngineOptions }[];
  readonly steps: number[];
  readonly stepAnimations: boolean[];
  readonly renderActive: boolean[];
  played: number;
  paused: number;
  replayed: number;
  reset: number;
  disposed: number;
  ready(): void;
  emit(event: EngineEvent): void;
};

export function createFakeEngineFactory(
  renderMode: FoldEngineHandle["renderMode"] = "webgl",
  autoReady = true,
  /**
   * Seconds per step index, for the readouts that quote the current fold's
   * length. Both real engines derive it from how far the paper travels, so a
   * fake that reports one number for every step cannot show a screen quoting
   * the wrong one.
   */
  durations: readonly number[] = [],
): {
  factory: (
    container: HTMLElement,
    structure: PlaneStructure,
    opts?: EngineOptions,
  ) => FoldEngineHandle;
  log: FakeEngineLog;
} {
  const listeners = new Map<EngineEvent, Set<(payload: unknown) => void>>();
  const pendingReady: Array<() => void> = [];
  const log: FakeEngineLog = {
    created: [],
    steps: [],
    stepAnimations: [],
    renderActive: [],
    played: 0,
    paused: 0,
    replayed: 0,
    reset: 0,
    disposed: 0,
    ready(): void {
      pendingReady.splice(0).forEach((callback) => callback());
    },
    emit(event: EngineEvent): void {
      listeners.get(event)?.forEach((callback) => callback(undefined));
    },
  };

  const factory = (
    _container: HTMLElement,
    structure: PlaneStructure,
    opts?: EngineOptions,
  ): FoldEngineHandle => {
    log.created.push({ structure, opts: opts ?? {} });
    if (opts?.onReady) {
      if (autoReady) opts.onReady();
      else pendingReady.push(opts.onReady);
    }
    const ownedListeners = new Map<EngineEvent, (payload: unknown) => void>();
    let stepIndex = 0;
    const announce = (event: EngineEvent, payload: unknown): void => {
      listeners.get(event)?.forEach((callback) => callback(payload));
    };
    return {
      renderMode,
      setRenderActive(active: boolean): void {
        log.renderActive.push(active);
      },
      gotoStep(n: number, stepOpts?: { animate?: boolean }): void {
        stepIndex = n;
        log.steps.push(n);
        log.stepAnimations.push(stepOpts?.animate !== false);
        // Both real engines report the playhead as soon as the new step's
        // timeline exists, which is how anything reading alongside it stays
        // in step. See FoldEngine.setStep and the fallback's `announce`.
        announce("progress", 0);
      },
      replay(): void {
        log.replayed += 1;
      },
      timeline: {
        play(): void {
          log.played += 1;
        },
        pause(): void {
          log.paused += 1;
        },
        progress(): number {
          return 1;
        },
        get duration(): number {
          return durations[stepIndex] ?? 1;
        },
        paused: true,
      },
      setCameraPreset(): void {},
      resetView(): void {
        log.reset += 1;
      },
      on(event: EngineEvent, callback: (payload: unknown) => void): () => void {
        let set = listeners.get(event);
        if (!set) {
          set = new Set();
          listeners.set(event, set);
        }
        set.add(callback);
        ownedListeners.set(event, callback);
        return () => {
          listeners.get(event)?.delete(callback);
          ownedListeners.delete(event);
        };
      },
      resize(): void {},
      dispose(): void {
        ownedListeners.forEach((callback, event) => listeners.get(event)?.delete(callback));
        ownedListeners.clear();
        log.disposed += 1;
      },
    };
  };

  return { factory, log };
}
