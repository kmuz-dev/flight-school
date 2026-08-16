"use client";

/**
 * The composed tutorial screen (SCREENS.md §3).
 *
 * Owns the step index, playback state, and the localStorage progress write.
 * The engine is a child concern: FoldStage creates it and hands the handle up.
 */
import type { FoldEngineFactory } from "@/engine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FoldEngineHandle, PaperFormat } from "@/engine/core/types";
import type { PlaneStructure } from "@/content/types";
import { recordCompletion, recordStep, usePlaneProgress } from "@/lib/progress";
import { FoldStage } from "./FoldStage";
import { TransportBar } from "./TransportBar";
import { StepRail } from "./StepRail";
import { FOCUS_RING } from "@/components/ui/focus";
import {
  format,
  pad2,
  type CameraPreset,
  type TutorialStepView,
  type TutorialUiStrings,
} from "./types";

export type TutorialScreenProps = {
  ui: TutorialUiStrings;
  structure: PlaneStructure;
  steps: readonly TutorialStepView[];
  planeName: string;
  paperFormat: PaperFormat;
  hangarHref: string;
  initialStep?: number;
  createEngine?: FoldEngineFactory;
  loadEngine?: () => Promise<FoldEngineFactory>;
  onComplete?: () => void;
};

export function TutorialScreen({
  ui,
  structure,
  steps,
  planeName,
  paperFormat,
  hangarHref,
  initialStep = 0,
  createEngine,
  loadEngine,
  onComplete,
}: TutorialScreenProps) {
  const total = steps.length;
  const [stepIndex, setStepIndex] = useState(() =>
    Math.max(0, Math.min(initialStep, total - 1)),
  );
  const [engine, setEngine] = useState<FoldEngineHandle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preset, setPreset] = useState<CameraPreset>("threeQuarter");
  const autoPlayNextRef = useRef(false);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === total - 1;
  const progressText = format(ui.stepLabel, {
    current: pad2(stepIndex + 1),
    total: pad2(total),
  });

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

  /**
   * Resume where the cadet left off.
   *
   * A static export cannot know the position at build time, and reading
   * localStorage during render would not match the prerendered HTML - so it
   * arrives through the progress store, whose server snapshot is empty and
   * whose real snapshot lands on the render straight after hydration. Consuming
   * it during render rather than in an effect matters: React re-renders before
   * committing, so the effect below sees the resumed step directly and never
   * gets a chance to persist step 0 over the position being resumed to.
   */
  const storedResume = usePlaneProgress(structure.id).resumeStep;
  const [resumeConsumed, setResumeConsumed] = useState(false);
  if (!resumeConsumed && storedResume !== null) {
    setResumeConsumed(true);
    setStepIndex(Math.max(0, Math.min(storedResume, total - 1)));
  }

  // Side effects of a step change: command the engine and remember the place.
  // Only an explicit Next asks the new step to auto-play. Resume, Back, direct
  // selection, and first entry all land at the start frame in a paused state.
  useEffect(() => {
    if (!engine) {
      recordStep(structure.id, stepIndex);
      return;
    }
    const shouldAutoPlay = autoPlayNextRef.current;
    autoPlayNextRef.current = false;
    engine.gotoStep(stepIndex);
    if (shouldAutoPlay && engine.renderMode === "webgl") {
      setIsPlaying(true);
      setProgress(0);
    } else {
      engine.timeline.pause();
      engine.timeline.progress(0);
      setIsPlaying(false);
      setProgress(engine.renderMode === "svg" ? 1 : 0);
    }
    recordStep(structure.id, stepIndex);
  }, [engine, stepIndex, structure.id]);

  const goNext = useCallback(() => {
    if (isLastStep) {
      recordCompletion(structure.id);
      onComplete?.();
      return;
    }
    autoPlayNextRef.current = true;
    setStepIndex((i) => Math.min(i + 1, total - 1));
  }, [isLastStep, onComplete, structure.id, total]);

  const goBack = useCallback(() => {
    autoPlayNextRef.current = false;
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const selectStep = useCallback(
    (index: number) => {
      autoPlayNextRef.current = false;
      const next = Math.max(0, Math.min(index, total - 1));
      if (next === stepIndex && engine) {
        engine.gotoStep(next);
        engine.timeline.pause();
        engine.timeline.progress(0);
        setIsPlaying(false);
        setProgress(engine.renderMode === "svg" ? 1 : 0);
        return;
      }
      setStepIndex(next);
    },
    [engine, stepIndex, total],
  );

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
    <>
      <a
        href="#tutorial-main"
        className={`fixed top-sm start-sm z-50 -translate-y-24 rounded-[6px] bg-ink px-md py-sm text-paper transition-transform focus:translate-y-0 ${FOCUS_RING}`}
      >
        {ui.skipToContent}
      </a>
      {/*
        A fixed-height workspace, not a document.

        The tutorial is a tool a cadet operates with paper in their hands: the
        stage, the transport and Next have to be where they were last time, and
        nothing should send them hunting down the page for the button that
        advances the fold. So the shell is exactly one viewport tall and never
        scrolls; only the instruction prose scrolls, inside the rail.

        `dvh` rather than `vh` because on a phone `vh` is the tallest the
        viewport ever gets, so a 100vh shell is guaranteed to be taller than the
        window whenever the browser's own chrome is showing.

        This replaces `min-h-screen`, which let the page grow past the viewport
        by whatever the current step happened to contain. It grew: on a 390x844
        phone the fourteen folds of the Hammer produced fourteen different page
        heights, between 253 and 566px past the window, and Next landed at six
        different places.
      */}
      <main
        id="tutorial-main"
        className="flex h-[100dvh] flex-col overflow-hidden"
        tabIndex={-1}
      >
      <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-md gap-y-xs border-b border-ink-12 px-md py-sm sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-lg sm:py-md">
        <a
          href={hangarHref}
          className={`col-start-1 row-start-1 font-mono text-micro tracking-[0.08em] ${FOCUS_RING}`}
        >
          {ui.backToHangar}
        </a>
        <h1 className="col-span-2 row-start-2 min-w-0 font-display text-h3 font-bold leading-none tracking-tight sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:truncate">
          {planeName}
        </h1>
        <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-sm sm:col-start-3">
          <p className="font-mono text-micro text-[color:var(--color-ink-muted)]">
            {progressText}
          </p>
          <div
            className="hidden h-[4px] w-[120px] bg-[color:var(--color-ink-12)] sm:block"
            role="progressbar"
            aria-valuenow={stepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label={progressText}
          >
            <div
              className="h-full bg-[color:var(--color-sky)]"
              style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {format(ui.stepAnnouncement, {
          current: stepIndex + 1,
          total,
          title: step.title,
        })}
      </p>

      {/*
        Stacked on a phone, the two rows split the shell evenly rather than
        being sized by their contents: the stage keeps a usable share and the
        rail scrolls its own prose inside the other half - which on a 390x844
        phone still shows the title and the whole instruction before anything
        needs scrolling. `minmax(0,...)` on both is what actually lets them
        shrink; a grid track's default `auto` minimum refuses to go below its
        content, which is how an overflowing page gets built out of children
        that all individually behave.
      */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)] lg:grid-rows-1">
        <div className="flex min-h-0 min-w-0 flex-col gap-md p-md sm:p-lg">
          <FoldStage
            structure={structure}
            ui={ui}
            isPlaying={isPlaying}
            paperFormat={paperFormat}
            annotationLabel={step.annotationLabel}
            activePreset={preset}
            onSelectPreset={selectPreset}
            onEngineChange={setEngine}
            {...(createEngine ? { createEngine } : {})}
            {...(loadEngine ? { loadEngine } : {})}
          />
          <TransportBar
            ui={ui}
            isPlaying={isPlaying}
            progress={progress}
            durationSeconds={duration}
            engine={engine}
            onTogglePlay={togglePlay}
            onReplay={replay}
          />
        </div>

        <StepRail
          ui={ui}
          step={step}
          steps={steps}
          isLastStep={isLastStep}
          onSelectStep={selectStep}
          onBack={goBack}
          onNext={goNext}
          {...(step.tip === undefined ? {} : { tip: step.tip })}
        />
      </div>
      </main>
    </>
  );
}
