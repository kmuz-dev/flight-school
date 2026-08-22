"use client";

/**
 * Preflight is a decision screen: see the finished aircraft, confirm the paper
 * in hand, then start or resume. Flight characteristics and throwing advice
 * remain available without competing with that primary path.
 */
import { usePaperChoice, usePlaneProgress } from "@/lib/progress";
import { RATING_KEYS, type PlaneId, type RatingKey } from "@/content/types";
import { Chip } from "@/components/ui/Chip";
import { GaugeBar, type GaugeTone } from "@/components/ui/GaugeBar";
import { FOCUS_RING } from "@/components/ui/focus";
import { LocalePicker } from "@/components/ui/LocalePicker";
import { BrandMark } from "@/components/ui/BrandMark";
import type { Locale } from "@/i18n/config";
import { TIER_CHIP } from "@/components/ui/tier";
import { format } from "@/components/ui/format";
import { AircraftHero } from "./AircraftHero";
import type { PreflightUiStrings, PreflightView } from "./types";
import { formatForPlane } from "@/engine/core/paper";
import { PaperPicker } from "./PaperPicker";

const GAUGE_TONE: Readonly<Record<RatingKey, GaugeTone>> = {
  speed: "red",
  distance: "sky",
  airtime: "sky",
  ease: "green",
};

export type PreflightScreenProps = {
  ui: PreflightUiStrings;
  view: PreflightView;
  locale: Locale;
  hangarHref: string;
  tutorialHref: string;
};

export function PreflightScreen({
  ui,
  view,
  locale,
  hangarHref,
  tutorialHref,
}: PreflightScreenProps) {
  const { resumeStep } = usePlaneProgress(view.id as PlaneId);
  const selectedPaper =
    usePaperChoice(view.id as PlaneId) ?? formatForPlane(view.structure.paper.format);

  const creaseValue =
    view.creases.mountain === 0
      ? ui.creasesAllValley
      : format(ui.creasesMix, { valley: view.creases.valley, mountain: view.creases.mountain });

  const specs: readonly { readonly label: string; readonly value: string }[] = [
    { label: ui.paper, value: ui.paperPicker.label[selectedPaper] },
    { label: ui.weight, value: ui.weightValue },
    { label: ui.folds, value: format(ui.foldsValue, { count: view.stepCount }) },
    { label: ui.creases, value: creaseValue },
  ];

  const primaryLabel =
    resumeStep === null ? ui.startFolding : format(ui.resume, { step: resumeStep + 1 });

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#preflight-main"
        className={`fixed top-sm start-sm z-50 -translate-y-24 rounded-input bg-ink px-md py-sm text-paper transition-transform focus:translate-y-0 ${FOCUS_RING}`}
      >
        {ui.skipToContent}
      </a>
      <div className="chevron-bar" aria-hidden="true" />

      <header className="flex items-center gap-sm border-b border-ink-12 px-md py-md sm:gap-md sm:px-lg">
        <a
          href={hangarHref}
          aria-label={ui.backToHangar}
          className={`flex shrink-0 items-center gap-sm whitespace-nowrap font-mono text-micro tracking-[0.08em] uppercase ${FOCUS_RING}`}
        >
          <BrandMark className="h-7 w-8" sizes="32px" />
          <span className="sm:hidden">{ui.backToHangarShort}</span>
          <span className="hidden sm:inline">{ui.backToHangar}</span>
        </a>
        <span aria-hidden="true" className="hidden h-[16px] w-px bg-ink-12 min-[360px]:block" />
        <p className="hidden font-mono text-micro tracking-[0.12em] text-ink-muted uppercase min-[360px]:block">
          {ui.eyebrow}
        </p>
        {/* The last chance to change language before a fold begins: the
            tutorial header is packed tight enough that a phone cannot wrap it
            (see TutorialScreen), so the switch belongs here. */}
        <span className="ms-auto">
          <LocalePicker locale={locale} a11yLabel={ui.localePickerLabel} />
        </span>
      </header>

      <main
        id="preflight-main"
        className="mx-auto grid w-full max-w-[1360px] flex-1 grid-cols-1 gap-2xl px-lg py-2xl min-[960px]:grid-cols-[minmax(0,1fr)_460px]"
      >
        {/*
          The hero is bound to the WINDOW, not to the column beside it.

          Both are grid items in one row, so the row is as tall as the taller
          of them - and the taller of them is always the paper-and-profile
          column, at around 1290px. The art well inherited that height, which
          made the one thing the screen is built to lead with the one thing a
          cadet could not see: `object-contain` centres the aircraft in its
          well, so on a 900px window its centre sat 370px below the fold, under
          a panel that opened on 450px of empty cream. It got worse as the
          window got wider, because the well grew with it while the fold did
          not move.

          `self-start` stops the well stretching to the row; the height caps it
          to the viewport with a ceiling so a tall monitor does not turn it into
          a tower; `sticky` keeps the aircraft in frame while the flight profile
          is read past it, which is what "lead with the hero" means once the
          page is longer than the screen.
        */}
        <div className="flex flex-col gap-md min-[960px]:sticky min-[960px]:top-lg min-[960px]:h-[min(76dvh,720px)] min-[960px]:self-start">
          <AircraftHero
            svg={view.svg}
            artwork={view.presentation.artwork}
            artworkAlt={ui.artworkAlt}
            objectPosition={view.presentation.objectPosition}
            artworkScale={view.presentation.heroScale}
            planeName={view.name}
            label={ui.viewerLabel}
          />
        </div>

        <div className="flex flex-col">
          <Chip variant={TIER_CHIP[view.tier]} className="self-start">
            {ui.tier[view.tier]}
          </Chip>

          <h1 className="mt-md font-display text-display-xl leading-none font-bold tracking-tight">
            {view.name}
          </h1>

          <section className="mt-lg rounded-card bg-raised p-lg shadow-[0_10px_32px_rgb(26_43_74_/_0.09)]">
            <h2 className="font-mono text-micro font-semibold tracking-[0.12em] text-red-ink uppercase">
              {ui.getYourPaper}
            </h2>
            <div className="mt-md">
              <PaperPicker
                structure={view.structure}
                strings={ui.paperPicker}
                defaultPaper={formatForPlane(view.structure.paper.format)}
              />
            </div>
            <dl className="mt-lg border-t border-ink-12 pt-sm">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-md border-b border-ink-12 py-sm last:border-b-0"
                >
                  <dt className="text-small text-ink-muted">{spec.label}</dt>
                  <dd className="text-end font-mono text-small text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="flight-profile" className="mt-lg">
            <h2 id="flight-profile" className="font-display text-h3 font-semibold">
              {ui.flightProfile}
            </h2>
            <div className="mt-sm grid grid-cols-2 gap-sm sm:grid-cols-4 min-[960px]:grid-cols-2">
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
            </div>
          </section>

          <p className="mt-lg text-instruction leading-relaxed text-ink-87">{view.description}</p>

          <section className="mt-md flex gap-md rounded-card bg-raised p-md">
            <span aria-hidden="true" className="w-[4px] flex-none bg-red" />
            <div>
              <h2 className="font-mono text-micro font-semibold tracking-[0.14em] text-red-ink uppercase">
                {ui.throwTip}
              </h2>
              <p className="mt-sm leading-relaxed text-ink-87">{view.throwTip}</p>
            </div>
          </section>

          <a
            href={tutorialHref}
            data-testid="preflight-primary"
            className={`sticky bottom-0 z-20 -mx-lg mt-lg block border-2 border-ink bg-red-ink px-lg py-md text-center font-display text-h3 font-bold tracking-[0.02em] text-on-red shadow-[4px_4px_0_0_var(--color-ink)] transition-[transform,box-shadow] duration-150 ease-move hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--color-ink)] min-[960px]:static min-[960px]:mx-0 min-[960px]:rounded-input ${FOCUS_RING}`}
          >
            {primaryLabel}
          </a>

          {view.tip ? (
            <p className="mt-md font-mono text-micro leading-relaxed text-ink-muted italic">
              <span className="not-italic">{ui.tipLabel} </span>
              {view.tip}
            </p>
          ) : null}

        </div>
      </main>
    </div>
  );
}
