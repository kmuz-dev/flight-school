/**
 * The academy's flight-profile gauge: five square segments, filled to the
 * rating. Same mark on the catalog card and on preflight, so a plane's profile
 * reads identically wherever it appears.
 *
 * The segments are decoration; the accessible name carries the value, so a
 * screen reader hears "Speed: 5 out of 5" rather than five anonymous boxes.
 */
import type { Rating } from "@/content/types";

export type GaugeTone = "red" | "sky" | "green" | "ink";

const FILLED: Record<GaugeTone, string> = {
  red: "bg-red",
  sky: "bg-sky",
  green: "bg-green",
  ink: "bg-ink",
};

const SEGMENTS = [1, 2, 3, 4, 5] as const;

/** `row` reads label-left/gauge-right on a card; `stack` sits in a spec tile. */
export type GaugeLayout = "row" | "stack";

const LAYOUT: Record<GaugeLayout, string> = {
  row: "flex-row items-center justify-between",
  stack: "flex-col items-start",
};

export function GaugeBar({
  value,
  tone = "ink",
  layout = "row",
  label,
  accessibleLabel,
  className = "",
}: {
  value: Rating;
  tone?: GaugeTone;
  layout?: GaugeLayout;
  /** Visible mono label, e.g. "SPEED". */
  label: string;
  /** Fully formed sentence, e.g. "Speed: 5 out of 5". */
  accessibleLabel: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-sm ${LAYOUT[layout]} ${className}`}>
      <span
        aria-hidden="true"
        className="font-mono text-micro font-medium tracking-[0.1em] text-ink-60 uppercase"
      >
        {label}
      </span>
      <span role="img" aria-label={accessibleLabel} className="flex gap-[3px]">
        {SEGMENTS.map((segment) => (
          <i
            key={segment}
            className={`block h-[11px] w-[7px] ${segment <= value ? FILLED[tone] : "bg-ink-12"}`}
          />
        ))}
      </span>
    </div>
  );
}
