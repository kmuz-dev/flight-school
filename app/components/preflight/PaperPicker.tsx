"use client";

/**
 * "What paper do you have?"
 *
 * The catalog is written for sheets people own, not for one canonical sheet, so
 * this is the question that decides the fold sequence: a sheet that needs
 * converting puts its paper prep in front of the plane's own folds. Choosing
 * happens here rather than mid-tutorial because it changes what step 1 is.
 */
import type { PaperFormat } from "@/engine/core/types";
import type { PlaneId, PlaneStructure } from "@/content/types";
import { PAPER_CHOICES, needsPrep, paperIsUsable, prepStepCount } from "@/content/sequence";
import { setPaperChoice, usePaperChoice } from "@/lib/progress";
import { FOCUS_RING } from "@/components/ui/focus";
import { format } from "@/components/ui/format";

export type PaperPickerStrings = {
  /** "What paper do you have?" */
  readonly question: string;
  readonly label: Readonly<Record<PaperFormat, string>>;
  /** "{count} extra folds to cut it square" */
  readonly needsPrep: string;
  readonly noPrep: string;
};

export function PaperPicker({
  structure,
  strings,
  defaultPaper,
}: {
  structure: PlaneStructure;
  strings: PaperPickerStrings;
  defaultPaper: PaperFormat;
}) {
  const chosen = usePaperChoice(structure.id as PlaneId) ?? defaultPaper;
  const usable = PAPER_CHOICES.filter((paper) => paperIsUsable(structure, paper));

  return (
    <section className="mt-md" aria-labelledby="paper-picker">
      <h2
        id="paper-picker"
        className="font-mono text-micro font-semibold tracking-[0.14em] text-ink-muted uppercase"
      >
        {strings.question}
      </h2>
      <div className="mt-sm flex flex-wrap gap-sm" role="radiogroup" aria-labelledby="paper-picker">
        {usable.map((paper) => {
          const selected = paper === chosen;
          return (
            <button
              key={paper}
              type="button"
              role="radio"
              aria-checked={selected}
              data-paper={paper}
              onClick={() => setPaperChoice(structure.id as PlaneId, paper)}
              className={`px-sm py-xs font-mono text-micro font-semibold tracking-[0.12em] uppercase ${FOCUS_RING} ${
                selected ? "bg-ink text-paper" : "border border-ink-38 text-ink hover:bg-ink-12"
              }`}
            >
              {strings.label[paper]}
            </button>
          );
        })}
      </div>
      <p className="mt-sm font-mono text-micro text-ink-muted">
        {needsPrep(structure, chosen)
          ? format(strings.needsPrep, { count: prepStepCount(structure, chosen) })
          : strings.noPrep}
      </p>
    </section>
  );
}
