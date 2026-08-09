/**
 * The Square Cruiser - a square-paper glider, and the plane that owns the
 * Paper Prep cutting flow.
 *
 * Geometry notes (read before editing any crease):
 * The fold sequence runs on a SQUARE sheet: 210 mm on a side, millimetres,
 * origin at the sheet centre, nose at +y.
 *   x in [-105, 105], y in [-105, 105]
 * Creases are authored in TABLE space: each one is stated against the silhouette
 * as it looks AT THAT MOMENT, not against the original sheet. Every step below
 * records what the paper looks like when the step begins.
 *
 * Side convention: "left" is the half-plane where cross(b - a, p - a) > 0.
 *
 * About `paper.prep`: those sequences run against the sheet the USER has, not
 * against the square, so their coordinates are in that source sheet's own frame
 * (letter is 215.9 x 279.4, A4 is 210 x 297, a 4x6 card is 101.6 x 152.4). Each
 * one is the same three moves a person makes with real paper: fold a corner over
 * so the short edge lies along the long edge, open it back up, and cut along the
 * line the fold left. The cut line is the bottom of the largest square the sheet
 * contains, so `keep: "left"` (the half above a left-to-right line) keeps the
 * square and discards the offcut.
 *
 * The square that comes out is the source sheet's own width, not always 210:
 * letter yields 215.9 mm and a 4x6 card yields 101.6 mm. The step coordinates
 * below are absolute millimetres on the 210 mm square, which is the sheet
 * `formatForPlane("square")` hands the engine, so that is the square the
 * animation always shows. What makes the other two work is that every crease
 * here is defined by a landmark rather than a measurement - the centre line, a
 * corner, the midpoint of the edge the last fold made - so the instructions a
 * person follows are proportional and land the same way on any square. Only the
 * finished plane's size changes.
 */
import type { FoldStep } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

/** The square the fold sequence itself runs on (PAPER_SIZES.square). */
const HALF = 105;

/** The apex the first corner folds radiate from: the top edge's midpoint. */
const APEX: [number, number] = [0, HALF];

/** The nose point folds back about this line, landing the tip at the centre. */
const BLUNT_Y = HALF / 2;

/** The apex of the second pair of corner folds. */
const NOSE: [number, number] = [0, BLUNT_Y];

/** Where the wings hinge open in the final table frame (see bulldog.ts). */
const WING_LINE = 5;

/** Wing opening angle: 90 would be dead level, so this leaves 8 degrees of lift. */
const DIHEDRAL_OPEN = 82;

const steps: readonly FoldStep[] = [
  // Square sheet. Fold the right half onto the left to mark the centre line; the
  // whole plane is built symmetrically around it.
  {
    id: "square-cruiser.step-01",
    action: {
      type: "fold",
      crease: { a: [0, -HALF], b: [0, HALF] },
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
    id: "square-cruiser.step-02",
    action: { type: "unfold", toStep: "square-cruiser.step-01" },
    camera: { preset: "top" },
    hasWhy: true,
    duration: 0.9,
  },
  // Flat square with a centre crease. On a square the corner fold is a half-turn
  // of the whole top edge: a 45 degree crease from the apex to (105, 0) lands the
  // corner (105, 105) exactly at the sheet centre (0, 0).
  {
    id: "square-cruiser.step-03",
    action: {
      type: "fold",
      crease: { a: APEX, b: [HALF, 0] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: true,
    duration: 1.1,
  },
  // Mirror of step 3 on the left corner. The result is a triangle sitting on the
  // bottom half of the square: apex (0, 105), shoulders (+-105, 0).
  {
    id: "square-cruiser.step-04",
    action: {
      type: "fold",
      crease: { a: APEX, b: [-HALF, 0] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: false,
    duration: 1.1,
  },
  // Fold the point back down about y = 52.5, so the tip lands at (0, 0) on top
  // of the corner flaps and the front edge becomes the line from (-52.5, 52.5)
  // to (52.5, 52.5). Everything above the line moves; "left" of a rightward line
  // is the half above it.
  {
    id: "square-cruiser.step-05",
    action: {
      type: "fold",
      crease: { a: [-HALF, BLUNT_Y], b: [HALF, BLUNT_Y] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: true,
    teaches: ["blunt-nose"],
    duration: 1.2,
  },
  // Now fold the two new front corners in to the centre line. A 45 degree crease
  // from (0, 52.5) to (105, -52.5) carries the corner (52.5, 52.5) to (0, 0),
  // rebuilding a point on top of the blunt front - which is what puts four
  // thicknesses of paper in the nose and keeps the flaps from springing open.
  {
    id: "square-cruiser.step-06",
    action: {
      type: "fold",
      crease: { a: NOSE, b: [HALF, -BLUNT_Y] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: true,
    duration: 1.2,
  },
  // Mirror of step 6.
  {
    id: "square-cruiser.step-07",
    action: {
      type: "fold",
      crease: { a: NOSE, b: [-HALF, -BLUNT_Y] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: false,
    duration: 1.2,
  },
  // Apex (0, 52.5), shoulders (+-105, -52.5). Mountain-fold it down the centre so
  // the flaps end up on the OUTSIDE and the folded edges make a spine to hold.
  {
    id: "square-cruiser.step-08",
    action: {
      type: "fold",
      crease: { a: [0, -HALF], b: [0, HALF] },
      side: "right",
      angle: 180,
      direction: "mountain",
    },
    camera: { preset: "front" },
    hasWhy: true,
    teaches: ["mountain-fold"],
    duration: 1.3,
  },
  // Everything sits at x in [-105, 0]. The wing crease runs from the nose on the
  // spine, (0, 52.5), back to (-20, -105). A square sheet is short for its width,
  // so the wing comes out broad and stubby: that is the Cruiser's whole flavour.
  {
    id: "square-cruiser.step-09",
    action: {
      type: "fold",
      crease: { a: NOSE, b: [-20, -HALF] },
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
    id: "square-cruiser.step-10",
    action: { type: "flip" },
    camera: { preset: "threeQuarter" },
    hasWhy: false,
    duration: 1,
  },
  // Turn it end for end to sight along the body.
  {
    id: "square-cruiser.step-11",
    action: { type: "rotate", degrees: 180 },
    camera: { preset: "front" },
    hasWhy: false,
    duration: 0.8,
  },
  // Open the near wing. Both wings sit on the same side of this crease, stacked,
  // so each half of the stack opens separately and in the opposite direction -
  // that is what makes a V rather than a tilt.
  {
    id: "square-cruiser.step-12",
    action: {
      type: "fold",
      crease: { a: [WING_LINE, HALF], b: [WING_LINE, -HALF] },
      side: "left",
      angle: DIHEDRAL_OPEN,
      direction: "mountain",
      layers: "top",
    },
    camera: { preset: "front" },
    hasWhy: true,
    duration: 1.4,
  },
  // The far wing, same crease, opposite way.
  {
    id: "square-cruiser.step-13",
    action: {
      type: "fold",
      crease: { a: [WING_LINE, HALF], b: [WING_LINE, -HALF] },
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

/**
 * One prep sequence: fold the top-left corner down so the top edge lies along
 * the right edge, open it, then cut along the line the fold left behind.
 *
 * `width` and `height` are the SOURCE sheet's, in its own centred frame. The
 * largest square it contains is `width` on a side, hanging from the top edge, so
 * its bottom sits at `cutY = height/2 - width`. The diagonal runs from the
 * top-right corner to (-width/2, cutY): a 45 degree line, because the horizontal
 * run and the vertical drop are both `width`.
 */
function squareFromSheet(id: string, width: number, height: number): readonly FoldStep[] {
  const hw = width / 2;
  const hh = height / 2;
  const cutY = hh - width;
  return [
    {
      id: `${id}-01`,
      action: {
        type: "fold",
        crease: { a: [hw, hh], b: [-hw, cutY] },
        // The corner being folded, (-hw, hh), is right of this crease.
        side: "right",
        angle: 180,
        direction: "valley",
      },
      camera: { preset: "top" },
      hasWhy: true,
      teaches: ["square-from-rectangle"],
      duration: 1.2,
    },
    {
      id: `${id}-02`,
      action: { type: "unfold", toStep: `${id}-01` },
      camera: { preset: "top" },
      hasWhy: false,
      duration: 0.8,
    },
    {
      id: `${id}-03`,
      // "left" of a left-to-right line is the half above it: keep the square,
      // discard the strip below.
      action: { line: { a: [-hw, cutY], b: [hw, cutY] }, type: "cut", keep: "left" },
      camera: { preset: "top" },
      hasWhy: true,
      duration: 1.1,
    },
  ];
}

export const squareCruiser: PlaneStructure = {
  id: "square-cruiser",
  tier: "advanced",
  paper: {
    format: "square",
    prep: {
      // 215.9 x 279.4 -> a 215.9 mm square; cut line at y = -76.2.
      letter: squareFromSheet("square-cruiser.prep.letter", 215.9, 279.4),
      // 210 x 297 -> a 210 mm square; cut line at y = -61.5. This is the square
      // the fold sequence's own coordinates are written in.
      a4: squareFromSheet("square-cruiser.prep.a4", 210, 297),
      // Already square: nothing to do.
      square: [],
      // 101.6 x 152.4 -> a 101.6 mm square. Honest but small: it is a real
      // square and the sequence folds on it unchanged, so the prep is authored
      // rather than refused. The prose says plainly that card is stiff and the
      // finished plane is half-size and will not glide as far.
      "index-4x6": squareFromSheet("square-cruiser.prep.index", 101.6, 152.4),
    },
  },
  ratings: { speed: 3, distance: 3, airtime: 4, ease: 2 },
  steps,
  accent: "#D64541",
};
