"use client";

/**
 * The Hangar: one aircraft in a photographed room, and the fleet on a strip
 * beneath it (SCREENS.md §1).
 *
 * The composition is deliberately not centred. DESIGN.md's avoid-list names
 * "centered-everything landing pages", and one big aeroplane in the middle of
 * the screen is exactly that shape - so the bay sits toward the top-right and
 * the placard occupies the lower-left, which also runs WITH the aircraft: the
 * artwork's nose points low-left, so the type sits where the plane is heading
 * rather than opposite it.
 *
 * This component owns WHICH aircraft; `HangarBay` owns how it moves. Selection
 * is state here because four separate controls set it and the placard, the live
 * region and the primary action all read it.
 */
import { useCallback, useEffect, useState } from "react";
import { useProgressHydrated, useProgressSnapshot, wingsEarned } from "@/lib/progress";
import { hangarHref } from "@/lib/paths";
import type { PlaneId } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { RTL_LOCALES } from "@/i18n/config";
import { FOCUS_RING } from "@/components/ui/focus";
import { format } from "@/components/ui/format";
import { usePrefersReducedMotion } from "@/components/ui/reducedMotion";
import { LocalePicker } from "@/components/ui/LocalePicker";
import { HangarBay } from "./HangarBay";
import { firstUnfinishedIndex, type HangarPlaneView, type HangarUiStrings } from "./types";
import type { FoldEngineFactory } from "@/engine";

export type HangarProps = {
  ui: HangarUiStrings;
  planes: readonly HangarPlaneView[];
  locale: Locale;
  createEngine?: FoldEngineFactory;
};

export function Hangar({ ui, planes, locale, createEngine }: HangarProps) {
  /*
   * Which aircraft is showing, as a CHOICE plus a default rather than as one
   * piece of state seeded by an effect.
   *
   * The bay has to open on the first unfinished aircraft, and that cannot be
   * known until storage has been read - so the obvious shape is "start at 0,
   * then setIndex once hydrated", which is a render, an effect, and a second
   * render to correct the first. Deriving it instead makes the rule the value:
   * before hydration there is nothing to know, after it the fleet answers, and
   * the moment the cadet chooses anything their choice outranks both. "Pick
   * once" then needs no flag to enforce, because there is no picking.
   */
  const [chosen, setChosen] = useState<{
    readonly index: number;
    readonly revision: number;
  } | null>(null);
  const stored = useProgressSnapshot();
  const hydrated = useProgressHydrated();
  const reducedMotion = usePrefersReducedMotion();
  const rtl = RTL_LOCALES.has(locale);

  const wings = wingsEarned(stored);
  const index =
    chosen?.index ??
    (hydrated
      ? firstUnfinishedIndex(planes, (id) => stored.completed[id as PlaneId] !== undefined)
      : 0);
  const selected = planes[index]!;
  const progress = stored.progress[selected.id as PlaneId];
  const earned = stored.completed[selected.id as PlaneId] !== undefined;

  const select = useCallback(
    (next: number) =>
      setChosen((previous) => ({
        index: next,
        revision: (previous?.revision ?? 0) + 1,
      })),
    [],
  );

  /*
   * Arrow keys anywhere that is not a text control, so the bay behaves the way
   * a selector in a game does. They follow the reading direction: in Arabic the
   * fleet runs right to left, so Left is the NEXT aircraft.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, select, textarea, [contenteditable]")) {
        return;
      }
      event.preventDefault();
      const forward = rtl ? event.key === "ArrowLeft" : event.key === "ArrowRight";
      select((index + (forward ? 1 : -1) + planes.length) % planes.length);
    };
    // Re-bound whenever the selection changes, which is what lets it step from
    // the aircraft actually showing rather than from a captured stale one. One
    // window listener swapped per arrow press is not a cost worth a ref.
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, planes.length, rtl, select]);

  const primaryLabel =
    progress && progress.step > 0
      ? format(ui.resume, { step: progress.step + 1 })
      : ui.startFolding;

  return (
    <div className="hangar-shell">
      <a
        href="#hangar-main"
        className={`fixed top-sm start-sm z-50 -translate-y-24 rounded-input bg-ink px-md py-sm text-paper transition-transform focus:translate-y-0 ${FOCUS_RING}`}
      >
        {ui.skipToContent}
      </a>
      <div className="chevron-bar relative z-40" aria-hidden="true" />

      <nav className="hangar-nav">
        <a href={hangarHref(locale)} className={`hangar-wordmark ${FOCUS_RING}`}>
          <span aria-hidden="true" className="size-[14px] rotate-45 bg-red" />
          <span>{ui.brand}</span>
        </a>
        <span className="flex-1" />
        <span className="hangar-chip" data-testid="wings-counter">
          {format(ui.navWings, { count: wings })}
        </span>
        <LocalePicker locale={locale} a11yLabel={ui.localePickerLabel} />
      </nav>

      {/*
        One announcement per selection, and it carries what the placard says
        rather than just the name: a screen-reader user arrowing through the
        fleet is choosing between aircraft, and difficulty and length are what
        they are choosing on.
      */}
      <p className="sr-only" aria-live="polite" aria-atomic="true" data-testid="hangar-announce">
        {format(ui.announce, {
          name: selected.name,
          tier: ui.tier[selected.tier],
          count: selected.stepCount,
        })}
      </p>

      <main id="hangar-main" className="hangar-main">
        <HangarBay
          ui={ui}
          planes={planes}
          index={index}
          selectionKey={chosen?.revision ?? (hydrated ? "hydrated" : "initial")}
          reducedMotion={reducedMotion}
          rtl={rtl}
          onSelect={select}
          {...(createEngine ? { createEngine } : {})}
        />

        <div className="hangar-placard">
          <p className="hangar-eyebrow">{format(ui.eyebrow, { count: planes.length })}</p>
          <h1 className="hangar-title" data-long={selected.name.length > 12 ? "true" : "false"}>
            {selected.name}
          </h1>
          <div className="hangar-meta">
            {/*
              The accent is a RULE, not a fill. White on the Bulldog's amber
              measures about 2.6:1 and DESIGN.md requires AA on every text pair,
              so an accent keeps its hex as a mark and never carries text.
            */}
            <span className="hangar-tier" style={{ ["--accent" as string]: selected.structure.accent }}>
              {ui.tier[selected.tier]}
            </span>
            <span className="hangar-steps">{format(ui.folds, { count: selected.stepCount })}</span>
            {/*
              Held until hydration for the same reason the completion route
              holds: the prerender says "not earned" for everybody, and flashing
              that at a cadet who has folded it is worse than a beat of nothing.
            */}
            {hydrated && earned ? (
              <span className="hangar-wings" data-testid="hangar-wings">
                {ui.wingsEarned}
              </span>
            ) : null}
          </div>
          <p className="hangar-blurb">{ui.subtitle}</p>
          <a href={selected.href} data-testid="hangar-primary" className={`hangar-primary ${FOCUS_RING}`}>
            {primaryLabel}
          </a>
        </div>
      </main>
    </div>
  );
}
