"use client";

/**
 * The right-hand rail (SCREENS.md §3): everything about the CURRENT step.
 * Not a step list - the transport strip handles orientation.
 */
import { FOCUS_RING } from "@/components/ui/focus";
import { CreaseIcon } from "@/components/ui/CreaseIcon";
import { format, pad2, type TutorialStepView, type TutorialUiStrings } from "./types";

export type StepRailProps = {
  ui: TutorialUiStrings;
  step: TutorialStepView;
  totalSteps: number;
  isLastStep: boolean;
  selfChecked: boolean;
  onSelfCheck: (checked: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepRail({
  ui,
  step,
  totalSteps,
  isLastStep,
  selfChecked,
  onSelfCheck,
  onBack,
  onNext,
}: StepRailProps) {
  const current = step.index + 1;
  const remaining = Math.max(0, totalSteps - current);

  return (
    <section
      aria-label={ui.stepRegionLabel}
      className="flex flex-col gap-md border-[color:var(--color-ink-12)] bg-[color:var(--color-paper)] p-lg lg:border-l"
    >
      <p className="font-mono text-micro tracking-[0.08em] text-[color:var(--color-red)]">
        {format(ui.stepLabel, { current: pad2(current), total: pad2(totalSteps) })}
      </p>

      <h2 className="font-display text-h2 font-bold uppercase leading-tight tracking-tight">
        {step.title}
      </h2>

      <p className="text-instruction leading-relaxed text-[color:var(--color-ink-87)]">
        {step.instruction}
      </p>

      {step.why ? (
        <aside className="border-l-4 border-[color:var(--color-sky)] bg-[color:var(--color-raised)] p-md">
          <p className="font-mono text-micro tracking-[0.08em] text-[color:var(--color-sky)]">
            {ui.why}
          </p>
          <p className="mt-xs text-small leading-relaxed text-[color:var(--color-ink-87)]">
            {step.why}
          </p>
        </aside>
      ) : null}

      {step.glossary.length > 0 ? (
        <div>
          <p className="font-mono text-micro tracking-[0.08em] text-[color:var(--color-ink-60)]">
            {ui.foldTerms}
          </p>
          <dl className="mt-xs flex flex-col gap-sm">
            {step.glossary.map((item) => (
              <div key={item.key} className="flex gap-sm">
                <CreaseIcon variant={item.icon} />
                <div>
                  <dt className="font-medium text-small">{item.term}</dt>
                  <dd className="text-small leading-snug text-[color:var(--color-ink-60)]">
                    {item.definition}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <label className="flex items-center gap-sm border border-[color:var(--color-ink-12)] p-md text-small">
        <input
          type="checkbox"
          checked={selfChecked}
          onChange={(e) => onSelfCheck(e.target.checked)}
          className={`size-[18px] accent-[color:var(--color-red)] ${FOCUS_RING}`}
        />
        {ui.selfCheck}
      </label>

      <p className="font-mono text-micro tracking-[0.08em] text-[color:var(--color-ink-38)]">
        {format(ui.foldsToWings, { count: remaining })}
      </p>

      {/*
        On a phone the rail stacks under the stage, which puts Back and Next
        below a screenful of why-box and glossary - the cadet has one hand on
        the paper and should not have to scroll to advance. Sticking the action
        row to the bottom of the viewport keeps it in reach at every step; the
        opaque background is what stops the prose showing through behind it.
        This is a reach fix only. It was briefly credited with fixing the
        mobile Finish failures too; that was the top bar overflowing the
        viewport, and the credit was wrong.
      */}
      <div className="sticky bottom-0 z-10 -mx-lg flex gap-sm bg-[color:var(--color-paper)] px-lg pt-sm pb-md lg:static lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0">
        <button
          type="button"
          onClick={onBack}
          disabled={step.index === 0}
          className={`flex-1 border border-[color:var(--color-ink)] px-md py-sm font-medium disabled:opacity-38 ${FOCUS_RING}`}
        >
          {ui.back}
        </button>
        <button
          type="button"
          onClick={onNext}
          className={`flex-[2] bg-[color:var(--color-red)] px-md py-sm font-semibold text-white ${FOCUS_RING}`}
        >
          {isLastStep ? ui.finish : ui.nextFold}
        </button>
      </div>

    </section>
  );
}
