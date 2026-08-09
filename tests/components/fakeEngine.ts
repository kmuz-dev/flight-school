/**
 * A `FoldEngineHandle` that touches no WebGL, so screen tests exercise the
 * React shell rather than the 3D stage (which has its own suite under
 * tests/render).
 */
import type { EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

export type FakeEngineLog = {
  readonly created: { structure: PlaneStructure }[];
  readonly steps: number[];
  disposed: number;
};

export function createFakeEngineFactory(): {
  factory: (
    container: HTMLElement,
    structure: PlaneStructure,
    opts?: EngineOptions,
  ) => FoldEngineHandle;
  log: FakeEngineLog;
} {
  const log: FakeEngineLog = { created: [], steps: [], disposed: 0 };

  const factory = (
    _container: HTMLElement,
    structure: PlaneStructure,
    opts?: EngineOptions,
  ): FoldEngineHandle => {
    log.created.push({ structure });
    opts?.onReady?.();
    return {
      gotoStep(n: number): void {
        log.steps.push(n);
      },
      replay(): void {},
      timeline: {
        play(): void {},
        pause(): void {},
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
