"use client";

/**
 * The dominant Preflight art panel. Production artwork is the default and the
 * renderer remains behind an explicit inspection action. The artwork stays in
 * place until the requested stage is ready, avoiding a blank loading frame.
 */
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { loadFoldEngine, type FoldEngineFactory } from "@/engine";
import type { FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { EngineSvg } from "@/components/ui/EngineSvg";
import { useTheme } from "@/lib/theme";
import type { DisplayView } from "@/engine/core/types";
import { FOCUS_RING } from "@/components/ui/focus";
import { format } from "@/components/ui/format";

export type OrbitViewerProps = {
  structure: PlaneStructure;
  /** Number of steps; the viewer shows the last one. */
  stepCount: number;
  svg: string;
  artwork: StaticImageData;
  artworkAlt: string;
  objectPosition: string;
  /** Optical correction inside this art well; see `AircraftPresentation`. */
  artworkScale: number;
  displayView: DisplayView;
  planeName: string;
  label: string;
  orbitHint: string;
  inspect3d: string;
  showArtwork: string;
  loading3d: string;
  staticFallback: string;
  createEngine?: FoldEngineFactory;
};

export function OrbitViewer({
  structure,
  stepCount,
  svg,
  artwork,
  artworkAlt,
  objectPosition,
  artworkScale,
  displayView,
  planeName,
  label,
  orbitHint,
  inspect3d,
  showArtwork,
  loading3d,
  staticFallback,
  createEngine,
}: OrbitViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);
  const [renderMode, setRenderMode] = useState<FoldEngineHandle["renderMode"] | null>(null);
  const [artFailed, setArtFailed] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (!requested) return;
    const mount = mountRef.current;
    if (!mount) return;

    setReady(false);
    setRenderMode(null);
    let handle: FoldEngineHandle | null = null;
    let stopped = false;
    const onResize = (): void => handle?.resize();

    const start = (create: FoldEngineFactory): void => {
      // Navigating away while the renderer is in flight must not leave a stage
      // behind, and must not flip `live` on a component that is gone.
      if (stopped) return;
      // A display stage: the aircraft stands up, lifts clear of the ground over
      // a graded backdrop and a soft shadow, and opens on the catalogue's hero
      // angle - the same angle the SVG underneath is drawn from.
      //
      // The angle is carried by `display`, not by a `cameraPreset`. Presets are
      // authored into fold steps for the sake of that fold, so left to itself
      // the stage would inherit the last step's hint, which on the Dart is
      // nose-on. No step may decide how a finished aircraft is photographed.
      handle = create(mount, structure, {
        display: true,
        displayView,
        rest: true,
        theme,
        onReady: () => {
          // Both engines currently signal readiness during construction. A
          // microtask lets the factory return its authoritative handle first,
          // so UI behavior depends on the public seam rather than renderer DOM.
          queueMicrotask(() => {
            if (stopped || !handle) return;
            setRenderMode(handle.renderMode);
            setReady(true);
          });
        },
      });
      handle.gotoStep(stepCount - 1, { animate: false });
      window.addEventListener("resize", onResize);
    };

    if (createEngine) start(createEngine);
    else void loadFoldEngine().then(start);

    return () => {
      stopped = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      handle = null;
    };
  }, [requested, createEngine, structure, stepCount, displayView, theme]);

  const showRenderedStage =
    requested && ready && (renderMode === "webgl" || (renderMode === "svg" && artFailed));
  const staticPreview = requested && ready && renderMode === "svg";

  return (
    <section
      aria-label={label}
      className="relative isolate min-h-[380px] flex-1 overflow-hidden rounded-card bg-raised shadow-[0_18px_55px_rgb(26_43_74_/_0.13)] lg:min-h-[560px]"
      style={{ background: "linear-gradient(170deg, var(--color-stage-sky), var(--color-stage-ground))" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-ink-12) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div
        data-testid="preflight-artwork"
        className={`absolute inset-0 transition-opacity duration-300 ${showRenderedStage ? "opacity-0" : "opacity-100"}`}
      >
        {artFailed ? (
          <EngineSvg svg={svg} className="absolute inset-lg flex items-center justify-center" />
        ) : (
          <Image
            src={artwork}
            alt={format(artworkAlt, { name: planeName })}
            fill
            priority
            sizes="(max-width: 959px) 100vw, 65vw"
            onError={() => setArtFailed(true)}
            className="pointer-events-none max-w-full object-contain p-lg"
            style={{ objectPosition, scale: artworkScale }}
          />
        )}
      </div>

      {requested ? (
        <div
          ref={mountRef}
          data-testid="preflight-stage"
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-300 ${showRenderedStage ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}

      {requested && ready && renderMode === "webgl" ? (
        <p className="pointer-events-none absolute top-md start-md rounded-full bg-raised/90 px-sm py-xs font-mono text-micro tracking-[0.08em] text-ink-muted uppercase backdrop-blur-sm">
          {orbitHint}
        </p>
      ) : null}

      <div className="absolute end-md bottom-md start-md z-10 flex flex-wrap items-center justify-between gap-sm">
        {requested && (!ready || staticPreview) ? (
          <p aria-live="polite" className="rounded-full bg-raised/90 px-sm py-xs text-small text-ink-muted backdrop-blur-sm">
            {!ready ? loading3d : staticFallback}
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          aria-pressed={requested}
          onClick={() => setRequested((value) => !value)}
          className={`ms-auto min-h-11 rounded-input border border-ink bg-raised/95 px-md py-sm text-small font-semibold shadow-sm backdrop-blur-sm hover:bg-paper ${FOCUS_RING}`}
        >
          {requested ? showArtwork : format(inspect3d, { name: planeName })}
        </button>
      </div>
    </section>
  );
}
