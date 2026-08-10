"use client";

/**
 * Wings earned (SCREENS.md §4): the certificate moment.
 *
 * Reaching this screen is what files the flight - `recordCompletion` runs on
 * arrival, which is what puts the WINGS EARNED stamp on the plane's hangar
 * card. The mockup's navy "LOG YOUR FLIGHT" button is not reproduced: there is
 * no logbook screen in this build, and the flight is already logged by the time
 * the certificate paints, so the pair reads Return to hangar / Fold it again.
 */
import { useEffect } from "react";
import { recordCompletion, useProgressSnapshot, wingsEarned } from "@/lib/progress";
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

  useEffect(() => {
    recordCompletion(planeId);
  }, [planeId]);

  const stored = useProgressSnapshot();
  const wings = wingsEarned(stored);
  const earnedAt = stored.completed[planeId]?.at;
  const issueDate = earnedAt === undefined ? "--" : formatIssueDate(earnedAt, locale);

  const next =
    view.fleet.find((entry) => entry.id !== view.id && stored.completed[entry.id as PlaneId] === undefined) ??
    null;

  return (
    <main className="mx-auto w-full max-w-[1100px] px-lg py-2xl">
      <section
        aria-label={ui.certificateLabel}
        className="overflow-hidden rounded-card border border-ink-12 bg-raised shadow-[0_8px_28px_rgb(26_43_74_/_0.14)]"
      >
        <div className="chevron-bar" aria-hidden="true" />

        <div className="grid gap-lg p-lg md:grid-cols-2 md:p-xl">
          <div
            className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-card border border-ink-12"
            style={{
              background: "linear-gradient(170deg, var(--color-raised), var(--color-paper))",
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

            <EngineSvg svg={view.svg} className="absolute inset-lg flex items-center justify-center" />

            <div
              data-testid="certified-stamp"
              className="stamp-slam relative z-10 border-[5px] border-green bg-paper/40 px-lg py-md shadow-[inset_0_0_0_3px_rgb(74_124_89_/_0.12)]"
            >
              <p className="font-display text-display leading-none font-bold tracking-[0.02em] text-green uppercase">
                {ui.certified}
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
                className={`rounded-input bg-ink px-lg py-sm font-mono text-micro font-semibold tracking-[0.12em] text-paper uppercase ${FOCUS_RING}`}
              >
                {ui.returnToHangar}
              </a>
              <a
                href={tutorialHref}
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
        <Stat label={ui.statCertified} value={issueDate} />
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
              {format(ui.nextMeta, { folds: next.stepCount, license: ui.license[next.tier] })}
            </p>
          </div>
          <a
            href={next.href}
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
