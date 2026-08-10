"use client";

/**
 * One boarding-pass card in the Hangar grid (SCREENS.md §1).
 *
 * The card ships a build-time engine SVG of the finished plane. Waking it -
 * hover on a fine pointer, or pressing the preview control on any device -
 * mounts a live fold engine over that SVG which floats with a slow bob. The
 * parent decides which cards may be live (at most two) and this component only
 * reports intent, so the LRU rule lives in one place rather than per card.
 */
import { useEffect, useRef } from "react";
import { loadFoldEngine, type FoldEngineFactory } from "@/engine";
import type { FoldEngineHandle } from "@/engine/core/types";
import { Chip } from "@/components/ui/Chip";
import { EngineSvg } from "@/components/ui/EngineSvg";
import { useTheme } from "@/lib/theme";
import { GaugeBar } from "@/components/ui/GaugeBar";
import { FOCUS_RING } from "@/components/ui/focus";
import { TIER_CHIP } from "@/components/ui/tier";
import { format, pad2 } from "@/components/ui/format";
import type { HangarPlaneView, HangarUiStrings } from "./types";

/** Hover only wakes a card where hovering is a real, deliberate gesture. */
function hasFinePointer(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export type PlaneCardProps = {
  view: HangarPlaneView;
  ui: HangarUiStrings;
  completed: boolean;
  live: boolean;
  selected: boolean;
  onHoverStart: (id: string) => void;
  onHoverEnd: (id: string) => void;
  onToggleSelect: (id: string) => void;
  createEngine?: FoldEngineFactory;
};

export function PlaneCard({
  view,
  ui,
  completed,
  live,
  selected,
  onHoverStart,
  onHoverEnd,
  onToggleSelect,
  createEngine,
}: PlaneCardProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!live) return;
    const mount = mountRef.current;
    if (!mount) return;

    let handle: FoldEngineHandle | null = null;
    let stopped = false;
    const onResize = (): void => handle?.resize();

    const start = (create: FoldEngineFactory): void => {
      // The card can be slept, or the whole grid unmounted, while the renderer
      // is still in flight. Building the stage then would leave a canvas with
      // nobody to dispose it.
      if (stopped) return;
      // A hangar card is a display surface: the aircraft stands up, lifts clear
      // of the ground over a graded backdrop and a soft shadow, and breathes.
      // No `autoRotate` - a constant spin holds the hero angle for about a
      // second and then parks all six cards at the same non-hero angle in
      // lockstep, which is the opposite of letting you read a shape. The engine
      // drops the float under prefers-reduced-motion and keeps the staging.
      handle = create(mount, view.structure, {
        display: true,
        rest: true,
        quality: "preview",
        theme,
      });
      // The catalog shows the aircraft, not the folding of it.
      handle.gotoStep(view.stepCount - 1, { animate: false });
      window.addEventListener("resize", onResize);
    };

    // An injected factory is already here, so a test still mounts its stage
    // synchronously; a browser fetches the renderer first.
    if (createEngine) start(createEngine);
    else void loadFoldEngine().then(start);

    return () => {
      stopped = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      handle = null;
    };
  }, [live, createEngine, view.structure, view.stepCount, theme]);

  return (
    <article
      data-plane={view.id}
      data-live={live ? "true" : "false"}
      onPointerEnter={() => {
        if (hasFinePointer()) onHoverStart(view.id);
      }}
      onPointerLeave={() => {
        if (hasFinePointer()) onHoverEnd(view.id);
      }}
      className={`relative flex flex-col rounded-card border bg-raised shadow-[0_6px_18px_rgb(26_43_74_/_0.09)] transition-transform duration-200 ease-move ${
        completed ? "border-green/40" : "border-ink-12"
      } hover:-translate-y-[3px]`}
    >
      <div className="relative">
        <button
          type="button"
          aria-pressed={selected}
          aria-label={format(ui.preview, { name: view.name })}
          onClick={() => onToggleSelect(view.id)}
          className={`relative block aspect-[3/2] w-full overflow-hidden rounded-t-[7px] bg-paper ${FOCUS_RING}`}
        >
          {/* The same two stops the live stage paints as its backdrop, and a
              soft pool where its contact shadow lands, so waking a card adds
              depth and motion rather than changing the scene. */}
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(170deg, var(--color-raised), var(--color-paper))",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-[18%] bottom-[14%] h-[12%] rounded-[50%] blur-[10px]"
            style={{ background: "var(--color-ink-12)" }}
          />
          <EngineSvg svg={view.svg} className="absolute inset-0 flex items-center justify-center" />
          {live ? (
            <div
              ref={mountRef}
              data-testid="live-scene"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            />
          ) : null}
        </button>

        <Chip variant={TIER_CHIP[view.tier]} className="absolute top-sm end-sm">
          {ui.tier[view.tier]}
        </Chip>

        {completed ? (
          <span
            data-testid="wings-stamp"
            className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] items-center gap-xs border-2 border-green bg-paper/80 px-sm py-xs font-mono text-micro font-semibold tracking-[0.14em] text-green uppercase"
          >
            {ui.wingsEarned}
          </span>
        ) : null}
      </div>

      {/* Perforated ticket edge: the dashed tear line plus its two punched notches. */}
      <div className="relative">
        <div className="perforation" />
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-[7px] size-[14px] -translate-y-1/2 rounded-full bg-paper"
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 -right-[7px] size-[14px] -translate-y-1/2 rounded-full bg-paper"
        />
      </div>

      <div className="flex flex-1 flex-col gap-sm p-md">
        <h2 className="font-display text-h3 leading-none font-bold tracking-tight uppercase">
          <a href={view.href} className={`hover:text-red-ink ${FOCUS_RING}`}>
            {view.name}
          </a>
        </h2>

        <p className="flex items-center justify-between font-mono text-micro tracking-[0.1em] text-ink-muted uppercase">
          <span>{ui.steps}</span>
          <span className="tabular-nums">{pad2(view.stepCount)}</span>
        </p>

        <div className="mt-auto flex flex-col gap-xs border-t border-ink-12 pt-sm">
          <GaugeBar
            label={ui.rating.speed}
            accessibleLabel={format(ui.ratingGauge, {
              label: ui.rating.speed,
              value: view.ratings.speed,
            })}
            value={view.ratings.speed}
            tone="red"
          />
          <GaugeBar
            label={ui.rating.distance}
            accessibleLabel={format(ui.ratingGauge, {
              label: ui.rating.distance,
              value: view.ratings.distance,
            })}
            value={view.ratings.distance}
            tone="sky"
          />
        </div>
      </div>
    </article>
  );
}
