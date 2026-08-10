/**
 * The frozen contract of the fold engine (SPEC.md §4, engine design pass).
 *
 * Paper is a list of convex facets whose polygons live permanently in original
 * paper coordinates (millimeters, origin at sheet center). Folding never mutates
 * polygon coordinates except to split them. State at step n is a pure replay of
 * steps 0..n from the fresh sheet; 3D poses are derived, never accumulated.
 *
 * Coordinate spaces:
 * - PAPER space: the original unfolded sheet (immutable per facet).
 * - TABLE space: where the flat-folded model currently lies. Step crease lines
 *   are authored in TABLE space (the silhouette the user currently sees).
 *
 * This file is the seam every workstream builds against. Changes require the
 * orchestrator; parallel tracks must not edit it.
 */

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

/** A line through `a` and `b` (direction a->b matters for side conventions). */
export type Line2 = { readonly a: Vec2; readonly b: Vec2 };

/**
 * 2D isometry as a 2x3 row-major matrix [m00 m01 tx, m10 m11 ty].
 * det = +1 (orientation-preserving) or -1 (reflection; face-down parity).
 */
export type Iso2 = readonly [number, number, number, number, number, number];

/** A rotation about a 3D axis line, for non-flat (partial) folds. */
export type PartialRotation = {
  /** Axis in table space, lifted to z=0. */
  readonly axis: { readonly origin: Vec3; readonly dir: Vec3 };
  /** Signed degrees. */
  readonly angleDeg: number;
};

export type Facet = {
  readonly id: number;
  /** Convex polygon in PAPER space (mm). Immutable except splitting. */
  readonly polygon: readonly Vec2[];
  /** PAPER -> TABLE isometry. det sign = face parity (-1 means face-down). */
  readonly flatMap: Iso2;
  /** Integer stack index in table space (renormalized to 0..k each step). */
  readonly layer: number;
  /** Non-empty means the facet is non-flat (e.g. a lifted wing). */
  readonly bend: readonly PartialRotation[];
};

/** A crease-and-unfolded scored line, rendered as a reference mark. */
export type CreaseMark = {
  /** Segment in PAPER space per facet it crosses. */
  readonly facetId: number;
  readonly segment: readonly [Vec2, Vec2];
};

export type FoldState = {
  readonly facets: readonly Facet[];
  readonly creaseMarks: readonly CreaseMark[];
  /** Max layer index after renormalization. */
  readonly maxLayer: number;
};

export type FoldDirection = "valley" | "mountain";
export type CreaseSide = "left" | "right";

export type FoldAction =
  | {
      readonly type: "fold";
      /** Crease in TABLE space. */
      readonly crease: Line2;
      /** Which side of the crease moves (left = positive cross(dir, p-a)). */
      readonly side: CreaseSide;
      /** Degrees; 180 = flat fold, <180 = partial (wing) fold. */
      readonly angle: number;
      readonly direction: FoldDirection;
      /**
       * Which layers of the stack move. Side selection alone cannot express a
       * wing pair: after folding a plane in half, both wings sit on the same
       * side of the wing crease, stacked, and must open in OPPOSITE directions
       * to form a V. "top"/"bottom" split the stack at its midpoint; an
       * explicit list targets exact layer indices. Defaults to "all".
       */
      readonly layers?: "all" | "top" | "bottom" | readonly number[];
      /** Manual layer placement escape hatch; no layer solver exists. */
      readonly layerHint?: number;
    }
  | {
      /** Crease-and-unfold back to the state after `toStep`, keeping splits + marks. */
      readonly type: "unfold";
      readonly toStep: string;
    }
  | { readonly type: "flip" }
  | { readonly type: "rotate"; readonly degrees: number }
  | {
      /** Paper Prep only. Splits along the line and discards the non-kept side. */
      readonly type: "cut";
      readonly line: Line2;
      readonly keep: CreaseSide;
    };

export type CameraHint = {
  readonly preset?: "front" | "threeQuarter" | "top";
  readonly azimuthDeg?: number;
  readonly elevationDeg?: number;
  readonly distance?: number;
  readonly target?: Vec3;
};

export type FoldStep = {
  /** Stable id, doubles as the i18n key: e.g. "dart.step-04". */
  readonly id: string;
  readonly action: FoldAction;
  readonly camera?: CameraHint;
  /** Whether a why-line exists in dictionaries (content validation checks it). */
  readonly hasWhy: boolean;
  /** Fold-term glossary keys taught at this step (first-use inline glosses). */
  readonly teaches?: readonly string[];
  /** Seconds the fold animation should take (default derived from fold size). */
  readonly duration?: number;
};

/** Everything the animator needs to interpolate one step. */
export type StepDelta = {
  /**
   * The facets the step starts from, already split by this step's own crease.
   *
   * This is the state before the fold rendered on the decomposition after it, so
   * its ids match the post-step state one-for-one. That is what the animation
   * needs: the render layer builds its meshes from the post-step state and then
   * asks for poses from t=0, and a facet that a split brought into existence has
   * no pose at all in the state before the step.
   */
  readonly startFacets: readonly Facet[];
  readonly movingFacetIds: readonly number[];
  /** Rotation axis in table space (z=0), when the action rotates geometry. */
  readonly axis: { readonly origin: Vec3; readonly dir: Vec3 } | null;
  readonly angleDeg: number;
  readonly kind: FoldAction["type"];
  readonly layerChanges: ReadonlyMap<number, { readonly from: number; readonly to: number }>;
  /**
   * Millimetres the whole model rises at the midpoint of the step, on a
   * sin(pi*t) profile that is exactly zero at both ends.
   *
   * A flip is a 180-degree turn about a line lying IN the table, so every point
   * off that line passes through z < 0 on the way round and spends the
   * animation inside an opaque floor. A hand does not do that: it picks the
   * model up, turns it over in the air, and puts it back down. sin(pi*t) is not
   * a shaping choice - a point at radial offset a traces z = -a*sin(180deg * t),
   * so a lift of a*sin(pi*t) is its exact inverse, and the largest a in the
   * model is therefore the exact height that clears the table. Derived per step
   * and per plane; no plane carries a number for it.
   */
  readonly liftMm?: number;
};

export type PaperFormat = "letter" | "a4" | "square" | "index-4x6";

export type ValidationIssue = {
  readonly stepIndex: number;
  readonly stepId: string;
  readonly code:
    | "crease-misses-silhouette"
    | "crease-over-nonflat"
    | "layer-overlap"
    | "cut-does-not-span"
    | "unfold-unknown-step"
    | "degenerate-facet";
  readonly message: string;
};

export type EngineEvent = "stepComplete" | "progress" | "annotation" | "webglLost";

export type AnnotationAnchor = {
  /** Projected screen position of the fold-name label anchor. */
  readonly x: number;
  readonly y: number;
  readonly visible: boolean;
};

/**
 * The sole imperative seam between the engine and the React shell.
 * React owns all DOM/UI; the engine never imports React.
 */
export interface FoldEngineHandle {
  gotoStep(n: number, opts?: { animate?: boolean }): void;
  replay(): void;
  readonly timeline: {
    play(): void;
    pause(): void;
    /** Get, or set (scrub), progress in [0,1]. */
    progress(v?: number): number;
    readonly duration: number;
    readonly paused: boolean;
  };
  setCameraPreset(p: NonNullable<CameraHint["preset"]>): void;
  on(event: EngineEvent, cb: (payload: unknown) => void): () => void;
  resize(): void;
  dispose(): void;
}

export type EngineOptions = {
  /** "night" swaps stage backdrop/lighting per DESIGN.md. */
  readonly theme?: "paper" | "night";
  /** Force the no-WebGL fallback (also auto-detected). */
  readonly forceFallback?: boolean;
  /**
   * Turn the model slowly on the spot, for a display surface rather than a
   * tutorial (the hangar's live cards). Ignored under prefers-reduced-motion
   * and by the no-WebGL fallback, which has no camera.
   */
  readonly autoRotate?: boolean;
  /**
   * How much the stage is worth spending on. "full" is the tutorial stage: the
   * cadet is reading a fold off it. "preview" is a hangar card - a decorative
   * 3:2 thumbnail behind a bob animation - and drops multisampling, shadows and
   * the retina pixel ratio, which is what the frame budget actually goes on.
   * Measured on an emulated Pixel 7 under 4x CPU throttling with the two-scene
   * ceiling awake: 67ms per frame at "full", 17ms at "preview".
   */
  readonly quality?: "full" | "preview";
  /**
   * Pin the camera to one preset and ignore the steps' own camera hints.
   *
   * A step's hint is authored for the fold being taught, not for looking at the
   * result: the Dart's last step asks for `front` because that is where you can
   * see the wing crease open. A display surface inherits whatever the last step
   * asked for, and for a dart `front` is nose-on - the finished plane fills 18%
   * of the frame width there against 67% from `threeQuarter`. Display surfaces
   * pin the catalogue's hero angle instead; it also matches the build-time SVG
   * they sit behind, so the handover to the live stage no longer jumps.
   */
  readonly cameraPreset?: NonNullable<CameraHint["preset"]>;
  readonly onReady?: () => void;
};
