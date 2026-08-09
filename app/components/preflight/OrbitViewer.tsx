"use client";

/**
 * The dominant left panel of Preflight: the finished aircraft, orbitable.
 *
 * The build-time engine SVG is painted first and stays until the live stage
 * reports ready, so the panel is never an empty box - on a no-WebGL device or
 * before hydration the cadet still sees the plane they are about to fold.
 */
import { useEffect, useRef, useState } from "react";
import { createFoldEngine } from "@/engine";
import type { EngineOptions, FoldEngineHandle } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { EngineSvg } from "@/components/ui/EngineSvg";

export type ViewerEngineFactory = (
  container: HTMLElement,
  structure: PlaneStructure,
  opts?: EngineOptions,
) => FoldEngineHandle;

export type OrbitViewerProps = {
  structure: PlaneStructure;
  /** Number of steps; the viewer shows the last one. */
  stepCount: number;
  svg: string;
  label: string;
  orbitHint: string;
  specimen: string;
  createEngine?: ViewerEngineFactory;
};

export function OrbitViewer({
  structure,
  stepCount,
  svg,
  label,
  orbitHint,
  specimen,
  createEngine = createFoldEngine,
}: OrbitViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const handle = createEngine(mount, structure, { onReady: () => setLive(true) });
    handle.gotoStep(stepCount - 1, { animate: false });
    const onResize = (): void => handle.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      setLive(false);
      handle.dispose();
    };
  }, [createEngine, structure, stepCount]);

  return (
    <section
      aria-label={label}
      className="relative isolate min-h-[380px] flex-1 overflow-hidden rounded-card border border-ink-12 lg:min-h-[520px]"
      style={{ background: "linear-gradient(170deg, var(--color-raised), var(--color-paper))" }}
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

      <p className="pointer-events-none absolute top-md left-md font-mono text-micro tracking-[0.12em] text-ink-60 uppercase">
        {orbitHint}
      </p>

      <p className="pointer-events-none absolute right-md bottom-md border border-ink-12 bg-paper/90 px-sm py-xs font-mono text-micro tracking-[0.12em] text-ink-60 uppercase">
        {specimen}
      </p>
    </section>
  );
}
