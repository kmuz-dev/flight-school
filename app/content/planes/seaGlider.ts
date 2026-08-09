/**
 * The Sea Glider - a wide, slow glider with a hemmed leading edge.
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
 * The construction is deliberately unlike the Dart family: no corner folds until
 * the front edge has been hemmed twice. Rolling a 30 mm band down twice puts
 * three layers along the whole width of the leading edge, which is weight in
 * exactly the place a slow glider wants it - forward, and spread across the
 * span rather than piled at a point. The nose is then made by folding the
 * hemmed edge in, so the weight follows the fold into the nose.
 */
import type { FoldStep } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

const HALF_W = 105;
const HALF_H = 148.5;

/** Depth of each hem. Two hems consume 60 mm off the top of the sheet. */
const HEM = 30;

/** Front edge after hem 1, and the crease line of hem 2. */
const HEM1_Y = HALF_H - HEM;
/** Front edge after hem 2. Every later fold is measured from this line. */
const HEM2_Y = HALF_H - 2 * HEM;

/** The nose apex once both hems are made: the midpoint of the new front edge. */
const APEX: [number, number] = [0, HEM2_Y];

/** Where the wings hinge open in the final table frame (see bulldog.ts). */
const WING_LINE = 5;

/** Wing opening angle: 90 would be dead level, so this leaves 6 degrees of lift. */
const DIHEDRAL_OPEN = 84;

const steps: readonly FoldStep[] = [
  // Sheet: the full rectangle. Fold the right half onto the left to mark the
  // centre line; the whole plane is built symmetrically around it.
  {
    id: "sea-glider.step-01",
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
    id: "sea-glider.step-02",
    action: { type: "unfold", toStep: "sea-glider.step-01" },
    camera: { preset: "top" },
    hasWhy: true,
    duration: 0.9,
  },
  // Flat sheet with a centre crease. Hem 1: a horizontal crease 30 mm below the
  // top edge folds that whole band down, so the band [88.5, 118.5] is doubled.
  // Everything above the line moves; "left" of a rightward line is the half
  // above it.
  {
    id: "sea-glider.step-03",
    action: {
      type: "fold",
      crease: { a: [-HALF_W, HEM1_Y], b: [HALF_W, HEM1_Y] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: true,
    teaches: ["hem"],
    duration: 1.1,
  },
  // Hem 2: the doubled band folds down again about the new front edge, leaving
  // three layers across the band [58.5, 88.5] and a front edge at y = 88.5.
  {
    id: "sea-glider.step-04",
    action: {
      type: "fold",
      crease: { a: [-HALF_W, HEM2_Y], b: [HALF_W, HEM2_Y] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    hasWhy: true,
    duration: 1.1,
  },
  // A rectangle 210 wide and 237 tall with a heavy front edge at y = 88.5. The
  // top-right corner (105, 88.5) folds to the centre line: a 45 degree crease
  // from the apex to (105, -16.5) lands it exactly at (0, -16.5). The fold
  // carries the hem with it, which is how the weight reaches the nose.
  {
    id: "sea-glider.step-05",
    action: {
      type: "fold",
      crease: { a: APEX, b: [HALF_W, HEM2_Y - HALF_W] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: true,
    duration: 1.2,
  },
  // Mirror of step 5 on the left corner.
  {
    id: "sea-glider.step-06",
    action: {
      type: "fold",
      crease: { a: APEX, b: [-HALF_W, HEM2_Y - HALF_W] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    hasWhy: false,
    duration: 1.2,
  },
  // House shape: apex (0, 88.5), shoulders (+-105, -16.5). Mountain-fold it down
  // the centre so the flaps end up on the OUTSIDE and the folded edges make a
  // spine to hold.
  {
    id: "sea-glider.step-07",
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
  // Everything sits at x in [-105, 0]. The wing crease runs from the nose on the
  // spine, (0, 88.5), back to (-16, -148.5): close to the spine, so the wing is
  // nearly as wide as the sheet. Wide wings plus a light tail is what turns a
  // fast plane into a floater.
  {
    id: "sea-glider.step-08",
    action: {
      type: "fold",
      crease: { a: APEX, b: [-16, -HALF_H] },
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
    id: "sea-glider.step-09",
    action: { type: "flip" },
    camera: { preset: "threeQuarter" },
    hasWhy: false,
    duration: 1,
  },
  // Turn it end for end to sight along the body.
  {
    id: "sea-glider.step-10",
    action: { type: "rotate", degrees: 180 },
    camera: { preset: "front" },
    hasWhy: false,
    duration: 0.8,
  },
  // Open the near wing. Both wings sit on the same side of this crease, stacked,
  // so each half of the stack opens separately and in the opposite direction -
  // that is what makes a V rather than a tilt.
  {
    id: "sea-glider.step-11",
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
  // The far wing, same crease, opposite way.
  {
    id: "sea-glider.step-12",
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

export const seaGlider: PlaneStructure = {
  id: "sea-glider",
  tier: "medium",
  paper: {
    format: "letter-a4",
    prep: {
      // The Sea Glider folds straight from a standard sheet.
      a4: [],
      letter: [],
      // A square sheet is 87 mm shorter than A4. Two 30 mm hems still fit and
      // every later crease is measured from the hemmed edge, so the sequence
      // works; the plane just comes out shorter and glides less far.
      square: [],
      // A 4x6 card is only 152 mm tall: two hems would eat 40 percent of it, and
      // card will not hold a hem crease. Preflight sends the user to paper.
      "index-4x6": [],
    },
  },
  ratings: { speed: 2, distance: 4, airtime: 5, ease: 3 },
  steps,
  accent: "#4A7C59",
};
