/**
 * The GSAP timeline for one fold step.
 *
 * GSAP owns time, never state. The timeline tweens a single scalar `t: 0 -> 1`
 * on a proxy; every update asks the core for the poses at that progress and
 * writes matrices. At the endpoints the engine SNAPS to the core's pure output,
 * so an interpolated frame can never leak into fold state.
 */
import { gsap } from "gsap";
import type { FoldState, FoldStep } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import type { CoreApi, PoseMap } from "./coreApi";
import { REDUCED_MOTION_SECONDS, stepDuration } from "./duration";

// Re-exported so the timeline stays the one name callers reach for; the
// arithmetic itself lives in `./duration`, which the GSAP-free fallback shares.
export {
  MIN_FOLD_SECONDS,
  MAX_FOLD_SECONDS,
  REDUCED_MOTION_SECONDS,
  stepDuration,
} from "./duration";

export type StepTimelineOptions = {
  readonly core: CoreApi;
  /** The plane being folded; posing is index-based because interpolation needs
   *  the step's fold axis, which two end states do not carry. */
  readonly structure: PlaneStructure;
  /** 0-based index of the step being animated. */
  readonly stepIndex: number;
  /** The settled post-step state, passed in from the renderer's memo cache so
   *  snapping never recomputes what the caller already holds. */
  readonly settled: FoldState;
  readonly step: FoldStep | undefined;
  /** Write matrices into the scene. */
  readonly apply: (poses: PoseMap) => void;
  /** Fires on every value change, including scrubs. */
  readonly onProgress: (t: number) => void;
  /** Fires once when progress first reaches 1, by playback or by scrub. */
  readonly onComplete: () => void;
  readonly reducedMotion?: boolean;
};

export type StepTimeline = {
  play(): void;
  pause(): void;
  /** Get, or set (scrub), progress in [0,1]. */
  progress(v?: number): number;
  /** Rewind to 0 and play. */
  restart(): void;
  /** Jump to the settled end state without animating. */
  complete(): void;
  readonly duration: number;
  readonly paused: boolean;
  kill(): void;
};

export function createStepTimeline(options: StepTimelineOptions): StepTimeline {
  const { core, structure, stepIndex, settled, step, apply, onProgress, onComplete } = options;
  const duration = options.reducedMotion === true ? REDUCED_MOTION_SECONDS : stepDuration(step);

  const proxy = { t: 0 };
  let reachedEnd = false;
  let killed = false;
  let lastLinear = 0;

  /**
   * `eased` drives the geometry (GSAP's power2.inOut value); `linear` is the
   * playhead the transport bar shows. They agree at both endpoints.
   */
  const write = (rawEased: number, rawLinear: number): void => {
    const eased = rawEased <= 0 ? 0 : rawEased >= 1 ? 1 : rawEased;
    const t = rawLinear <= 0 ? 0 : rawLinear >= 1 ? 1 : rawLinear;
    if (eased >= 1) {
      // Snap: the settled state is the core's pure computeFoldState output,
      // never the last interpolated frame.
      apply(core.posesForState(settled));
    } else if (eased <= 0) {
      // `from` rendered on `to`'s facet decomposition, so the mesh set is stable
      // for the whole step. This is still a pure function of two pure states.
      apply(core.poseAtProgress(structure, stepIndex, 0));
    } else {
      apply(core.poseAtProgress(structure, stepIndex, eased));
    }
    lastLinear = t;
    onProgress(t);
    if (t >= 1) {
      if (!reachedEnd) {
        reachedEnd = true;
        onComplete();
      }
    } else {
      reachedEnd = false;
    }
  };

  const tl = gsap.timeline({ paused: true, onUpdate: () => write(proxy.t, tl.progress()) });
  tl.to(proxy, { t: 1, duration, ease: "power2.inOut" });
  write(0, 0);

  // Drive the write ourselves after a programmatic seek rather than relying on
  // GSAP's event-suppression rules; `apply` is idempotent, so a double write on
  // an already-rendered frame costs nothing.
  const sync = (): void => write(proxy.t, tl.progress());

  return {
    play() {
      if (killed) return;
      if (tl.progress() >= 1) {
        tl.pause(0);
        sync();
      }
      tl.play();
    },
    pause() {
      if (killed) return;
      tl.pause();
    },
    progress(v?: number) {
      if (killed) return lastLinear;
      if (v !== undefined) {
        tl.pause();
        tl.progress(Math.max(0, Math.min(1, v)));
        sync();
      }
      return tl.progress();
    },
    restart() {
      if (killed) return;
      tl.pause(0);
      sync();
      tl.play();
    },
    complete() {
      if (killed) return;
      tl.pause();
      tl.progress(1);
      sync();
    },
    get duration() {
      return tl.duration();
    },
    get paused() {
      return killed ? true : tl.paused();
    },
    kill() {
      killed = true;
      tl.kill();
    },
  };
}
