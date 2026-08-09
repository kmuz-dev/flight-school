/**
 * The Harrier - a wide, slow glider with a blunt nose and bendable wing flaps.
 *
 * Geometry notes (read before editing any crease):
 * A4 portrait, millimetres, origin at the sheet centre, nose at +y.
 *   x in [-105, 105], y in [-148.5, 148.5]
 * Creases are authored in TABLE space: each one is stated against the silhouette
 * as it looks AT THAT MOMENT, not against the original sheet. Every step below
 * records what the paper looks like when the step begins.
 *
 * Side convention: "left" is the half-plane where cross(b - a, p - a) > 0.
 *
 * Why the flaps are at the wing TIPS and not the trailing edge (the
 * load-bearing constraint in this file):
 *
 * 1. After the half fold, flip and rotate, the TABLE plane is the finished
 *    plane's plane of symmetry. y runs nose-to-tail (the rotate leaves the nose
 *    at -y and the tail at +y), x is the finished plane's up axis (the keel sits
 *    at low x, the wings spread from x = WING_LINE outward), and z is span.
 * 2. Partial folds compose in the order they are authored, applied in table
 *    space (pose.ts `applyBends`). So a flap must be bent BEFORE the wing that
 *    carries it; then the wing rotation carries the flap along, which is the
 *    physical composition.
 * 3. The engine refuses a crease that crosses a facet already bent out of plane
 *    ("crease-over-nonflat"). A trailing-edge elevator hinge (a line of constant
 *    y) crosses the whole span, so the later wing crease at x = WING_LINE would
 *    cut straight across it - not expressible. Nesting is what works: each
 *    partial fold must live entirely OUTSIDE every earlier bent facet, or be
 *    parallel to it. A tip fin at x = FIN_LINE satisfies both, since it is
 *    parallel to the wing hinge and sits beyond it.
 * 4. Do NOT reach for crease-and-unfold to pre-split the wing line here. On a
 *    deep stack `unfold` restores poses by facet id and falls back to a
 *    nearest-centroid guess for facets the unfolded step itself created, which
 *    misplaces paper (measured: one facet mirrored to x = -31 instead of
 *    returning to the wing). Unfold is only reliable against a simple target
 *    state, which is why every plane here uses it once, for the centre line.
 */
import type { FoldStep } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

const HALF_W = 105;
const HALF_H = 148.5;

/** The apex every nose fold radiates from: the top edge's midpoint. */
const APEX: [number, number] = [0, HALF_H];

/** The nose point folds back down about this line; the tip lands at (0, 43.5). */
const BLUNT_Y = 96;

/**
 * Where the wings hinge, in the final table frame (after flip and rotate).
 * Beyond the keel, so a fold on this line moves wing paper only.
 */
const WING_LINE = 5;

/**
 * Where the tip fins hinge. The opened wing reaches x ~ 98, so this leaves a
 * fin about 20 mm deep. Parallel to WING_LINE and outside it, which is what
 * makes the two partial folds legal together (see the header note).
 */
const FIN_LINE = 78;

const steps: readonly FoldStep[] = [
  // Sheet: the full rectangle. Fold the right half onto the left to mark the
  // centre line; the whole plane is built symmetrically around it.
  {
    id: "harrier.step-01",
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
    id: "harrier.step-02",
    action: { type: "unfold", toStep: "harrier.step-01" },
    camera: { preset: "top" },
    hasWhy: true,
    duration: 0.9,
  },
  // Flat sheet with a centre crease. The top-right corner (105, 148.5) folds to
  // the centre line: a 45 degree crease from the apex to (105, 43.5) lands the
  // corner exactly at (0, 43.5).
  {
    id: "harrier.step-03",
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
    id: "harrier.step-04",
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
  // House shape: apex (0, 148.5), shoulders (+-105, 43.5). Unlike the Dart, the
  // sides are NOT folded in again. Instead the point is folded straight back
  // down the body about y = 96, so the tip lands at (0, 43.5) on top of the two
  // corner flaps. Everything above the line moves; "left" of a rightward line is
  // the half above it. This is what leaves the Harrier wide and blunt instead of
  // long and sharp.
  {
    id: "harrier.step-05",
    action: {
      type: "fold",
      crease: { a: [-HALF_W, BLUNT_Y], b: [HALF_W, BLUNT_Y] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: true,
    teaches: ["blunt-nose"],
    duration: 1.2,
  },
  // Flat-topped shape, front edge from (-52.5, 96) to (52.5, 96). Mountain-fold
  // it down the centre so the flaps end up on the OUTSIDE and the folded edges
  // become a spine to hold.
  {
    id: "harrier.step-06",
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
  // Everything sits at x in [-105, 0]. The wing crease hugs the spine - from the
  // nose corner (0, 96) back to (-14, -148.5) - so almost the whole width of the
  // sheet becomes wing. That is the Harrier's whole idea: a lot of wing carrying
  // very little weight glides slowly.
  {
    id: "harrier.step-07",
    action: {
      type: "fold",
      crease: { a: [0, BLUNT_Y], b: [-14, -HALF_H] },
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
    id: "harrier.step-08",
    action: { type: "flip" },
    camera: { preset: "threeQuarter" },
    hasWhy: false,
    duration: 1,
  },
  // Turn it end for end so the tail is the near end while the flaps are made.
  {
    id: "harrier.step-09",
    action: { type: "rotate", degrees: 180 },
    camera: { preset: "front" },
    hasWhy: false,
    duration: 0.8,
  },
  // Tip fins, bent BEFORE the wings open so that opening the wings carries them
  // along (header note 2). Both wings are stacked on the far side of x = 78, so
  // the pair needs the same treatment the wings need: same crease, same side,
  // opposite direction, one half of the stack each. Mirrored now, they both
  // stand up once the wings are open.
  {
    id: "harrier.step-10",
    action: {
      type: "fold",
      crease: { a: [FIN_LINE, HALF_H], b: [FIN_LINE, -HALF_H] },
      side: "left",
      angle: 55,
      direction: "valley",
      layers: "top",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: true,
    teaches: ["partial-fold", "tip-fin"],
    duration: 1.2,
  },
  {
    id: "harrier.step-11",
    action: {
      type: "fold",
      crease: { a: [FIN_LINE, HALF_H], b: [FIN_LINE, -HALF_H] },
      side: "left",
      angle: 55,
      direction: "mountain",
      layers: "bottom",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: false,
    duration: 1.2,
  },
  // Open the near wing. Both wings sit on the same side of this crease, stacked,
  // so each half of the stack opens separately and in the opposite direction -
  // that is what makes a V rather than a tilt. The crease sits beyond the keel
  // so only wing paper moves.
  {
    id: "harrier.step-12",
    action: {
      type: "fold",
      crease: { a: [WING_LINE, HALF_H], b: [WING_LINE, -HALF_H] },
      side: "left",
      angle: 80,
      direction: "mountain",
      layers: "top",
    },
    camera: { preset: "front" },
    hasWhy: true,
    duration: 1.4,
  },
  // The far wing, same crease, opposite way.
  {
    id: "harrier.step-13",
    action: {
      type: "fold",
      crease: { a: [WING_LINE, HALF_H], b: [WING_LINE, -HALF_H] },
      side: "left",
      angle: 80,
      direction: "valley",
      layers: "bottom",
    },
    camera: { preset: "front" },
    hasWhy: true,
    duration: 1.4,
  },
];

export const harrier: PlaneStructure = {
  id: "harrier",
  tier: "medium",
  paper: {
    format: "letter-a4",
    prep: {
      // The Harrier folds straight from a standard sheet.
      a4: [],
      letter: [],
      // A square sheet gives a shorter, even wider Harrier; every crease is
      // measured off the centre line and the top corners, so the sequence still
      // works unchanged.
      square: [],
      // A 4x6 card is stiff enough that the flaps will not hold a bend, which is
      // the whole point of this plane; the preflight screen says use paper.
      "index-4x6": [],
    },
  },
  ratings: { speed: 2, distance: 3, airtime: 5, ease: 3 },
  steps,
  accent: "#7FA8C9",
};
