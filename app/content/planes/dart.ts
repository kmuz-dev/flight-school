/**
 * The Dart - the classic fast, straight paper airplane.
 *
 * Geometry notes (read before editing any crease):
 * A4 portrait, millimetres, origin at the sheet centre, nose at +y.
 *   x in [-105, 105], y in [-148.5, 148.5]
 * Creases are authored in TABLE space: each one is stated against the silhouette
 * as it looks AT THAT MOMENT, not against the original sheet. Every step below
 * records what the paper looks like when the step begins.
 *
 * Side convention: "left" is the half-plane where cross(b - a, p - a) > 0.
 */
import type { FoldStep } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

const HALF_W = 105;
const HALF_H = 148.5;

/** The apex every nose fold radiates from: the top edge's midpoint. */
const APEX: [number, number] = [0, HALF_H];

/**
 * Where the step 5/6 crease meets the side edge.
 *
 * That crease bisects the 45 degree slope left by steps 3/4 and the vertical
 * centre line, so it leaves the apex at 67.5 degrees, and tan(67.5) = 1 + sqrt2
 * exactly. Rounding this to -105 (which it very nearly is) misses by 0.008 mm,
 * and the fold then lands 0.008 mm off the centre line instead of on it,
 * leaving a 0.23 mm^2 wedge on every layer it crosses. Four wedges, each
 * claiming a layer of its own. Exact construction beats a tidy number.
 */
const SLOPE_EDGE_Y = HALF_H - HALF_W * (1 + Math.SQRT2);

/** Degrees each wing swings up from closed. See step 11. */
const WING_OPEN = 82;

const steps: readonly FoldStep[] = [
  // Sheet: the full rectangle. Fold the right half onto the left to mark the
  // centre line; the whole plane is built symmetrically around it.
  {
    id: "dart.step-01",
    action: {
      type: "fold",
      crease: { a: [0, -HALF_H], b: [0, HALF_H] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: true,
    teaches: ["valley-fold", "crease", "center-line"],
    duration: 1.2,
  },
  // Folded in half. Open it back up: the crease stays as the reference line.
  {
    id: "dart.step-02",
    action: { type: "unfold", toStep: "dart.step-01" },
    camera: { preset: "top" },
    hasWhy: true,
    duration: 0.9,
  },
  // Flat sheet with a centre crease. The top-right corner (105, 148.5) folds to
  // the centre line: the crease runs from the apex to (105, 43.5), a 45 degree
  // diagonal that lands the corner exactly at (0, 43.5).
  {
    id: "dart.step-03",
    action: {
      type: "fold",
      crease: { a: APEX, b: [HALF_W, HALF_H - HALF_W] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: true,
    duration: 1.1,
  },
  // Mirror of step 3 on the left corner.
  {
    id: "dart.step-04",
    action: {
      type: "fold",
      crease: { a: APEX, b: [-HALF_W, HALF_H - HALF_W] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: false,
    duration: 1.1,
  },
  // Silhouette is now a house shape: apex at (0, 148.5), sloping edges down to
  // (+-105, 43.5). Fold the right slope in to the centre line. The crease
  // bisects the angle between that slope (-45 deg) and straight down (-90 deg),
  // so it leaves the apex at -67.5 deg (see SLOPE_EDGE_Y).
  {
    id: "dart.step-05",
    action: {
      type: "fold",
      crease: { a: APEX, b: [HALF_W, SLOPE_EDGE_Y] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: true,
    duration: 1.2,
  },
  // Mirror of step 5.
  {
    id: "dart.step-06",
    action: {
      type: "fold",
      crease: { a: APEX, b: [-HALF_W, SLOPE_EDGE_Y] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: false,
    duration: 1.2,
  },
  // A long narrow shape with a sharp nose. Mountain-fold it in half down the
  // centre so the folded flaps end up on the OUTSIDE - that is what makes the
  // body a spine you can hold.
  {
    id: "dart.step-07",
    action: {
      type: "fold",
      crease: { a: [0, -HALF_H], b: [0, HALF_H] },
      side: "right",
      angle: 180,
      direction: "mountain",
    },
    camera: { preset: "front" },
    hasWhy: true,
    teaches: ["mountain-fold"],
    duration: 1.3,
  },
  // Everything now sits at x in [-105, 0]. The wing crease tapers from the nose
  // back: from the apex to (-25, -148.5). Folding the outer part down makes both
  // wings at once, because every layer left of the crease moves together.
  {
    id: "dart.step-08",
    action: {
      type: "fold",
      crease: { a: APEX, b: [-25, -HALF_H] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: true,
    duration: 1.3,
  },
  // Turn it over to check the other side matches.
  {
    id: "dart.step-09",
    action: { type: "flip" },
    camera: { preset: "threeQuarter" },
    hasWhy: false,
    duration: 1,
  },
  // Turn it nose-up to sight along the body.
  {
    id: "dart.step-10",
    action: { type: "rotate", degrees: 180 },
    camera: { preset: "front" },
    hasWhy: false,
    duration: 0.8,
  },
  // Open the near wing out into flight position. Both wings sit on the same
  // side of this crease, stacked, so each half of the stack opens separately and
  // in the opposite direction - that is what makes a V rather than a tilt. This
  // is a partial fold: the wing stops part way instead of lying flat.
  //
  // The angle is per wing, measured from closed, so the two wings finish about
  // 2x it apart: WING_OPEN of 82 leaves a 163 degree spread, the shallow
  // dihedral a dart actually flies with. Reading it as an angle from level
  // instead gets this exactly backwards - 25 would leave the wings 50 degrees
  // apart, all but shut. tests/integration/geometry.test.ts pins the spread.
  {
    id: "dart.step-11",
    action: {
      type: "fold",
      crease: { a: [25, HALF_H], b: [25, -HALF_H] },
      side: "left",
      angle: WING_OPEN,
      direction: "mountain",
      layers: "top",
    },
    camera: { preset: "front" },
    hasWhy: true,
    duration: 1.4,
  },
  // The far wing, same crease, opposite way: the plane now has a V of wings.
  {
    id: "dart.step-12",
    action: {
      type: "fold",
      crease: { a: [25, HALF_H], b: [25, -HALF_H] },
      side: "left",
      angle: WING_OPEN,
      direction: "valley",
      layers: "bottom",
    },
    camera: { preset: "front" },
    hasWhy: true,
    duration: 1.4,
  },
];

export const dart: PlaneStructure = {
  id: "dart",
  tier: "easy",
  paper: {
    format: "letter-a4",
    prep: {
      // The Dart folds straight from a standard sheet.
      a4: [],
      letter: [],
      // A square is shorter than A4: trim nothing, the sequence still works, but
      // the plane comes out stubbier. Treated as pass-through rather than
      // pretending a conversion is needed.
      square: [],
      // A 4x6 card is too small and too stiff to fold a Dart from; the preflight
      // screen surfaces this as "use a bigger sheet" rather than a fold sequence.
      "index-4x6": [],
    },
  },
  ratings: { speed: 5, distance: 4, airtime: 2, ease: 5 },
  steps,
  accent: "#D64541",
};
