/**
 * Paper prep composed in front of a plane's own folds.
 *
 * The composed run is the thing a cadet with a 4x6 card actually follows, so it
 * has to be as sound as an authored sequence: it must validate, conserve paper
 * up to the cut, and end in the same plane.
 */
import { describe, expect, it } from "vitest";
import { PLANES } from "@/content";
import {
  PAPER_CHOICES,
  needsPrep,
  paperIsUsable,
  prepStepCount,
  sequenceForPaper,
} from "@/content/sequence";
import { computeFoldState, totalArea, validateSequence } from "@/engine/core/state";
import { PAPER_SIZES, formatForPlane } from "@/engine/core/paper";
import { facetInTable } from "@/engine/core/fold";
import { boundingBox } from "@/engine/core/polygon";

const cruiser = PLANES["square-cruiser"]!;

describe("sequenceForPaper", () => {
  it("returns the plane untouched when its own sheet needs no conversion", () => {
    expect(sequenceForPaper(cruiser, "square")).toBe(cruiser);
  });

  it("puts the prep run in front, keeping the plane's own steps in order", () => {
    const composed = sequenceForPaper(cruiser, "index-4x6");
    const prep = cruiser.paper.prep["index-4x6"];
    expect(composed.steps.length).toBe(prep.length + cruiser.steps.length);
    expect(composed.steps.slice(0, prep.length)).toEqual(prep);
    expect(composed.steps.slice(prep.length)).toEqual(cruiser.steps);
  });

  it("declares the sheet the cadet actually has, not the one the plane assumes", () => {
    expect(sequenceForPaper(cruiser, "letter").paper.format).toBe("letter");
    expect(formatForPlane(sequenceForPaper(cruiser, "letter").paper.format)).toBe("letter");
  });
});

describe.each(PAPER_CHOICES.filter((p) => needsPrep(cruiser, p)))(
  "the Square Cruiser folded from %s",
  (paper) => {
    const composed = sequenceForPaper(cruiser, paper);

    it("passes engine validation end to end", () => {
      expect(validateSequence(composed).map((i) => `${i.stepId}: ${i.code}`)).toEqual([]);
    });

    it("cuts the sheet down to a true square before the plane's folds begin", () => {
      const afterPrep = computeFoldState(composed, prepStepCount(cruiser, paper) - 1);
      const box = boundingBox(afterPrep.facets.map(facetInTable));
      const width = box.max[0] - box.min[0];
      const height = box.max[1] - box.min[1];
      expect(Math.abs(width - height)).toBeLessThan(1e-6);
      // The square is as large as the sheet allows: its side is the short edge.
      const sheet = PAPER_SIZES[paper];
      expect(Math.abs(width - Math.min(sheet.width, sheet.height))).toBeLessThan(1e-6);
    });

    it("throws away only the offcut", () => {
      const sheet = PAPER_SIZES[paper];
      const side = Math.min(sheet.width, sheet.height);
      const final = computeFoldState(composed, composed.steps.length - 1);
      expect(Math.abs(totalArea(final) - side * side)).toBeLessThan(side * side * 1e-6);
    });

    it("still arrives at a plane, not a scrap", () => {
      const final = computeFoldState(composed, composed.steps.length - 1);
      const box = boundingBox(final.facets.map(facetInTable));
      expect((box.max[1] - box.min[1]) / (box.max[0] - box.min[0])).toBeGreaterThan(1.2);
      expect(final.maxLayer).toBeGreaterThan(0);
    });
  },
);

describe("offering a sheet at all", () => {
  it("never offers a sheet that is neither foldable nor convertible", () => {
    for (const plane of Object.values(PLANES)) {
      for (const paper of PAPER_CHOICES) {
        if (!paperIsUsable(plane, paper)) continue;
        const composed = sequenceForPaper(plane, paper);
        expect(validateSequence(composed), `${plane.id} from ${paper}`).toEqual([]);
      }
    }
  });

  it("offers every plane at least the sheet it was authored for", () => {
    for (const plane of Object.values(PLANES)) {
      expect(
        paperIsUsable(plane, formatForPlane(plane.paper.format)),
        `${plane.id} must offer its own sheet`,
      ).toBe(true);
    }
  });
});
