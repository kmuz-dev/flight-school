/**
 * The Hammer - a distance plane whose whole nose is folded paper.
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
 * The idea: build the Dart's house, then roll the front of it back on itself
 * twice, so paper piles up in a bar across the front. Only then are the corners
 * folded in to make the nose, which drags that whole bar into the point. The
 * finished nose is six to eight layers thick, which is where the name comes
 * from and why this is the hardest plane in the catalogue to fold accurately.
 *
 * Two rolls, not three. Three was authored and verified first and folds
 * correctly, but every full-width crease splits every facet it crosses, and the
 * engine gives each facet its own layer index with a fixed z offset per layer.
 * At three rolls the model reached 128 facets and 127 layers, which pushed the
 * two wing roots 16 mm apart in the render - the finished plane looked bent.
 * Two rolls keep the layer count low enough that the wings meet where they
 * should. If the engine ever normalises stack thickness, a third roll is a
 * one-line addition.
 */
import type { FoldStep } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";

const HALF_W = 105;
const HALF_H = 148.5;

/** The apex the first corner folds radiate from: the top edge's midpoint. */
const APEX: [number, number] = [0, HALF_H];

const ROLL1_Y = 96;
/** The front edge after the last roll, and the apex of the nose folds. */
const ROLL2_Y = 62;
const NOSE: [number, number] = [0, ROLL2_Y];

/** Where the wings hinge open in the final table frame (see bulldog.ts). */
const WING_LINE = 5;

/** Nearly level wings: a heavy fast plane needs less dihedral, not more. */
const DIHEDRAL_OPEN = 86;

const steps: readonly FoldStep[] = [
  // Sheet: the full rectangle. Fold the right half onto the left to mark the
  // centre line; the whole plane is built symmetrically around it.
  {
    id: "hammer.step-01",
    action: {
      type: "fold",
      crease: { a: [0, -HALF_H], b: [0, HALF_H] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    teaches: ["valley-fold", "crease", "center-line"],
    duration: 1.2,
  },
  // Folded in half. Open it back up: the crease stays as the reference line.
  {
    id: "hammer.step-02",
    action: { type: "unfold", toStep: "hammer.step-01" },
    camera: { preset: "top" },
    duration: 0.9,
  },
  // Flat sheet with a centre crease. The top-right corner (105, 148.5) folds to
  // the centre line: a 45 degree crease from the apex to (105, 43.5) lands the
  // corner exactly at (0, 43.5).
  {
    id: "hammer.step-03",
    action: {
      type: "fold",
      crease: { a: APEX, b: [HALF_W, HALF_H - HALF_W] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    duration: 1.1,
  },
  // Mirror of step 3 on the left corner.
  {
    id: "hammer.step-04",
    action: {
      type: "fold",
      crease: { a: APEX, b: [-HALF_W, HALF_H - HALF_W] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    duration: 1.1,
  },
  // House shape: apex (0, 148.5), shoulders (+-105, 43.5). Roll 1 turns the top
  // of the house back down about y = 96; the point lands at (0, 43.5) and the
  // front edge becomes the 105 mm line from (-52.5, 96) to (52.5, 96).
  // Everything above the line moves; "left" of a rightward line is the half
  // above it.
  {
    id: "hammer.step-05",
    action: {
      type: "fold",
      crease: { a: [-HALF_W, ROLL1_Y], b: [HALF_W, ROLL1_Y] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    teaches: ["blunt-nose"],
    duration: 1.2,
  },
  // Roll 2, about y = 62: the front band (now three layers) folds back again and
  // the front edge widens to the 173 mm line from (-86.5, 62) to (86.5, 62),
  // with the rolled bar packed into the band below it.
  {
    id: "hammer.step-06",
    action: {
      type: "fold",
      crease: { a: [-HALF_W, ROLL2_Y], b: [HALF_W, ROLL2_Y] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    duration: 1.2,
  },
  // Now make the nose out of the loaded edge. A 45 degree crease from the front
  // edge's midpoint (0, 62) to (105, -43) folds the right corner (86.5, 62) to
  // the centre line at (0, -24.5), dragging the rolled bar into the point.
  {
    id: "hammer.step-07",
    action: {
      type: "fold",
      crease: { a: NOSE, b: [HALF_W, ROLL2_Y - HALF_W] },
      side: "left",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    duration: 1.3,
  },
  // Mirror of step 7 on the left corner.
  {
    id: "hammer.step-08",
    action: {
      type: "fold",
      crease: { a: NOSE, b: [-HALF_W, ROLL2_Y - HALF_W] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "top" },
    duration: 1.3,
  },
  // House shape again, this time with apex (0, 62) and shoulders (+-105, -43).
  // Mountain-fold it down the centre so the flaps end up on the OUTSIDE and the
  // folded edges make a spine to hold.
  {
    id: "hammer.step-09",
    action: {
      type: "fold",
      crease: { a: [0, -HALF_H], b: [0, HALF_H] },
      side: "right",
      angle: 180,
      direction: "mountain",
    },
    camera: { preset: "front" },
    teaches: ["mountain-fold"],
    duration: 1.4,
  },
  // Everything sits at x in [-105, 0]. The wing crease runs from the nose on the
  // spine, (0, 48), back to (-28, -148.5). It sits further out than the
  // gliders': a narrower wing carrying a heavy nose is what makes this plane go
  // far instead of slow.
  {
    id: "hammer.step-10",
    action: {
      type: "fold",
      crease: { a: NOSE, b: [-28, -HALF_H] },
      side: "right",
      angle: 180,
      direction: "valley",
    },
    camera: { preset: "threeQuarter" },
    duration: 1.3,
  },
  // Turn it over to check the other side matches.
  {
    id: "hammer.step-11",
    action: { type: "flip" },
    camera: { preset: "threeQuarter" },
    duration: 1,
  },
  // Turn it end for end to sight along the body.
  {
    id: "hammer.step-12",
    action: { type: "rotate", degrees: 180 },
    camera: { preset: "front" },
    duration: 0.8,
  },
  // Open the near wing. Both wings sit on the same side of this crease, stacked,
  // so each half of the stack opens separately and in the opposite direction -
  // that is what makes a V rather than a tilt.
  {
    id: "hammer.step-13",
    action: {
      type: "fold",
      crease: { a: [WING_LINE, HALF_H], b: [WING_LINE, -HALF_H] },
      side: "left",
      angle: DIHEDRAL_OPEN,
      direction: "mountain",
      layers: "top",
    },
    camera: { preset: "front" },
    duration: 1.4,
  },
  // The far wing, same crease, opposite way.
  {
    id: "hammer.step-14",
    action: {
      type: "fold",
      crease: { a: [WING_LINE, HALF_H], b: [WING_LINE, -HALF_H] },
      side: "left",
      angle: DIHEDRAL_OPEN,
      direction: "valley",
      layers: "bottom",
    },
    camera: { preset: "front" },
    duration: 1.4,
  },
];

export const hammer: PlaneStructure = {
  id: "hammer",
  tier: "advanced",
  paper: {
    format: "letter-a4",
    prep: {
      // The Hammer folds straight from a standard sheet.
      a4: [],
      letter: [],
      // A square sheet loses 87 mm of length, which is most of the tail rather
      // than the nose: the rolls and the nose folds all still fit, so the
      // sequence runs unchanged and the plane comes out short and even
      // nose-heavier.
      square: [],
      // A 4x6 card cannot take this plane: the finished nose is eight to ten
      // layers and card will not fold flat that many times. Preflight sends the
      // user to printer paper.
      "index-4x6": [],
    },
  },
  ratings: { speed: 5, distance: 5, airtime: 2, ease: 1 },
  steps,
  accent: "#1A2B4A",
};
