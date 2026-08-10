"use client";

/**
 * The 3D viewer container: graph-paper backdrop, the engine canvas, the four
 * corner metadata overlays and the DOM fold-name annotation.
 *
 * The engine is created here in an effect and always disposed on cleanup.
 * `createEngine` defaults to the contract-conforming stub; integration swaps in
 * the real engine behind the identical `FoldEngineHandle` seam.
 */
import { useEffect, useRef, useState } from "react";
import type { AnnotationAnchor, FoldEngineHandle, PaperFormat } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { createFoldEngine } from "@/engine";
import { useTheme, type Theme } from "@/lib/theme";
import { Chip } from "@/components/ui/Chip";
import { FOCUS_RING } from "@/components/ui/focus";
import {
  CAMERA_PRESETS,
  format,
  pad2,
  type CameraPreset,
  type EngineFactory,
  type TutorialUiStrings,
} from "./types";

function toAnchor(payload: unknown): AnnotationAnchor | null {
  if (typeof payload !== "object" || payload === null) return null;
  const p = payload as Partial<AnnotationAnchor>;
  if (typeof p.x !== "number" || typeof p.y !== "number") return null;
  return { x: p.x, y: p.y, visible: p.visible !== false };
}

export type FoldStageProps = {
  structure: PlaneStructure;
  ui: TutorialUiStrings;
  /** 0-based. */
  stepIndex: number;
  isPlaying: boolean;
  paperFormat: PaperFormat;
  annotationLabel?: string | undefined;
  /**
   * Static annotation placement. The engine's `annotation` event overrides this
   * once it fires; the prop keeps the label renderable (and testable) against
   * engines that do not emit one, such as the stub.
   */
  annotation?: AnnotationAnchor | undefined;
  activePreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
  onEngineChange: (handle: FoldEngineHandle | null) => void;
  createEngine?: EngineFactory;
  /** Overrides the cadet's stored scene; tests pin it, the app does not. */
  theme?: Theme;
};

export function FoldStage({
  structure,
  ui,
  stepIndex,
  isPlaying,
  paperFormat,
  annotationLabel,
  annotation,
  activePreset,
  onSelectPreset,
  onEngineChange,
  createEngine = createFoldEngine,
  theme,
}: FoldStageProps) {
  const scene = useTheme();
  const activeTheme = theme ?? scene;
  const mountRef = useRef<HTMLDivElement>(null);
  const onEngineChangeRef = useRef(onEngineChange);
  const [engineAnchor, setEngineAnchor] = useState<AnnotationAnchor | null>(null);

  useEffect(() => {
    onEngineChangeRef.current = onEngineChange;
  }, [onEngineChange]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // `rest` but never `display`: the tutorial is a table, and the model
    // stands up only once it has a bend - which is exactly when it stops
    // being a sheet and starts being a plane.
    const handle = createEngine(mount, structure, { rest: true, theme: activeTheme });
    const offAnnotation = handle.on("annotation", (payload) => {
      setEngineAnchor(toAnchor(payload));
    });
    const onResize = () => handle.resize();
    window.addEventListener("resize", onResize);
    onEngineChangeRef.current(handle);

    return () => {
      window.removeEventListener("resize", onResize);
      offAnnotation();
      onEngineChangeRef.current(null);
      setEngineAnchor(null);
      handle.dispose();
    };
  }, [createEngine, structure, activeTheme]);

  const anchor = engineAnchor ?? annotation ?? null;
  const showAnnotation = annotationLabel !== undefined && anchor !== null && anchor.visible;
  const statusTemplate = isPlaying ? ui.playingFold : ui.pausedFold;

  return (
    <section
      aria-label={ui.stageLabel}
      className="relative isolate min-h-[320px] flex-1 overflow-hidden rounded-card border border-ink-12"
      style={{ background: "linear-gradient(170deg, var(--color-raised), var(--color-paper))" }}
    >
      {/* Graph-paper backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-ink-12) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div ref={mountRef} aria-hidden="true" className="absolute inset-0" data-testid="engine-mount" />

      {showAnnotation ? (
        <div
          data-testid="fold-annotation"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full font-mono text-micro font-semibold tracking-[0.14em] text-red uppercase"
          style={{ left: `${anchor.x}px`, top: `${anchor.y}px` }}
        >
          {annotationLabel}
        </div>
      ) : null}

      <p className="pointer-events-none absolute top-md start-md font-mono text-micro tracking-[0.12em] text-ink-60 uppercase">
        {ui.viewHint}
      </p>

      <div
        role="group"
        aria-label={ui.cameraGroupLabel}
        className="absolute top-md end-md flex gap-xs"
      >
        {CAMERA_PRESETS.map((preset) => {
          const active = preset === activePreset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectPreset(preset)}
              className={`px-sm py-xs font-mono text-micro font-semibold tracking-[0.12em] uppercase transition-colors duration-150 ease-move ${
                active
                  ? "bg-ink text-paper"
                  : "border border-ink-12 bg-ink-12/40 text-ink hover:bg-ink-12"
              } ${FOCUS_RING}`}
            >
              {ui.camera[preset]}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-md start-md">
        <Chip variant="quiet" className="bg-paper/90 text-ink">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${isPlaying ? "animate-pulse bg-red" : "bg-ink-38"}`}
          />
          <span data-testid="stage-status">
            {format(statusTemplate, { step: pad2(stepIndex + 1) })}
          </span>
        </Chip>
      </div>

      <p className="pointer-events-none absolute end-md bottom-md font-mono text-micro tracking-[0.12em] text-ink-38 uppercase">
        {ui.paper[paperFormat]}
      </p>
    </section>
  );
}
