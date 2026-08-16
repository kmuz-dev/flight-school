"use client";

/**
 * The instruction rail for one fold, with one clear navigation path.
 *
 * Fixed height inside the tutorial shell: the prose scrolls, Back and Next do
 * not. That is what keeps the button a cadet reaches for in the same place on
 * every fold - it used to sit after the content, so a step with a longer
 * instruction or an extra fold term put it somewhere else.
 */
import { FOCUS_RING } from "@/components/ui/focus";
import { CreaseIcon } from "@/components/ui/CreaseIcon";
import { pad2, type TutorialStepView, type TutorialUiStrings } from "./types";

export type StepRailProps = {
  ui: TutorialUiStrings;
  step: TutorialStepView;
  steps: readonly TutorialStepView[];
  isLastStep: boolean;
  /** The step's optional technique note, shown under the instruction. */
  tip?: string;
  onSelectStep: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepRail({
  ui,
  step,
  steps,
  isLastStep,
  tip,
  onSelectStep,
  onBack,
  onNext,
}: StepRailProps) {
  return (
    <section
      aria-label={ui.stepRegionLabel}
      className="flex min-h-0 flex-col border-t border-ink-12 bg-paper lg:border-t-0 lg:border-s"
    >
      {/*
        The only scrolling region in the tutorial. Everything that varies with
        the step - a longer instruction, a Why, a first-use fold term, a tip -
        varies in here, where varying moves nothing else.
      */}
      <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto px-lg pt-lg pb-md lg:px-xl lg:pt-xl">
      <label className="flex scroll-mb-32 items-center justify-between gap-md font-mono text-micro text-ink-muted">
        <span className="shrink-0">{ui.stepSelectLabel}</span>
        <select
          value={step.index}
          onChange={(event) => onSelectStep(Number(event.target.value))}
          className={`min-h-11 max-w-[70%] rounded-[6px] border border-ink-12 bg-raised px-sm py-xs font-sans text-small text-ink ${FOCUS_RING}`}
        >
          {steps.map((candidate, index) => (
            <option key={candidate.id} value={index}>
              {pad2(index + 1)} - {candidate.title}
            </option>
          ))}
        </select>
      </label>

      <div className="scroll-mb-32 space-y-sm">
        <h2 className="font-display text-h2 font-bold leading-[0.95] tracking-tight">
          {step.title}
        </h2>
        <p className="text-instruction leading-relaxed text-ink-87">{step.instruction}</p>
      </div>

      {step.why ? (
        <details className="group scroll-mb-32 border-s-4 border-sky bg-raised p-md">
          <summary className={`flex min-h-11 cursor-pointer items-center font-mono text-micro text-sky-ink ${FOCUS_RING}`}>
            {ui.why}
          </summary>
          <p className="mt-sm text-small leading-relaxed text-ink-87">{step.why}</p>
        </details>
      ) : null}

      {step.glossary.length > 0 ? (
        <details className="group scroll-mb-32 border border-ink-12 bg-raised p-md">
          <summary className={`flex min-h-11 cursor-pointer items-center font-mono text-micro text-ink-muted ${FOCUS_RING}`}>
            {ui.foldTerms}
          </summary>
          <dl className="mt-md flex flex-col gap-md">
            {step.glossary.map((item) => (
              <div key={item.key} className="grid grid-cols-[auto_1fr] gap-x-sm">
                <CreaseIcon variant={item.icon} />
                <dt className="font-medium text-small">{item.term}</dt>
                <dd className="col-start-2 text-small leading-snug text-ink-muted">
                  {item.definition}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
      {tip ? (
        <p className="font-mono text-micro leading-relaxed italic text-ink-muted">
          <span className="not-italic">{ui.tipLabel} </span>
          {tip}
        </p>
      ) : null}
      </div>

      {/*
        Outside the scrolling region, so it holds its place on every fold and on
        every screen. SCREENS.md asks for Back and Next to stay visible on
        mobile without covering the instructions; a row pinned below a scroller
        does that by construction, where the sticky row it replaces could only
        approximate it by watching an IntersectionObserver.
      */}
      <div className="flex shrink-0 gap-sm border-t border-ink-12 bg-paper px-lg pt-sm pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-xl lg:pt-md lg:pb-xl">
        <button
          type="button"
          onClick={onBack}
          disabled={step.index === 0}
          className={`min-h-11 flex-1 rounded-[6px] border border-ink px-md py-sm font-medium disabled:opacity-38 ${FOCUS_RING}`}
        >
          {ui.back}
        </button>
        <button
          type="button"
          onClick={onNext}
          className={`min-h-11 flex-[2] rounded-[6px] bg-red-ink px-md py-sm font-semibold text-on-red ${FOCUS_RING}`}
        >
          {isLastStep ? ui.finish : ui.nextFold}
        </button>
      </div>
    </section>
  );
}
