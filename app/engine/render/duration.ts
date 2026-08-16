/**
 * How long one fold step should take, as pure arithmetic over the step.
 *
 * This is policy, not animation, and it lives apart from `./timeline` because
 * both stages need it while only one of them owns a GSAP tween: the SVG
 * fallback reports a duration for the transport bar without ever animating.
 * Keeping it here is what lets `app/engine/index.ts` reach the fallback
 * statically without pulling GSAP into first paint.
 */
import type { FoldStep } from "@/engine/core/types";

/** DESIGN.md: fold animations run 800-1500ms depending on fold size. */
export const MIN_FOLD_SECONDS = 0.8;
export const MAX_FOLD_SECONDS = 1.5;
/** Reduced motion: jump to the end state (React crossfades the stage). */
export const REDUCED_MOTION_SECONDS = 0.001;

/**
 * Duration for a step: honour `step.duration`, otherwise derive it from how much
 * paper moves. A 180-degree flat fold is the slowest; a table rotation is quick.
 */
export function stepDuration(step: FoldStep | undefined): number {
  if (step?.duration !== undefined && step.duration > 0) return step.duration;
  const action = step?.action;
  if (!action) return MIN_FOLD_SECONDS;
  const span = MAX_FOLD_SECONDS - MIN_FOLD_SECONDS;
  switch (action.type) {
    case "fold": {
      const fraction = Math.min(Math.abs(action.angle) / 180, 1);
      return MIN_FOLD_SECONDS + span * fraction;
    }
    case "flip":
      return MIN_FOLD_SECONDS + span * 0.5;
    case "unfold":
      return MIN_FOLD_SECONDS + span * 0.35;
    case "rotate": {
      const fraction = Math.min(Math.abs(action.degrees) / 180, 1);
      return MIN_FOLD_SECONDS * 0.75 + span * 0.25 * fraction;
    }
    case "cut":
      return MIN_FOLD_SECONDS;
  }
}
