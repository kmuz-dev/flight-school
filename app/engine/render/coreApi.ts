/**
 * The render layer's view of the core fold math (T1's `app/engine/core/*`).
 *
 * This module is TYPE-ONLY on purpose: it declares the shape the render layer
 * depends on without importing the core modules. `app/engine/index.ts` is the
 * single place that binds the real implementations, which means:
 *
 * - the render layer is testable headlessly against `__contracts__/coreStub.ts`;
 * - if T1's real signatures differ, exactly one file (index.ts) needs edits.
 *
 * Assumed core module map:
 *   @/engine/core/state     -> computeFoldState, validateSequence
 *   @/engine/core/pose      -> posesForState, poseAtProgress
 *   @/engine/core/svgRender -> renderStateToSvg
 */
import type { FoldState, ValidationIssue } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

/**
 * Per-facet object->world transforms, keyed by `Facet.id`.
 * Each value is a plain column-major 4x4 (`number[16]`), directly consumable by
 * `THREE.Matrix4.fromArray`. Poses already include the per-layer z-offset
 * (paper thickness); the render layer must never add it a second time.
 */
export type PoseMap = ReadonlyMap<number, readonly number[]>;

export interface CoreApi {
  /**
   * Fold state after steps `0..n` have been applied (inclusive), a pure replay
   * from the fresh sheet. `n < 0` means the fresh, unfolded sheet.
   */
  computeFoldState(structure: PlaneStructure, n: number): FoldState;

  validateSequence(structure: PlaneStructure): readonly ValidationIssue[];

  /** Exact poses for a settled state. Keys are that state's facet ids. */
  posesForState(state: FoldState): PoseMap;

  /**
   * Interpolated poses part-way through the transition `from -> to`.
   *
   * Contract the render layer relies on:
   * - keys are always **`to`'s** facet ids (splits are applied up front, so the
   *   mesh set never changes mid-animation);
   * - `poseAtProgress(structure, n, 0)` renders the state before step n exactly;
   * - `poseAtProgress(structure, n, 1)` equals `posesForState(state after n)`.
   *
   * `t` is the eased 0..1 progress supplied by GSAP. The function must be pure:
   * the engine snaps to `posesForState(to)` on completion so interpolation can
   * never accumulate into state.
   *
   * Two more the animation relies on, and both were once false:
   * - t=1 lands on the settled poses EXACTLY. The snap is a correctness
   *   guarantee, not a licence: whatever gap it papers over is a jump the cadet
   *   sees on the last frame of the step.
   * - no frame puts paper lower than the lower of the step's two endpoint
   *   states, give or take a layer of thickness. The stage floor is opaque, so
   *   paper below the table does not look wrong, it disappears.
   */
  poseAtProgress(structure: PlaneStructure, n: number, t: number): PoseMap;

  /**
   * The rigid transform that stands a settled state up on the table, to be
   * LEFT-multiplied onto its poses. Exactly the identity for a state with no
   * bends, so a caller may apply it unconditionally from step one.
   *
   * Exposed rather than folded into `posesForState`, because it differs between
   * a step's two endpoint states: baking it in would stop `poseAtProgress(n, 0)`
   * rendering the state before step n, and that contract is what the whole
   * animation hangs from.
   */
  restTransform(state: FoldState): readonly number[];

  /** Flat 2D fallback rendering of a state, used with no WebGL and for thumbnails. */
  renderStateToSvg(state: FoldState, options?: { readonly rest?: boolean }): string;
}
