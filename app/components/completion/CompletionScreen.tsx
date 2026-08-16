"use client";

/**
 * Wings earned (SCREENS.md §4).
 *
 * This screen REPORTS a completion; it does not perform one. It used to call
 * `recordCompletion` on arrival, which made the URL the thing that earned the
 * wings: anyone who typed `/en/plane/hammer/wings/` was awarded the Hammer they
 * had never folded, and the hangar then showed a stamp that was simply untrue.
 * The tutorial's Finish is now the only write, and this route only ever reads.
 *
 * Which means it has three states, not one, and the third is the reason for the
 * hydration gate. A static export prerenders against an empty snapshot, so the
 * first paint on every machine says "nothing earned" - including a machine
 * where the cadet finished the plane a second ago. Painting that would flash
 * "you have not earned this" at exactly the person who just did. So nothing
 * about earned or unearned is rendered until storage has actually been read.
 */
import Image from "next/image";
import { useState } from "react";
import {
  clearProgress,
  useProgressHydrated,
  useProgressSnapshot,
  usePlaneProgress,
  wingsEarned,
} from "@/lib/progress";
import type { PlaneId } from "@/content/types";
import { EngineSvg } from "@/components/ui/EngineSvg";
import { FOCUS_RING } from "@/components/ui/focus";
import { format, pad2 } from "@/components/ui/format";
import type { CompletionUiStrings, CompletionView } from "./types";

export type CompletionScreenProps = {
  ui: CompletionUiStrings;
  view: CompletionView;
  locale: string;
  hangarHref: string;
  tutorialHref: string;
};

export function CompletionScreen({
  ui,
  view,
  locale,
  hangarHref,
  tutorialHref,
}: CompletionScreenProps) {
  const planeId = view.id as PlaneId;
  const hydrated = useProgressHydrated();
  const stored = useProgressSnapshot();
  const { resumeStep } = usePlaneProgress(planeId);
  const [artFailed, setArtFailed] = useState(false);

  const earnedAt = stored.completed[planeId]?.at;
  const wings = wingsEarned(stored);
  const next =
    view.fleet.find(
      (entry) => entry.id !== view.id && stored.completed[entry.id as PlaneId] === undefined,
    ) ?? null;

  const artwork = artFailed ? (
    <EngineSvg svg={view.svg} className="absolute inset-lg flex items-center justify-center" />
  ) : (
    <Image
      src={view.presentation.artwork}
      alt={format(ui.artworkAlt, { name: view.name })}
      fill
      sizes="(max-width: 767px) 100vw, 520px"
      onError={() => setArtFailed(true)}
      className="pointer-events-none max-w-full object-contain p-lg"
      style={{
        objectPosition: view.presentation.objectPosition,
        scale: view.presentation.heroScale,
      }}
    />
  );

  /*
   * The gate. A skeleton would be a third thing to design and to translate for
   * a state that lasts one frame; an empty region that already carries the
   * screen's accessible name says the same thing to a screen reader and stops
   * the layout jumping when the real content lands.
   */
  if (!hydrated) {
    return (
      <main className="mx-auto w-full max-w-[1100px] px-lg py-2xl">
        <section
          aria-label={ui.wingsLabel}
          aria-busy="true"
          data-testid="completion-pending"
          className="min-h-[420px] rounded-card border border-ink-12 bg-raised"
        />
      </main>
    );
  }

  if (earnedAt === undefined) {
    return (
      <main className="mx-auto w-full max-w-[1100px] px-lg py-2xl">
        <section
          aria-label={ui.wingsLabel}
          data-testid="wings-not-earned"
          className="overflow-hidden rounded-card border border-ink-12 bg-raised shadow-[0_8px_28px_rgb(26_43_74_/_0.14)]"
        >
          <div className="chevron-bar opacity-60" aria-hidden="true" />
          <div className="grid gap-lg p-lg md:grid-cols-2 md:p-xl">
            <div
              className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-card border border-ink-12"
              style={{
                background:
                  "linear-gradient(170deg, var(--color-stage-sky), var(--color-stage-ground))",
              }}
            >
              {/* Dimmed, because this is the aircraft the cadet has not built yet. */}
              <div className="absolute inset-0 opacity-45">{artwork}</div>
            </div>

            <div className="flex flex-col">
              <h1 className="font-display text-display leading-none font-bold tracking-tight">
                {ui.notEarnedTitle}
              </h1>
              <div className="dashed-rule my-lg" />
              <p className="text-instruction leading-relaxed text-ink-87">
                {format(ui.notEarnedBody, { name: view.name })}
              </p>

              <div className="mt-lg flex flex-wrap gap-sm">
                <a
                  href={tutorialHref}
                  data-testid="wings-start"
                  className={`rounded-input bg-red-ink px-lg py-sm font-semibold text-on-red ${FOCUS_RING}`}
                >
                  {resumeStep === null
                    ? ui.startFolding
                    : format(ui.resume, { step: resumeStep + 1 })}
                </a>
                <a
                  href={hangarHref}
                  className={`rounded-input border-2 border-ink px-lg py-sm font-mono text-micro font-semibold tracking-[0.12em] uppercase hover:bg-ink-12 ${FOCUS_RING}`}
                >
                  {ui.returnToHangar}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const issueDate = formatIssueDate(earnedAt, locale);
  /*
   * With the whole floor folded there is no next aircraft to offer, so the way
   * back to the hangar becomes the primary action rather than staying a muted
   * secondary next to a sentence saying there is nothing left to do.
   */
  const returnIsPrimary = next === null;

  return (
    <main className="mx-auto w-full max-w-[1100px] px-lg py-2xl">
      <section
        aria-label={ui.wingsLabel}
        className="overflow-hidden rounded-card border border-ink-12 bg-raised shadow-[0_8px_28px_rgb(26_43_74_/_0.14)]"
      >
        <div className="chevron-bar" aria-hidden="true" />

        <div className="grid gap-lg p-lg md:grid-cols-2 md:p-xl">
          <div
            className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-card border border-ink-12"
            style={{
              background: "linear-gradient(170deg, var(--color-stage-sky), var(--color-stage-ground))",
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 400 400"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <path
                d="M30 350 C 140 330, 250 220, 380 60"
                fill="none"
                stroke="var(--color-sky)"
                strokeWidth="2.5"
                strokeDasharray="9 9"
              />
            </svg>

            {artwork}

            <div
              data-testid="wings-stamp"
              className="stamp-slam relative z-10 border-[5px] border-green bg-paper/40 px-lg py-md shadow-[inset_0_0_0_3px_rgb(74_124_89_/_0.12)]"
            >
              <p className="font-display text-display leading-none font-bold tracking-[0.02em] text-green uppercase">
                {ui.stamp}
              </p>
              <p className="mt-sm flex items-center justify-between gap-md border-t-2 border-green/70 pt-xs font-mono text-micro font-semibold tracking-[0.16em] text-green uppercase">
                <span>{ui.brand}</span>
                <span className="tabular-nums">{issueDate}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="flex items-center gap-sm font-mono text-micro font-semibold tracking-[0.18em] text-red-ink uppercase">
              <span
                aria-hidden="true"
                className="block h-[14px] w-[28px] bg-red"
                style={{
                  clipPath: "polygon(0 50%, 26% 0, 50% 52%, 74% 0, 100% 50%, 50% 100%)",
                }}
              />
              {ui.eyebrow}
            </p>

            <h1 className="mt-md font-display text-display leading-none font-bold tracking-tight uppercase">
              {ui.title}
            </h1>

            <div className="dashed-rule my-lg" />

            <p className="text-instruction leading-relaxed text-ink-87">{ui.body}</p>

            <div className="mt-lg flex items-center gap-md self-start rounded-card border border-ink-12 bg-paper p-md">
              <span
                aria-hidden="true"
                className="flex size-[48px] flex-none items-center justify-center rounded-full border border-dashed border-ink-38"
              >
                <span
                  className="block h-[16px] w-[30px] bg-green"
                  style={{
                    clipPath: "polygon(0 50%, 26% 0, 50% 52%, 74% 0, 100% 50%, 50% 100%)",
                  }}
                />
              </span>
              <span>
                <span className="block font-mono text-micro tracking-[0.14em] text-ink-muted uppercase">
                  {ui.rewardIssued}
                </span>
                <span className="block font-mono text-small font-semibold tracking-[0.08em] uppercase">
                  {format(ui.wingsBadge, { tier: ui.tier[view.tier] })}
                </span>
              </span>
            </div>

            <div className="mt-lg flex flex-wrap gap-sm">
              <a
                href={hangarHref}
                data-testid="wings-return"
                className={
                  returnIsPrimary
                    ? `rounded-input bg-red-ink px-lg py-sm font-semibold text-on-red ${FOCUS_RING}`
                    : `rounded-input bg-ink px-lg py-sm font-mono text-micro font-semibold tracking-[0.12em] text-paper uppercase ${FOCUS_RING}`
                }
              >
                {ui.returnToHangar}
              </a>
              {/*
                Still a link, so it middle-clicks and opens in a tab like one -
                but folding it again means folding it again, from step 1, so the
                click drops the resume position on the way out. The wing itself
                is never touched: `clearProgress` only forgets where the cadet
                had got to, and `recordCompletion` keeps its original date.
              */}
              <a
                href={tutorialHref}
                data-testid="wings-fold-again"
                onClick={() => clearProgress(planeId)}
                className={`rounded-input border-2 border-ink px-lg py-sm font-mono text-micro font-semibold tracking-[0.12em] uppercase hover:bg-ink-12 ${FOCUS_RING}`}
              >
                {ui.foldAgain}
              </a>
            </div>
          </div>
        </div>

        <div className="chevron-bar opacity-60" aria-hidden="true" />
      </section>

      <section aria-label={ui.statsLabel} className="mt-lg grid grid-cols-3 gap-sm">
        <Stat label={ui.statFolds} value={pad2(view.stepCount)} />
        <Stat label={ui.statEarned} value={issueDate} />
        <Stat label={ui.statWings} value={pad2(wings)} tone="green" />
      </section>

      {next ? (
        <section className="mt-lg flex flex-wrap items-center justify-between gap-md rounded-card border border-ink-12 bg-raised p-md">
          <div>
            <p className="font-mono text-micro tracking-[0.14em] text-ink-muted uppercase">
              {ui.nextInHangar}
            </p>
            <p className="mt-xs font-display text-h3 font-bold tracking-tight uppercase">
              {next.name}
            </p>
            <p className="mt-xs text-small text-ink-muted">
              {format(ui.nextMeta, { folds: next.stepCount, tier: ui.tier[next.tier] })}
            </p>
          </div>
          <a
            href={next.href}
            data-testid="wings-next"
            className={`rounded-input bg-red-ink px-lg py-sm font-semibold text-on-red ${FOCUS_RING}`}
          >
            {ui.foldNextPlane}
          </a>
        </section>
      ) : (
        <p className="mt-lg font-mono text-small text-ink-muted">{ui.allComplete}</p>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "green";
}) {
  return (
    <div
      className={`rounded-card border bg-raised p-md ${tone === "green" ? "border-green/45" : "border-ink-12"}`}
    >
      <p
        className={`font-mono text-micro tracking-[0.1em] uppercase ${tone === "green" ? "text-green" : "text-ink-muted"}`}
      >
        {label}
      </p>
      <p
        className={`mt-sm font-display text-h2 font-bold tracking-tight tabular-nums ${tone === "green" ? "text-green" : "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}

/** The stamp date, in the reader's locale. Never invented: it is the timestamp
 * localStorage recorded when the wings were first issued. */
function formatIssueDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
