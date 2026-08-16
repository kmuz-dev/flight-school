"use client";

/**
 * The instrument strip beneath the stage (SCREENS.md §3): playback transport,
 * the scrubber, time readout, and replay action. Step navigation belongs to
 * the instruction rail so there is one clear Back / Next path.
 */
import type { FoldEngineHandle } from "@/engine/core/types";
import { IconButton } from "@/components/ui/IconButton";
import { TransportGlyph } from "@/components/ui/TransportGlyph";
import { FOCUS_RING } from "@/components/ui/focus";
import { format, formatTime, type TutorialUiStrings } from "./types";

export type TransportBarProps = {
  ui: TutorialUiStrings;
  isPlaying: boolean;
  /** Progress within the current fold, 0..1. */
  progress: number;
  durationSeconds: number;
  engine: FoldEngineHandle | null;
  onTogglePlay: () => void;
  onReplay: () => void;
};

export function TransportBar({
  ui,
  isPlaying,
  progress,
  durationSeconds,
  engine,
  onTogglePlay,
  onReplay,
}: TransportBarProps) {
  const elapsed = durationSeconds * progress;
  const animationUnavailable = engine === null || engine.renderMode === "svg";

  return (
    <section
      aria-label={ui.transportLabel}
      className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-sm gap-y-xs rounded-[8px] border border-ink-12 bg-raised px-sm py-sm sm:grid-cols-[auto_minmax(180px,1fr)_auto_auto] sm:px-md"
    >
      <IconButton
        label={isPlaying ? ui.pause : ui.play}
        onClick={onTogglePlay}
        active={isPlaying && !animationUnavailable}
        disabled={animationUnavailable}
      >
        <TransportGlyph glyph={isPlaying ? "pause" : "play"} />
      </IconButton>

      <label className="flex min-w-0 items-center gap-xs">
        <span className="sr-only">{ui.scrubLabel}</span>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          disabled={animationUnavailable}
          onChange={(e) => engine?.timeline.progress(Number(e.target.value) / 1000)}
          className={`w-full accent-red disabled:cursor-not-allowed disabled:opacity-38 ${FOCUS_RING}`}
        />
      </label>

      <IconButton label={ui.replay} onClick={onReplay} disabled={animationUnavailable}>
        <TransportGlyph glyph="replay" />
      </IconButton>

      <p className="col-span-3 text-center font-mono text-micro text-ink-muted sm:col-span-1 sm:text-start">
        {format(ui.timeReadout, {
          elapsed: formatTime(elapsed),
          total: formatTime(durationSeconds),
        })}
      </p>
    </section>
  );
}
