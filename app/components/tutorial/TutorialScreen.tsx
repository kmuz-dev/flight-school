"use client";

/**
 * The composed tutorial screen (SCREENS.md §3).
 *
 * Owns the step index, playback state, and the localStorage progress write.
 * The engine is a child concern: FoldStage creates it and hands the handle up.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FoldEngineHandle, PaperFormat } from "@/engine/core/types";
import type { PlaneStructure, Tier } from "@/content/types";
import { writeStored } from "@/lib/storage";
import { FoldStage } from "./FoldStage";
import { TransportBar } from "./TransportBar";
import { StepRail } from "./StepRail";
import { FOCUS_RING } from "@/components/ui/focus";
import {
  format,
  pad2,
  type CameraPreset,
  type EngineFactory,
  type TutorialStepView,
  type TutorialUiStrings,
} from "./types";

export type TutorialScreenProps = {
  ui: TutorialUiStrings;
  structure: PlaneStructure;
  steps: readonly TutorialStepView[];
  planeName: string;
  tier: Tier;
  paperFormat: PaperFormat;
  hangarHref: string;
  initialStep?: number;
  createEngine?: EngineFactory;
  onComplete?: () => void;
};

export function TutorialScreen({
  ui,
  structure,
  steps,
  planeName,
  tier,
  paperFormat,
  hangarHref,
  initialStep = 0,
  createEngine,
  onComplete,
}: TutorialScreenProps) {
  const total = steps.length;
  const [stepIndex, setStepIndex] = useState(() =>
    Math.max(0, Math.min(initialStep, total - 1)),
  );
  const [engine, setEngine] = useState<FoldEngineHandle | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [preset, setPreset] = useState<CameraPreset>("threeQuarter");
  const [selfChecked, setSelfChecked] = useState(false);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === total - 1;

  // Engine events drive the readouts; the engine remains the source of truth
  // for playback so scrubbing and auto-play stay in agreement.
  useEffect(() => {
    if (!engine) return;
    const offProgress = engine.on("progress", (p) => {
      if (typeof p === "number") setProgress(p);
    });
    const offComplete = engine.on("stepComplete", () => {
      setIsPlaying(false);
      setProgress(1);
    });
    return () => {
      offProgress();
      offComplete();
    };
  }, [engine]);

  // Per-step UI state is derived from stepIndex, so it is adjusted during
  // render rather than in an effect - resetting it in an effect would render
  // once with the previous step's state and cascade.
  const [renderedStep, setRenderedStep] = useState(stepIndex);
  if (renderedStep !== stepIndex) {
    setRenderedStep(stepIndex);
    setSelfChecked(false);
    setProgress(0);
    setIsPlaying(true);
  }

  // Side effects of a step change: command the engine and remember the place.
  useEffect(() => {
    engine?.gotoStep(stepIndex);
    writeStored((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        [structure.id]: { step: stepIndex, updatedAt: new Date().toISOString() },
      },
    }));
  }, [engine, stepIndex, structure.id]);

  const goNext = useCallback(() => {
    if (isLastStep) {
      writeStored((prev) => ({
        ...prev,
        completed: { ...prev.completed, [structure.id]: { at: new Date().toISOString() } },
      }));
      onComplete?.();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, total - 1));
  }, [isLastStep, onComplete, structure.id, total]);

  const goBack = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  const togglePlay = useCallback(() => {
    if (!engine) return;
    if (engine.timeline.paused) {
      engine.timeline.play();
      setIsPlaying(true);
    } else {
      engine.timeline.pause();
      setIsPlaying(false);
    }
  }, [engine]);

  const replay = useCallback(() => {
    engine?.replay();
    setIsPlaying(true);
  }, [engine]);

  const selectPreset = useCallback(
    (p: CameraPreset) => {
      setPreset(p);
      engine?.setCameraPreset(p);
    },
    [engine],
  );

  const duration = useMemo(() => engine?.timeline.duration ?? 1.2, [engine]);

  if (!step) return null;

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-md border-b border-[color:var(--color-ink-12)] px-lg py-md">
        <div className="flex items-center gap-md">
          <a href={hangarHref} className={`font-mono text-micro tracking-[0.08em] ${FOCUS_RING}`}>
            {ui.backToHangar}
          </a>
          <h1 className="font-display text-h3 font-bold uppercase tracking-tight">{planeName}</h1>
          <span className="border border-[color:var(--color-ink)] px-sm py-[2px] font-mono text-micro tracking-[0.08em]">
            {ui.license[tier]}
          </span>
        </div>
        <div className="flex items-center gap-md">
          <p className="font-mono text-micro text-[color:var(--color-ink-60)]">
            {format(ui.progressLabel, { current: pad2(stepIndex + 1), total: pad2(total) })}
          </p>
          <div
            className="h-[4px] w-[120px] bg-[color:var(--color-ink-12)]"
            role="progressbar"
            aria-valuenow={stepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label={ui.progressLabel}
          >
            <div
              className="h-full bg-[color:var(--color-sky)]"
              style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            />
          </div>
          <a href={hangarHref} className={`border border-[color:var(--color-ink)] px-sm py-[2px] font-mono text-micro ${FOCUS_RING}`}>
            {ui.exit}
          </a>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-md p-lg">
          <FoldStage
            structure={structure}
            ui={ui}
            stepIndex={stepIndex}
            isPlaying={isPlaying}
            paperFormat={paperFormat}
            annotationLabel={step.annotationLabel}
            activePreset={preset}
            onSelectPreset={selectPreset}
            onEngineChange={setEngine}
            {...(createEngine ? { createEngine } : {})}
          />
          <TransportBar
            ui={ui}
            stepIndex={stepIndex}
            totalSteps={total}
            isPlaying={isPlaying}
            progress={progress}
            durationSeconds={duration}
            engine={engine}
            onPrev={goBack}
            onNext={goNext}
            onTogglePlay={togglePlay}
            onReplay={replay}
            onSeekStep={setStepIndex}
          />
        </div>

        <StepRail
          ui={ui}
          step={step}
          totalSteps={total}
          isLastStep={isLastStep}
          selfChecked={selfChecked}
          onSelfCheck={setSelfChecked}
          onBack={goBack}
          onNext={goNext}
        />
      </div>

      {step.tip ? (
        <footer className="border-t border-[color:var(--color-ink-12)] bg-[color:var(--color-raised)] px-lg py-sm">
          <p className="font-mono text-micro italic text-[color:var(--color-ink-60)]">
            <span className="not-italic">{ui.tipLabel} </span>
            {step.tip}
          </p>
        </footer>
      ) : null}
    </main>
  );
}
