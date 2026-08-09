"use client";

/**
 * The Hangar: the catalog and the home page (SCREENS.md §1).
 *
 * Stitch's calm card grid, Claude Design's filter chips and wings counter.
 * Filtering is client-side state, not routing: the catalog is one page and a
 * licence filter is a view of it, so the URL keeps meaning "the hangar".
 *
 * Card liveness is owned here rather than in the card. At most two scenes may
 * be live at once; waking a third sleeps the least recently woken one. Hover
 * wakes on fine pointers, the card's preview control selects on any device, and
 * a selected card stays awake when the pointer leaves it.
 */
import { useCallback, useMemo, useState } from "react";
import { useProgressSnapshot, wingsEarned } from "@/lib/progress";
import { hangarHref } from "@/lib/paths";
import type { PlaneId, Tier } from "@/content/types";
import { Chip } from "@/components/ui/Chip";
import { FOCUS_RING } from "@/components/ui/focus";
import { TIERS } from "@/components/ui/tier";
import { format } from "@/components/ui/format";
import { PlaneCard, type CardEngineFactory } from "./PlaneCard";
import type { HangarPlaneView, HangarUiStrings } from "./types";

/** Two live WebGL scenes is the ceiling a mid-range phone holds comfortably. */
const MAX_LIVE = 2;

type Filter = "all" | Tier;

export type HangarProps = {
  ui: HangarUiStrings;
  planes: readonly HangarPlaneView[];
  locale: string;
  createEngine?: CardEngineFactory;
};

export function Hangar({ ui, planes, locale, createEngine }: HangarProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [liveIds, setLiveIds] = useState<readonly string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stored = useProgressSnapshot();
  const wings = wingsEarned(stored);

  // A selection only counts while its scene is still awake; two hovers can
  // evict it, and a stale selection would otherwise pin a sleeping card.
  const activeSelection = selectedId !== null && liveIds.includes(selectedId) ? selectedId : null;

  const wake = useCallback((id: string) => {
    setLiveIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, MAX_LIVE));
  }, []);

  const sleep = useCallback((id: string) => {
    setLiveIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const onHoverEnd = useCallback(
    (id: string) => {
      if (id !== activeSelection) sleep(id);
    },
    [activeSelection, sleep],
  );

  // Both halves key off `activeSelection`, not the raw id: a card that was
  // evicted while selected reads as unselected everywhere, so pressing it wakes
  // and selects it again instead of waking it into a contradictory state.
  const onToggleSelect = useCallback(
    (id: string) => {
      const isSelected = activeSelection === id;
      setLiveIds((prev) =>
        isSelected
          ? prev.filter((x) => x !== id)
          : [id, ...prev.filter((x) => x !== id)].slice(0, MAX_LIVE),
      );
      setSelectedId(isSelected ? null : id);
    },
    [activeSelection],
  );

  const visible = useMemo(
    () => (filter === "all" ? planes : planes.filter((p) => p.tier === filter)),
    [filter, planes],
  );

  const filters: readonly { readonly key: Filter; readonly label: string }[] = useMemo(
    () => [
      { key: "all", label: ui.filterAll },
      ...TIERS.map((tier) => ({ key: tier as Filter, label: ui.tier[tier] })),
    ],
    [ui],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <div className="chevron-bar" aria-hidden="true" />

      <nav className="border-b border-ink-12">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-md px-lg py-md">
          <a href={hangarHref(locale)} className={`flex items-center gap-sm ${FOCUS_RING}`}>
            <span aria-hidden="true" className="size-[18px] rotate-45 bg-red" />
            <span className="font-display text-h3 font-bold tracking-tight uppercase">
              {ui.brand}
            </span>
          </a>
          <div className="flex items-center gap-lg">
            <span className="border-b-2 border-ink pb-[2px] font-display text-small font-bold tracking-[0.06em] uppercase">
              {ui.navHangar}
            </span>
            {/* The logbook screen is not in this build; shown inactive rather than
                as a link that would land on a 404. */}
            <span className="font-display text-small font-bold tracking-[0.06em] text-ink-38 uppercase">
              {ui.navLogbook}
            </span>
            <Chip variant="outline" className="gap-sm">
              <span aria-hidden="true" className="size-[10px] rounded-full border-2 border-green" />
              <span data-testid="wings-counter">{format(ui.navWings, { count: wings })}</span>
            </Chip>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-lg py-2xl">
        <header>
          <p className="font-mono text-micro font-semibold tracking-[0.18em] text-red uppercase">
            {format(ui.eyebrow, { count: planes.length })}
          </p>
          <div className="mt-md flex flex-wrap items-end justify-between gap-md">
            <h1 className="font-display text-display leading-none font-bold tracking-tight uppercase">
              {ui.title}
            </h1>
            <p className="flex items-center gap-sm font-mono text-micro tracking-[0.1em] text-ink-60 uppercase">
              {ui.fleetOverview}
            </p>
          </div>
          <div className="mt-md h-[2px] w-full bg-ink" />
          <p className="mt-md max-w-[62ch] text-instruction leading-relaxed text-ink-87">
            {ui.subtitle}
          </p>
        </header>

        <div role="group" aria-label={ui.filterLabel} className="mt-lg flex flex-wrap gap-sm">
          {filters.map(({ key, label }) => {
            const active = key === filter;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(key)}
                className={`rounded-input px-md py-sm font-mono text-micro font-semibold tracking-[0.08em] uppercase transition-colors duration-150 ease-move ${
                  active ? "bg-ink text-paper" : "border border-ink-38 text-ink hover:bg-ink-12"
                } ${FOCUS_RING}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <p className="mt-2xl font-mono text-small text-ink-60">{ui.empty}</p>
        ) : (
          <div className="mt-lg grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
            {visible.map((view) => (
              <PlaneCard
                key={view.id}
                view={view}
                ui={ui}
                completed={stored.completed[view.id as PlaneId] !== undefined}
                live={liveIds.includes(view.id)}
                selected={activeSelection === view.id}
                onHoverStart={wake}
                onHoverEnd={onHoverEnd}
                onToggleSelect={onToggleSelect}
                {...(createEngine ? { createEngine } : {})}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-ink-12">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-sm px-lg py-lg">
          <p className="font-mono text-micro tracking-[0.1em] text-ink-38 uppercase">
            {ui.footerLine}
          </p>
          <span aria-hidden="true" className="flex gap-xs">
            <span className="size-[10px] rotate-45 bg-red" />
            <span className="size-[10px] rotate-45 bg-sky" />
            <span className="size-[10px] rotate-45 bg-ink" />
          </span>
        </div>
      </footer>
    </div>
  );
}
