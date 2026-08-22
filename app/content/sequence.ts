/**
 * Composing a plane's fold sequence with the paper prep that precedes it.
 *
 * A plane declares the sheet its own folds assume. A cadet has whatever is in
 * the house. Prep closes that gap - and it is not a separate mode: the
 * conversion is folds and a cut like any other, so it belongs in front of the
 * sequence rather than in a screen of its own. One tutorial, one engine, one
 * progress counter, and the cut lands where the engine can prove it.
 *
 * Structure only. Every string these steps need already lives in the plane
 * dictionaries under the same step ids.
 */
import type { PaperFormat } from "@/engine/core/types";
import { PAPER_SIZES, formatForPlane } from "@/engine/core/paper";
import type { PlaneStructure } from "./types";

/** Every sheet a cadet can start from, in the order the picker offers them. */
export const PAPER_CHOICES: readonly PaperFormat[] = ["a4", "letter", "square", "index-4x6"];

/** Does this plane need work done to that sheet before its own folds begin? */
export function needsPrep(structure: PlaneStructure, paper: PaperFormat): boolean {
  return (structure.paper.prep[paper]?.length ?? 0) > 0;
}

/**
 * The plane as folded from `paper`: its prep run, then its own sequence, as one
 * continuous list. Returns the structure unchanged when no conversion is
 * needed, so the common case allocates nothing and keeps engine memo identity.
 */
export function sequenceForPaper(
  structure: PlaneStructure,
  paper: PaperFormat,
): PlaneStructure {
  const prep = structure.paper.prep[paper] ?? [];
  if (prep.length === 0) return structure;
  return {
    ...structure,
    // The composed run starts from the sheet the cadet actually has; the prep
    // steps are what turn it into the sheet the plane's own folds assume.
    paper: { ...structure.paper, format: paper },
    steps: [...prep, ...structure.steps],
  };
}

/** How many leading steps are paper prep rather than the plane itself. */
export function prepStepCount(structure: PlaneStructure, paper: PaperFormat): number {
  return structure.paper.prep[paper]?.length ?? 0;
}

/**
 * The smallest fraction of the authored sheet's area another sheet may have and
 * still be folded by the same sequence. A 4x6 card is a quarter of A4, which is
 * what this excludes.
 */
const MIN_AREA_RATIO = 0.45;

/**
 * How far another sheet's proportions may drift from the authored sheet's.
 *
 * Letter is 0.773 wide-over-tall against A4's 0.707, a drift of 9.3%, and the
 * two genuinely do fold the same plane - which is why every sequence here is
 * authored once as `letter-a4`. A square is 1.0, a drift of 41%, and does not.
 */
const MAX_ASPECT_DRIFT = 0.12;

/**
 * Is this sheet usable for this plane at all? A sheet only works if the plane
 * either folds from it directly or has a prep run for it.
 *
 * "Folds from it directly" is a claim about SHAPE as much as size, and it used
 * to be tested only by area. A 210mm square is 71% of A4's area, so it passed,
 * and the picker offered it for all five rectangular planes under the words
 * "fold straight from this one, no cutting". Nothing downstream honoured that:
 * with no prep run `sequenceForPaper` returns the plane unchanged, so the stage
 * went on folding a 210x297 sheet while the label beneath it named the square,
 * and a cadet who took the offer at its word was measuring creases authored for
 * a sheet 87mm longer than the one in their hands. Creases struck from the top
 * edge simply miss the paper.
 *
 * Both tests, because each catches what the other misses: a 4x6 card is nearly
 * A4's proportions at a quarter of its area, and a square is most of A4's area
 * at nothing like its proportions.
 */
export function paperIsUsable(structure: PlaneStructure, paper: PaperFormat): boolean {
  if (needsPrep(structure, paper)) return true;
  const native = PAPER_SIZES[formatForPlane(structure.paper.format)];
  const sheet = PAPER_SIZES[paper];
  const area = (sheet.width * sheet.height) / (native.width * native.height);
  if (area <= MIN_AREA_RATIO) return false;
  const nativeAspect = native.width / native.height;
  const drift = Math.abs(sheet.width / sheet.height - nativeAspect) / nativeAspect;
  return drift <= MAX_ASPECT_DRIFT;
}
