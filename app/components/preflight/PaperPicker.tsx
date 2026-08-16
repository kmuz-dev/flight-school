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
import { setPaperChoice, usePaperChoice, usePlaneProgress } from "@/lib/progress";
import { FOCUS_RING } from "@/components/ui/focus";
import { format } from "@/components/ui/format";

export type PaperPickerStrings = {
  /** "What paper do you have?" */
  readonly question: string;
  readonly label: Readonly<Record<PaperFormat, string>>;
  /** "{count} extra folds to cut it square" */
  readonly needsPrep: string;
  readonly noPrep: string;
  readonly resetsProgress: string;
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
  const { resumeStep } = usePlaneProgress(structure.id as PlaneId);
  const usable = PAPER_CHOICES.filter((paper) => paperIsUsable(structure, paper));

  return (
    <fieldset>
      <legend className="text-h3 font-semibold text-ink">{strings.question}</legend>
      <div className="mt-md grid grid-cols-1 gap-sm sm:grid-cols-2">
        {usable.map((paper) => {
          const selected = paper === chosen;
          const prep = needsPrep(structure, paper);
          return (
            <label key={paper} className="relative block cursor-pointer">
              <input
                type="radio"
                name={`paper-${structure.id}`}
                value={paper}
                checked={selected}
                data-paper={paper}
                onChange={() => setPaperChoice(structure.id as PlaneId, paper)}
                className={`peer absolute top-md start-md size-4 accent-[var(--color-red-ink)] ${FOCUS_RING}`}
              />
              <span className="flex min-h-[92px] flex-col rounded-input border border-ink-38 bg-raised py-md pe-md ps-xl transition-[border-color,background-color,box-shadow] peer-checked:border-ink peer-checked:bg-paper peer-focus-visible:ring-2 peer-focus-visible:ring-sky-ink peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper">
                <span className="font-semibold text-ink">{strings.label[paper]}</span>
                <span className="mt-xs text-small leading-snug text-ink-muted">
                  {prep
                    ? format(strings.needsPrep, { count: prepStepCount(structure, paper) })
                    : strings.noPrep}
                </span>
                {!selected && resumeStep !== null ? (
                  <span className="mt-sm text-small font-medium text-red-ink">
                    {strings.resetsProgress}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
