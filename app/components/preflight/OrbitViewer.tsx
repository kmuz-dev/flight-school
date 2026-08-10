"use client";

/**
 * The dominant left panel of Preflight: the finished aircraft, orbitable.
 *
 * The build-time engine SVG is painted first and stays until the live stage
 * reports ready, so the panel is never an empty box - on a no-WebGL device or
 * before hydration the cadet still sees the plane they are about to fold.
 */
import { useEffect, useRef, useState } from "react";
import { loadFoldEngine, type FoldEngineFactory } from "@/engine";
import type { FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { EngineSvg } from "@/components/ui/EngineSvg";
import { useTheme } from "@/lib/theme";

export type OrbitViewerProps = {
  structure: PlaneStructure;
  /** Number of steps; the viewer shows the last one. */
  stepCount: number;
  svg: string;
  label: string;
  orbitHint: string;
  specimen: string;
  createEngine?: FoldEngineFactory;
};

export function OrbitViewer({
  structure,
  stepCount,
  svg,
  label,
  orbitHint,
  specimen,
  createEngine,
}: OrbitViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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
        rest: true,
        theme,
        onReady: () => setLive(true),
      });
      handle.gotoStep(stepCount - 1, { animate: false });
      window.addEventListener("resize", onResize);
    };

    if (createEngine) start(createEngine);
    else void loadFoldEngine().then(start);

    return () => {
      stopped = true;
      window.removeEventListener("resize", onResize);
      setLive(false);
      handle?.dispose();
      handle = null;
    };
  }, [createEngine, structure, stepCount, theme]);

  return (
    <section
      aria-label={label}
      className="relative isolate min-h-[380px] flex-1 overflow-hidden rounded-card border border-ink-12 lg:min-h-[520px]"
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

      {live ? null : (
        <EngineSvg svg={svg} className="absolute inset-md flex items-center justify-center" />
      )}

      <div ref={mountRef} data-testid="preflight-stage" aria-hidden="true" className="absolute inset-0" />

      <p className="pointer-events-none absolute top-md start-md font-mono text-micro tracking-[0.12em] text-ink-muted uppercase">
        {orbitHint}
      </p>

      <p className="pointer-events-none absolute end-md bottom-md border border-ink-12 bg-paper/90 px-sm py-xs font-mono text-micro tracking-[0.12em] text-ink-muted uppercase">
        {specimen}
      </p>
    </section>
  );
}
