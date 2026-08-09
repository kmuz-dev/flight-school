"use client";

/**
 * The instrument strip beneath the stage (SCREENS.md §3): playback transport,
 * the mono step counter, the segmented per-step progress strip, the time and
 * speed readout, and REPLAY.
 *
 * The strip doubles as navigation - each segment is a button jumping to a step.
 */
import type { FoldEngineHandle } from "@/engine/core/types";
import { IconButton } from "@/components/ui/IconButton";
import { TransportGlyph } from "@/components/ui/TransportGlyph";
import { FOCUS_RING } from "@/components/ui/focus";
import { format, formatTime, pad2, type TutorialUiStrings } from "./types";

export type TransportBarProps = {
  ui: TutorialUiStrings;
  /** 0-based. */
  stepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  /** Progress within the current fold, 0..1. */
  progress: number;
  durationSeconds: number;
  speed?: number;
  engine: FoldEngineHandle | null;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onReplay: () => void;
  onSeekStep: (index: number) => void;
};

export function TransportBar({
  ui,
  stepIndex,
  totalSteps,
  isPlaying,
  progress,
  durationSeconds,
  speed = 1,
  engine,
  onPrev,
  onNext,
  onTogglePlay,
  onReplay,
  onSeekStep,
}: TransportBarProps) {
  const current = stepIndex + 1;
  const elapsed = durationSeconds * progress;

  return (
    <section
      aria-label={ui.transportLabel}
      className="flex flex-wrap items-center gap-md rounded-[8px] border border-[color:var(--color-ink-12)] bg-[color:var(--color-raised)] px-md py-sm"
    >
      <div className="flex items-center gap-xs">
        <IconButton label={ui.prevStep} onClick={onPrev} disabled={stepIndex === 0}>
          <TransportGlyph glyph="prev" />
        </IconButton>
        <IconButton
          label={isPlaying ? ui.pause : ui.play}
          onClick={onTogglePlay}
          active={isPlaying}
        >
          <TransportGlyph glyph={isPlaying ? "pause" : "play"} />
        </IconButton>
        <IconButton label={ui.nextStep} onClick={onNext} disabled={current >= totalSteps}>
          <TransportGlyph glyph="next" />
        </IconButton>
      </div>

      <p className="font-mono text-small tracking-wider text-[color:var(--color-ink)]">
        {format(ui.stepLabel, { current: pad2(current), total: pad2(totalSteps) })}
      </p>

      <ol
        aria-label={ui.stripLabel}
        className="flex min-w-[180px] flex-1 items-center gap-[3px]"
      >
        {Array.from({ length: totalSteps }, (_, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          const tone = done
            ? "bg-[color:var(--color-green)]"
            : active
              ? "bg-[color:var(--color-red)]"
              : "bg-[color:var(--color-ink-12)]";
          return (
            <li key={i} className="h-[6px] flex-1">
              <button
                type="button"
                aria-label={format(ui.goToStep, { step: pad2(i + 1) })}
                aria-current={active ? "step" : undefined}
                data-state={done ? "done" : active ? "active" : "pending"}
                onClick={() => onSeekStep(i)}
                className={`block h-full w-full ${tone} ${FOCUS_RING}`}
              />
            </li>
          );
        })}
      </ol>

      <label className="flex items-center gap-xs">
        <span className="sr-only">{ui.scrubLabel}</span>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          onChange={(e) => engine?.timeline.progress(Number(e.target.value) / 1000)}
          className={`w-[120px] accent-[color:var(--color-red)] ${FOCUS_RING}`}
        />
      </label>

      <p className="font-mono text-micro text-[color:var(--color-ink-60)]">
        {format(ui.timeReadout, {
          elapsed: formatTime(elapsed),
          total: formatTime(durationSeconds),
          speed: speed.toFixed(1),
        })}
      </p>

      <IconButton label={ui.replay} onClick={onReplay}>
        <TransportGlyph glyph="replay" />
      </IconButton>
    </section>
  );
}
