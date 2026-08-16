"use client";

/**
 * A catalog card led by production artwork. The card link and 3D action are
 * siblings, so there are no nested interactive controls. The live renderer is
 * requested only by the named inspection button.
 */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { loadFoldEngine, type FoldEngineFactory } from "@/engine";
import type { FoldEngineHandle } from "@/engine/core/types";
import { EngineSvg } from "@/components/ui/EngineSvg";
import { useTheme } from "@/lib/theme";
import { FOCUS_RING } from "@/components/ui/focus";
import { format, pad2 } from "@/components/ui/format";
import type { HangarPlaneView, HangarUiStrings } from "./types";

export type PlaneCardProps = {
  view: HangarPlaneView;
  ui: HangarUiStrings;
  completed: boolean;
  live: boolean;
  onToggleInspect: (id: string) => void;
  createEngine?: FoldEngineFactory;
};

export function PlaneCard({
  view,
  ui,
  completed,
  live,
  onToggleInspect,
  createEngine,
}: PlaneCardProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [artFailed, setArtFailed] = useState(false);
  const [renderReady, setRenderReady] = useState(false);
  const [staticFallback, setStaticFallback] = useState(false);
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
        displayView: view.presentation.displayView,
        rest: true,
        quality: "preview",
        theme,
        onReady: () => {
          // Both engines signal during construction. Defer until the factory
          // has returned its public handle, then read the renderer mode from
          // that seam rather than coupling the card to engine-owned DOM.
          queueMicrotask(() => {
            if (stopped || !handle) return;
            setStaticFallback(handle.renderMode === "svg");
            setRenderReady(true);
          });
        },
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
  }, [live, createEngine, view.structure, view.stepCount, view.presentation.displayView, theme]);

  return (
    <article
      data-plane={view.id}
      data-live={live ? "true" : "false"}
      className={`group relative isolate flex min-h-[390px] flex-col overflow-hidden rounded-card border bg-raised shadow-[0_10px_30px_rgb(26_43_74_/_0.10)] transition-[transform,box-shadow] duration-200 ease-move ${
        completed ? "border-green/40" : "border-ink-12"
      } hover:-translate-y-[3px] hover:shadow-[0_16px_38px_rgb(26_43_74_/_0.14)]`}
    >
      <a
        href={view.href}
        aria-label={view.name}
        className={`absolute inset-0 z-10 rounded-card ${FOCUS_RING}`}
      >
        <span className="absolute bottom-lg start-lg font-semibold text-red-ink">
          {ui.viewPlane} <span aria-hidden="true">→</span>
        </span>
      </a>

      <div className="relative aspect-[4/3] max-w-full overflow-hidden bg-paper [contain:layout_paint]">
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-ink-12) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {artFailed ? (
          <EngineSvg svg={view.svg} className="absolute inset-md flex items-center justify-center" />
        ) : (
          <Image
            src={view.presentation.artwork}
            alt=""
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 959px) 50vw, 400px"
            onError={() => setArtFailed(true)}
            className={`pointer-events-none max-w-full object-contain p-md transition-opacity duration-200 ${renderReady ? "opacity-0" : "opacity-100"}`}
            style={{
              objectPosition: view.presentation.objectPosition,
            }}
          />
        )}
        {live ? (
          <div
            ref={mountRef}
            data-testid="live-scene"
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${renderReady ? "opacity-100" : "opacity-0"}`}
          />
        ) : null}

        <span className="pointer-events-none absolute top-md end-md rounded-full border border-ink-12 bg-raised/90 px-sm py-xs font-mono text-micro font-semibold tracking-[0.08em] uppercase backdrop-blur-sm">
          {ui.tier[view.tier]}
        </span>

        {completed ? (
          <span
            data-testid="wings-stamp"
            className="pointer-events-none absolute bottom-md start-md rounded-full bg-green px-sm py-xs font-mono text-micro font-semibold tracking-[0.08em] text-white uppercase shadow-sm"
          >
            {ui.wingsEarned}
          </span>
        ) : null}

        {live && renderReady && staticFallback ? (
          <span
            aria-live="polite"
            className="pointer-events-none absolute end-md bottom-md rounded-full bg-raised/90 px-sm py-xs text-micro text-ink-muted backdrop-blur-sm"
          >
            {ui.staticFallback}
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none relative flex flex-1 flex-col gap-md p-lg">
        <h2 className="font-display text-h2 leading-none font-bold tracking-tight transition-colors group-hover:text-red-ink">
          {view.name}
        </h2>

        <div className="flex items-center justify-between border-t border-ink-12 pt-md">
          <p className="font-mono text-micro tracking-[0.08em] text-ink-muted uppercase">
            {ui.steps} <span className="tabular-nums text-ink">{pad2(view.stepCount)}</span>
          </p>
        </div>

        <div className="mt-auto flex items-center justify-end gap-md">
          <button
            type="button"
            aria-pressed={live}
            aria-label={format(ui.preview, { name: view.name })}
            onClick={() => {
              setRenderReady(false);
              setStaticFallback(false);
              onToggleInspect(view.id);
            }}
            className={`pointer-events-auto relative z-20 inline-flex size-11 items-center justify-center rounded-full border border-ink-38 bg-raised font-mono text-small font-semibold transition-colors hover:border-ink hover:bg-paper ${FOCUS_RING}`}
          >
            <span aria-hidden="true">3D</span>
          </button>
        </div>
      </div>
    </article>
  );
}
