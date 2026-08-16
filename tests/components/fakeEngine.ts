/**
 * A `FoldEngineHandle` that touches no WebGL, so screen tests exercise the
 * React shell rather than the 3D stage (which has its own suite under
 * tests/render).
 */
import type { EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

export type FakeEngineLog = {
  readonly created: { structure: PlaneStructure; opts: EngineOptions }[];
  readonly steps: number[];
  readonly stepAnimations: boolean[];
  readonly renderActive: boolean[];
  played: number;
  paused: number;
  replayed: number;
  disposed: number;
};

export function createFakeEngineFactory(
  renderMode: FoldEngineHandle["renderMode"] = "webgl",
): {
  factory: (
    container: HTMLElement,
    structure: PlaneStructure,
    opts?: EngineOptions,
  ) => FoldEngineHandle;
  log: FakeEngineLog;
} {
  const log: FakeEngineLog = {
    created: [],
    steps: [],
    stepAnimations: [],
    renderActive: [],
    played: 0,
    paused: 0,
    replayed: 0,
    disposed: 0,
  };

  const factory = (
    _container: HTMLElement,
    structure: PlaneStructure,
    opts?: EngineOptions,
  ): FoldEngineHandle => {
    log.created.push({ structure, opts: opts ?? {} });
    opts?.onReady?.();
    return {
      renderMode,
      setRenderActive(active: boolean): void {
        log.renderActive.push(active);
      },
      gotoStep(n: number, stepOpts?: { animate?: boolean }): void {
        log.steps.push(n);
        log.stepAnimations.push(stepOpts?.animate !== false);
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
        duration: 1,
        paused: true,
      },
      setCameraPreset(): void {},
      on(): () => void {
        return () => {};
      },
      resize(): void {},
      dispose(): void {
        log.disposed += 1;
      },
    };
  };

  return { factory, log };
}
