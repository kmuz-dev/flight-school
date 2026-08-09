/**
 * Contract-conforming stub engine for headless UI development (Phase 0 fixture).
 * T3 builds the tutorial screen against this; integration swaps in the real
 * engine behind the identical FoldEngineHandle seam. No Three.js, no DOM beyond
 * a text placeholder painted into the container.
 */
import type { EngineEvent, EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

export function createStubEngine(
  container: HTMLElement,
  structure: PlaneStructure,
  opts?: EngineOptions,
): FoldEngineHandle {
  let step = 0;
  let progress = 0;
  let paused = true;
  let raf = 0;
  const listeners = new Map<EngineEvent, Set<(payload: unknown) => void>>();

  const emit = (event: EngineEvent, payload: unknown) => {
    listeners.get(event)?.forEach((cb) => cb(payload));
  };

  const label = document.createElement("div");
  label.dataset.testid = "stub-engine";
  label.style.cssText =
    "display:flex;align-items:center;justify-content:center;height:100%;font-family:monospace;opacity:.5";
  const paint = () => {
    label.textContent = `[stub] ${structure.id} step ${step + 1}/${structure.steps.length} t=${progress.toFixed(2)}`;
  };
  paint();
  container.appendChild(label);
  opts?.onReady?.();

  const tick = () => {
    if (!paused) {
      progress = Math.min(1, progress + 1 / 60);
      emit("progress", progress);
      if (progress >= 1) {
        paused = true;
        emit("stepComplete", step);
      }
      paint();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    gotoStep(n, o) {
      step = Math.max(0, Math.min(n, structure.steps.length - 1));
      progress = o?.animate === false ? 1 : 0;
      paused = o?.animate === false;
      paint();
    },
    replay() {
      progress = 0;
      paused = false;
    },
    timeline: {
      play() {
        paused = false;
      },
      pause() {
        paused = true;
      },
      progress(v?: number) {
        if (v !== undefined) {
          progress = Math.max(0, Math.min(1, v));
          paint();
        }
        return progress;
      },
      get duration() {
        return 1.2;
      },
      get paused() {
        return paused;
      },
    },
    setCameraPreset() {},
    on(event, cb) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(cb);
      return () => listeners.get(event)?.delete(cb);
    },
    resize() {},
    dispose() {
      cancelAnimationFrame(raf);
      label.remove();
      listeners.clear();
    },
  };
}
