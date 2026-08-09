"use client";

/**
 * Preflight (SCREENS.md §2): Stitch's split frame, Claude Design's data.
 *
 * The one piece of the mockup deliberately not reproduced is its social-proof
 * line ("FOLDED 4,318 TIMES THIS MONTH"). There is no backend and no such
 * count exists, so it is replaced by a manifest line derived from the catalog,
 * which says something true.
 */
import { usePlaneProgress } from "@/lib/progress";
import type { PlaneId } from "@/content/types";
import { Chip } from "@/components/ui/Chip";
import { GaugeBar, type GaugeTone } from "@/components/ui/GaugeBar";
import { FOCUS_RING } from "@/components/ui/focus";
import { TIER_CHIP } from "@/components/ui/tier";
import { format } from "@/components/ui/format";
import { RATING_KEYS, type RatingKey } from "@/components/hangar/types";
import { OrbitViewer, type ViewerEngineFactory } from "./OrbitViewer";
import type { PreflightUiStrings, PreflightView } from "./types";

const GAUGE_TONE: Readonly<Record<RatingKey, GaugeTone>> = {
  speed: "red",
  distance: "sky",
  airtime: "sky",
  ease: "green",
};

export type PreflightScreenProps = {
  ui: PreflightUiStrings;
  view: PreflightView;
  hangarHref: string;
  tutorialHref: string;
  createEngine?: ViewerEngineFactory;
};

export function PreflightScreen({
  ui,
  view,
  hangarHref,
  tutorialHref,
  createEngine,
}: PreflightScreenProps) {
  const { resumeStep } = usePlaneProgress(view.id as PlaneId);

  const creaseValue =
    view.creases.mountain === 0
      ? ui.creasesAllValley
      : format(ui.creasesMix, { valley: view.creases.valley, mountain: view.creases.mountain });

  const specs: readonly { readonly label: string; readonly value: string }[] = [
    { label: ui.paper, value: ui.paperValue[view.paperFormat] },
    { label: ui.weight, value: ui.weightValue },
    { label: ui.folds, value: format(ui.foldsValue, { count: view.stepCount }) },
    { label: ui.creases, value: creaseValue },
  ];

  const primaryLabel =
    resumeStep === null ? ui.startFolding : format(ui.resume, { step: resumeStep + 1 });

  return (
    <div className="flex min-h-screen flex-col">
      <div className="chevron-bar" aria-hidden="true" />

      <header className="flex items-center gap-md border-b border-ink-12 px-lg py-md">
        <a href={hangarHref} className={`font-mono text-micro tracking-[0.1em] uppercase ${FOCUS_RING}`}>
          {ui.backToHangar}
        </a>
        <span aria-hidden="true" className="h-[16px] w-px bg-ink-12" />
        <p className="font-mono text-micro tracking-[0.14em] text-ink-60 uppercase">{ui.eyebrow}</p>
      </header>

      <main className="mx-auto grid w-full max-w-[1360px] flex-1 grid-cols-1 gap-2xl px-lg py-2xl lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="flex flex-col gap-md">
          <OrbitViewer
            structure={view.structure}
            stepCount={view.stepCount}
            svg={view.svg}
            label={ui.viewerLabel}
            orbitHint={ui.orbitHint}
            specimen={ui.specimen}
            {...(createEngine ? { createEngine } : {})}
          />

          <section aria-label={ui.flightProfile} className="grid grid-cols-2 gap-sm sm:grid-cols-4">
            {RATING_KEYS.map((key) => (
              <div key={key} className="rounded-card border border-ink-12 bg-raised p-md">
                <GaugeBar
                  label={ui.rating[key]}
                  accessibleLabel={format(ui.ratingGauge, {
                    label: ui.rating[key],
                    value: view.ratings[key],
                  })}
                  value={view.ratings[key]}
                  tone={GAUGE_TONE[key]}
                  layout="stack"
                />
              </div>
            ))}
          </section>
        </div>

        <div className="flex flex-col">
          <Chip variant={TIER_CHIP[view.tier]} className="self-start">
            {ui.license[view.tier]}
          </Chip>

          <h1 className="mt-md font-display text-display-xl leading-none font-bold tracking-tight uppercase">
            {view.name}
          </h1>

          <p className="mt-md text-instruction leading-relaxed text-ink-87">{view.description}</p>

          <section className="mt-lg overflow-hidden rounded-card border border-ink-12 bg-raised">
            <h2 className="border-b border-ink-12 bg-paper px-md py-sm font-mono text-micro font-semibold tracking-[0.14em] uppercase">
              {ui.getYourPaper}
            </h2>
            <dl className="px-md py-sm">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-md border-b border-ink-12 py-sm last:border-b-0"
                >
                  <dt className="text-small text-ink-60">{spec.label}</dt>
                  <dd className="text-right font-mono text-small text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-md flex gap-md rounded-card border border-ink-12 bg-raised p-md">
            <span aria-hidden="true" className="w-[4px] flex-none bg-red" />
            <div>
              <h2 className="font-mono text-micro font-semibold tracking-[0.14em] text-red uppercase">
                {ui.throwTip}
              </h2>
              <p className="mt-sm leading-relaxed text-ink-87">{view.throwTip}</p>
            </div>
          </section>

          <a
            href={tutorialHref}
            data-testid="preflight-primary"
            className={`mt-lg block rounded-input border-2 border-ink bg-red px-lg py-md text-center font-display text-h3 font-bold tracking-[0.02em] text-white uppercase shadow-[4px_4px_0_0_var(--color-ink)] transition-[transform,box-shadow] duration-150 ease-move hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-ink)] ${FOCUS_RING}`}
          >
            {primaryLabel}
          </a>

          {view.tip ? (
            <p className="mt-md font-mono text-micro leading-relaxed text-ink-60 italic">
              <span className="not-italic">{ui.tipLabel} </span>
              {view.tip}
            </p>
          ) : null}

          <p className="mt-lg text-center font-mono text-micro tracking-[0.1em] text-ink-38 uppercase">
            {format(ui.manifestLine, { index: view.index, total: view.total })}
          </p>
        </div>
      </main>
    </div>
  );
}
