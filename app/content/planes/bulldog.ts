/**
 * The Bulldog Dart - a Dart whose nose has been folded back on itself.
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
 * Steps 1-6 are the Dart's nose construction, so the two planes share a base and
 * the ladder from Dart to Bulldog is one new idea. Step 7 is the difference: the
 * sharp point is folded back down the body, which is the blunt-nose fold the
 * Dart does not have. It trades the Dart's needle point for a stubby nose with
 * six layers of paper in it.
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
 * leaving a 0.23 mm^2 wedge on every layer it crosses. Derive, never round.
 */
const SLOPE_EDGE_Y = HALF_H - HALF_W * (1 + Math.SQRT2);

/** Where the first corner folds put the corners: (0, 43.5) on the centre line. */
const CORNER_LANDING_Y = HALF_H - HALF_W;

/**
 * Where the nose gets cut off. Derived from where the tip has to land, not
 * chosen: reflecting the apex (0, 148.5) across the horizontal line y = c puts
 * it at (0, 2c - 148.5), and we want that to be exactly the height the first
 * corner folds reached, so c = (148.5 + 43.5) / 2 = 96. Landing exactly on an
 * existing vertex is what keeps the fold from leaving a wedge.
 */
const BLUNT_Y = (HALF_H + CORNER_LANDING_Y) / 2;

/**
 * Where the wings hinge open, in the final table frame (after the flip and the
 * rotate). After the half fold every scrap of paper lies at x <= 0, so the keel
 * is entirely at x <= 0 and any positive line moves wing paper only. Keeping it
 * close to the spine puts the hinge where the paper actually creased.
 */
const WING_LINE = 5;

/**
 * How far each wing swings up out of the plane of symmetry. The table plane IS
 * the plane of symmetry once the model is folded flat, so 90 would put the wings
 * dead level; 82 leaves each one 8 degrees above level, which is the dihedral
 * that makes a plane self-right instead of rolling.
 */
const DIHEDRAL_OPEN = 82;

const steps: readonly FoldStep[] = [
  // Sheet: the full rectangle. Fold the right half onto the left to mark the
  // centre line; the whole plane is built symmetrically around it.
  {
    id: "bulldog.step-01",
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
    id: "bulldog.step-02",
    action: { type: "unfold", toStep: "bulldog.step-01" },
    camera: { preset: "top" },
    hasWhy: true,
    duration: 0.9,
  },
  // Flat sheet with a centre crease. The top-right corner (105, 148.5) folds to
  // the centre line: the crease runs from the apex to (105, 43.5), a 45 degree
  // diagonal that lands the corner exactly at (0, 43.5).
  {
    id: "bulldog.step-03",
    action: {
      type: "fold",
      crease: { a: APEX, b: [HALF_W, CORNER_LANDING_Y] },
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
    id: "bulldog.step-04",
    action: {
      type: "fold",
      crease: { a: APEX, b: [-HALF_W, CORNER_LANDING_Y] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: false,
    duration: 1.1,
  },
  // Silhouette is a house shape: apex at (0, 148.5), sloping edges down to
  // (+-105, 43.5). Fold the right slope in to the centre line. The crease
  // bisects the angle between that slope (-45 deg) and straight down (-90 deg),
  // so it leaves the apex at -67.5 deg and meets the right edge at SLOPE_EDGE_Y.
  // That endpoint is constructed, not rounded - see the constant.
  {
    id: "bulldog.step-05",
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
    id: "bulldog.step-06",
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
  // A long narrow spike, apex (0, 148.5), edges falling at -67.5 deg to
  // (+-105, -105). THE BULLDOG FOLD: a horizontal crease at y = 96 turns the
  // whole point back down the body. It carries four layers of nose paper with
  // it, so the front of the plane becomes short, square and heavy. Everything
  // above the line moves; "left" of a rightward line is the half above it.
  {
    id: "bulldog.step-07",
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
  // Blunt front edge from (-21.7, 96) to (21.7, 96). Mountain-fold the whole
  // plane down the centre so the flaps end up on the OUTSIDE - that is what
  // makes the body a spine you can hold.
  {
    id: "bulldog.step-08",
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
  // Everything sits at x in [-105, 0]. The wing crease starts at the blunt
  // nose's corner on the spine, (0, 96), and tapers back to (-25, -148.5).
  // Folding the outer part down makes both wings at once.
  {
    id: "bulldog.step-09",
    action: {
      type: "fold",
      crease: { a: [0, BLUNT_Y], b: [-25, -HALF_H] },
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
    id: "bulldog.step-10",
    action: { type: "flip" },
    camera: { preset: "threeQuarter" },
    hasWhy: false,
    duration: 1,
  },
  // Turn it nose-up to sight along the body.
  {
    id: "bulldog.step-11",
    action: { type: "rotate", degrees: 180 },
    camera: { preset: "front" },
    hasWhy: false,
    duration: 0.8,
  },
  // Open the near wing. Both wings sit on the same side of this crease, stacked,
  // so each half of the stack opens separately and in the opposite direction -
  // that is what makes a V rather than a tilt. Partial fold: the wing stops part
  // way instead of lying flat.
  {
    id: "bulldog.step-12",
    action: {
      type: "fold",
      crease: { a: [WING_LINE, HALF_H], b: [WING_LINE, -HALF_H] },
      side: "left",
      angle: DIHEDRAL_OPEN,
      direction: "mountain",
      layers: "top",
    },
    camera: { preset: "front" },
    hasWhy: true,
    duration: 1.4,
  },
  // The far wing, same crease, opposite way: the plane now has a V of wings.
  {
    id: "bulldog.step-13",
    action: {
      type: "fold",
      crease: { a: [WING_LINE, HALF_H], b: [WING_LINE, -HALF_H] },
      side: "left",
      angle: DIHEDRAL_OPEN,
      direction: "valley",
      layers: "bottom",
    },
    camera: { preset: "front" },
    hasWhy: true,
    duration: 1.4,
  },
];

export const bulldog: PlaneStructure = {
  id: "bulldog",
  tier: "easy",
  paper: {
    format: "letter-a4",
    prep: {
      // The Bulldog folds straight from a standard sheet.
      a4: [],
      letter: [],
      // A square sheet still folds: the sequence only measures against the
      // centre line and the top corners, so a shorter sheet gives a shorter,
      // stubbier Bulldog rather than a wrong one.
      square: [],
      // A 4x6 card is too small and too stiff for six layers of nose; the
      // preflight screen surfaces this as "use a bigger sheet" rather than a
      // fold sequence.
      "index-4x6": [],
    },
  },
  ratings: { speed: 4, distance: 4, airtime: 3, ease: 5 },
  steps,
  accent: "#C98A2C",
};


