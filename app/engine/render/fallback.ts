/**
 * No-WebGL fallback. PRD acceptance criterion: the tutorial stays completable
 * without WebGL, so this mounts the core's flat SVG of the current fold state
 * and emits exactly the same events as the 3D stage. The React shell needs no
 * branch - it holds a `FoldEngineHandle` either way.
 *
 * It imports neither Three.js nor GSAP, directly or transitively, which is what
 * lets the seam in `app/engine/index.ts` reach it statically and hand it out
 * when the renderer chunk cannot be fetched at all. Keep it that way.
 */
import type {
  AnnotationAnchor,
  EngineEvent,
  EngineOptions,
  FoldEngineHandle,
} from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import type { CoreApi } from "./coreApi";
import { stepDuration } from "./duration";
import { resolveDisplayView } from "@/engine/view";

/**
 * All the core this stage needs. Narrower than `CoreApi` on purpose: there are
 * no poses to compute without a 3D scene, and the seam can satisfy this from
 * what it already exports statically.
 */
export type FallbackCore = Pick<CoreApi, "computeFoldState" | "renderStateToSvg">;

const HIDDEN_ANCHOR: AnnotationAnchor = { x: 0, y: 0, visible: false };

/**
 * True when a WebGL context can actually be created. Cheap and cached-free:
 * called once per engine construction, never in a loop.
 */
export function isWebGLAvailable(doc?: Document | null): boolean {
  const document_ =
    doc ?? (typeof globalThis !== "undefined" ? (globalThis as { document?: Document }).document : undefined);
  if (!document_ || typeof document_.createElement !== "function") return false;
  try {
    const canvas = document_.createElement("canvas");
    if (typeof canvas.getContext !== "function") return false;
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    // Release the probe context immediately; browsers cap live contexts.
    const lose = (gl as WebGLRenderingContext).getExtension?.("WEBGL_lose_context");
    (lose as { loseContext?: () => void } | null)?.loseContext?.();
    return true;
  } catch {
    return false;
  }
}

export function createFallbackEngine(
  container: HTMLElement,
  structure: PlaneStructure,
  opts: EngineOptions,
  core: FallbackCore,
): FoldEngineHandle {
  const doc = container.ownerDocument;
  const mount = doc.createElement("div");
  mount.dataset.foldEngine = "fallback";
  mount.style.cssText =
    "display:flex;align-items:center;justify-content:center;width:100%;height:100%";
  container.appendChild(mount);

  const listeners = new Map<EngineEvent, Set<(payload: unknown) => void>>();
  const emit = (event: EngineEvent, payload: unknown): void => {
    const set = listeners.get(event);
    if (!set) return;
    for (const cb of [...set]) cb(payload);
  };

  const lastIndex = Math.max(structure.steps.length - 1, 0);
  let stepIndex = 0;
  let disposed = false;

  const paint = (index: number): void => {
    const state = core.computeFoldState(structure, index);
    const display = opts.display === true;
    mount.innerHTML = core.renderStateToSvg(state, {
      rest: opts.rest === true || display,
      display,
      displayView: display ? resolveDisplayView(opts) : undefined,
    });
  };

  /**
   * The fallback has no animation, so every step is instantly "complete".
   * Deferred so listeners registered right after construction still hear it.
   */
  const announce = (index: number): void => {
    queueMicrotask(() => {
      if (disposed) return;
      emit("progress", 1);
      emit("annotation", HIDDEN_ANCHOR);
      emit("stepComplete", index);
    });
  };

  paint(stepIndex);
  announce(stepIndex);
  opts.onReady?.();

  return {
    renderMode: "svg",
    // A static SVG has no frame loop to suspend.
    setRenderActive(): void {},
    gotoStep(n: number): void {
      if (disposed) return;
      stepIndex = Math.max(0, Math.min(n, lastIndex));
      paint(stepIndex);
      announce(stepIndex);
    },
    replay(): void {
      if (disposed) return;
      announce(stepIndex);
    },
    timeline: {
      play(): void {},
      pause(): void {},
      progress(): number {
        // Always settled: there is nothing to scrub through.
        return 1;
      },
      get duration(): number {
        return stepDuration(structure.steps[stepIndex]);
      },
      get paused(): boolean {
        return true;
      },
    },
    setCameraPreset(): void {},
    resetView(): void {},
    on(event: EngineEvent, cb: (payload: unknown) => void): () => void {
      let set = listeners.get(event);
      if (!set) {
        set = new Set();
        listeners.set(event, set);
      }
      set.add(cb);
      return () => {
        listeners.get(event)?.delete(cb);
      };
    },
    resize(): void {},
    dispose(): void {
      disposed = true;
      listeners.clear();
      mount.innerHTML = "";
      mount.parentNode?.removeChild(mount);
    },
  };
}
