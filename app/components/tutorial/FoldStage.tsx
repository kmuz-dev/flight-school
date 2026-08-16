"use client";

/**
 * The 3D viewer container: graph-paper backdrop, the engine canvas, the four
 * corner metadata overlays and the DOM fold-name annotation.
 *
 * The engine is created here in an effect and always disposed on cleanup.
 * `createEngine` defaults to the contract-conforming stub; integration swaps in
 * the real engine behind the identical `FoldEngineHandle` seam.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnnotationAnchor, FoldEngineHandle, PaperFormat } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { loadFoldEngine, type FoldEngineFactory } from "@/engine";
import { Chip } from "@/components/ui/Chip";
import { FOCUS_RING } from "@/components/ui/focus";
import {
  CAMERA_PRESETS,
  type CameraPreset,
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
  createEngine?: FoldEngineFactory;
  /** Async loader injection. Production uses loadFoldEngine; tests delay it. */
  loadEngine?: () => Promise<FoldEngineFactory>;
  /** Overrides the cadet's stored scene; tests pin it, the app does not. */
};

export function FoldStage({
  structure,
  ui,
  isPlaying,
  paperFormat,
  annotationLabel,
  annotation,
  activePreset,
  onSelectPreset,
  onEngineChange,
  createEngine,
  loadEngine,
}: FoldStageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FoldEngineHandle | null>(null);
  const intersectsRef = useRef(true);
  const documentVisibleRef = useRef(true);
  const onEngineChangeRef = useRef(onEngineChange);
  const [engineAnchor, setEngineAnchor] = useState<AnnotationAnchor | null>(null);
  const [renderMode, setRenderMode] = useState<FoldEngineHandle["renderMode"] | null>(null);

  const syncRenderActivity = useCallback(() => {
    engineRef.current?.setRenderActive(intersectsRef.current && documentVisibleRef.current);
  }, []);

  useEffect(() => {
    onEngineChangeRef.current = onEngineChange;
  }, [onEngineChange]);

  useEffect(() => {
    const stage = sectionRef.current;
    const doc = stage?.ownerDocument;
    if (!stage || !doc) return;

    documentVisibleRef.current = !doc.hidden;
    const onVisibilityChange = (): void => {
      documentVisibleRef.current = !doc.hidden;
      syncRenderActivity();
    };
    doc.addEventListener("visibilitychange", onVisibilityChange);

    const Observer = doc.defaultView?.IntersectionObserver;
    const observer =
      typeof Observer === "function"
        ? new Observer((entries) => {
            const entry = entries[0];
            if (!entry) return;
            intersectsRef.current = entry.isIntersecting;
            syncRenderActivity();
          })
        : null;
    observer?.observe(stage);

    return () => {
      observer?.disconnect();
      doc.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [syncRenderActivity]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let handle: FoldEngineHandle | null = null;
    let offAnnotation: (() => void) | null = null;
    let stopped = false;
    const onResize = () => handle?.resize();

    const start = (create: FoldEngineFactory): void => {
      // The cadet can leave the tutorial while the renderer is in flight, and
      // the transport must not be handed a stage that is already orphaned.
      if (stopped) return;
      // `rest` but never `display`: the tutorial is a table, and the model
      // stands up only once it has a bend - which is exactly when it stops
      // being a sheet and starts being a plane.
      handle = create(mount, structure, { rest: true });
      engineRef.current = handle;
      setRenderMode(handle.renderMode);
      syncRenderActivity();
      offAnnotation = handle.on("annotation", (payload) => {
        setEngineAnchor(toAnchor(payload));
      });
      window.addEventListener("resize", onResize);
      onEngineChangeRef.current(handle);
    };

    if (createEngine) start(createEngine);
    else void (loadEngine ?? loadFoldEngine)().then(start);

    return () => {
      stopped = true;
      window.removeEventListener("resize", onResize);
      offAnnotation?.();
      onEngineChangeRef.current(null);
      setEngineAnchor(null);
      setRenderMode(null);
      handle?.dispose();
      handle = null;
      engineRef.current = null;
    };
  }, [createEngine, loadEngine, structure, syncRenderActivity]);

  const anchor = engineAnchor ?? annotation ?? null;
  const showAnnotation = annotationLabel !== undefined && anchor !== null && anchor.visible;
  const statusText = renderMode === "svg" ? ui.staticFallback : isPlaying ? ui.playingFold : ui.pausedFold;

  return (
    <section
      ref={sectionRef}
      aria-label={ui.stageLabel}
      className="relative isolate min-h-0 flex-1 overflow-hidden rounded-card border border-ink-12"
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
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full font-mono text-micro font-semibold tracking-[0.14em] text-red-ink uppercase"
          style={{ left: `${anchor.x}px`, top: `${anchor.y}px` }}
        >
          {annotationLabel}
        </div>
      ) : null}

      {renderMode !== "svg" ? (
        <p className="pointer-events-none absolute top-md start-md hidden font-mono text-micro tracking-[0.12em] text-ink-muted uppercase sm:block">
          {ui.viewHint}
        </p>
      ) : null}

      {renderMode !== "svg" ? (
        <div
          role="group"
          aria-label={ui.cameraGroupLabel}
          className="absolute top-md end-md hidden gap-xs sm:flex"
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
      ) : null}

      <div
        className={`absolute start-md max-w-[calc(100%_-_2rem)] ${renderMode === "svg" ? "top-md" : "bottom-md"}`}
        role="status"
        aria-live="polite"
      >
        <Chip variant="quiet" className="bg-paper/95 text-ink">
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${renderMode === "svg" ? "bg-sky" : isPlaying ? "animate-pulse bg-red" : "bg-ink-38"}`}
          />
          <span data-testid="stage-status">{statusText}</span>
        </Chip>
      </div>

      <p className="pointer-events-none absolute end-md bottom-md hidden font-mono text-micro tracking-[0.12em] text-ink-muted uppercase sm:block">
        {ui.paper[paperFormat]}
      </p>
    </section>
  );
}
