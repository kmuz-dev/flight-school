/**
 * Starting sheets. Paper coordinates are millimeters with the origin at the
 * sheet's center, x to the right and y up, portrait orientation (the plane's
 * nose points at +y).
 */
import type { Facet, FoldState, PaperFormat, Vec2 } from "./types";
import { ISO_IDENTITY } from "./iso2";

export const PAPER_SIZES: Readonly<Record<PaperFormat, { width: number; height: number }>> = {
  letter: { width: 215.9, height: 279.4 },
  a4: { width: 210, height: 297 },
  // The square a plane like the Square Cruiser folds from: the largest square
  // cut from A4's short edge.
  square: { width: 210, height: 210 },
  "index-4x6": { width: 101.6, height: 152.4 },
};

/** Paper thickness at model scale; the per-layer z offset that kills z-fighting. */
export const LAYER_THICKNESS = 0.25;

export function sheetPolygon(width: number, height: number): Vec2[] {
  const hw = width / 2;
  const hh = height / 2;
  // Counter-clockwise from the bottom-left.
  return [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
}

export function freshSheet(format: PaperFormat): FoldState {
  const size = PAPER_SIZES[format];
  const facet: Facet = {
    id: 0,
    polygon: sheetPolygon(size.width, size.height),
    flatMap: ISO_IDENTITY,
    layer: 0,
    bend: [],
  };
  return { facets: [facet], creaseMarks: [], maxLayer: 0 };
}

/**
 * What a fold sequence starts from. Authored planes say "letter-a4" (Letter and
 * A4 fold the same, so one sequence covers both) or "square". A sequence
 * composed with a paper-prep run in front of it starts from the concrete sheet
 * the cadet actually has, so those names are accepted too.
 */
export type SequenceFormat = "letter-a4" | PaperFormat;

export function formatForPlane(sequenceFormat: SequenceFormat): PaperFormat {
  return sequenceFormat === "letter-a4" ? "a4" : sequenceFormat;
}
