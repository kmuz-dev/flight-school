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
 * Is this sheet usable for this plane at all? A sheet only works if the plane
 * either folds from it directly or has a prep run for it.
 */
export function paperIsUsable(structure: PlaneStructure, paper: PaperFormat): boolean {
  if (needsPrep(structure, paper)) return true;
  const native = PAPER_SIZES[formatForPlane(structure.paper.format)];
  const sheet = PAPER_SIZES[paper];
  // Without a conversion the sequence is replayed on the sheet as-is, which
  // only makes sense when the sheet is close to the one it was authored for.
  const ratio = (sheet.width * sheet.height) / (native.width * native.height);
  return ratio > 0.45;
}
