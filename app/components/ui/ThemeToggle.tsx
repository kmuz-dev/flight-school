"use client";

/**
 * The Night Flight switch, in the hangar nav (SCREENS.md §1).
 *
 * Presented as the outlined mono placard the Night Flight mockup (1e) shows in
 * that slot, with the status dot next to it. It reads as a status readout that
 * happens to be pressable, which is the point: the label names the scene you
 * are in, not the one you would get.
 */
import { setTheme, useTheme } from "@/lib/theme";
import { Chip } from "./Chip";
import { FOCUS_RING } from "./focus";

export type ThemeToggleProps = {
  /** Label for the current scene: "Night flight" / "Day flight". */
  readonly dayLabel: string;
  readonly nightLabel: string;
  readonly a11yLabel: string;
};

export function ThemeToggle({ dayLabel, nightLabel, a11yLabel }: ThemeToggleProps) {
  const theme = useTheme();
  const night = theme === "night";
  const scene = night ? nightLabel : dayLabel;

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      /*
        The scene name leads, because WCAG 2.5.3 asks that a control's
        accessible name start with the words printed on it: someone driving
        the page by voice says "click day flight", and a name that begins
        "Switch between..." leaves them with nothing to say. The purpose
        follows, since the placard alone does not say it is pressable.
      */
      aria-label={`${scene}. ${a11yLabel}`}
      aria-pressed={night}
      onClick={() => setTheme(night ? "paper" : "night")}
      className={`rounded-input ${FOCUS_RING}`}
    >
      <Chip variant="outline" className="gap-sm">
        <span
          aria-hidden="true"
          className={`size-[8px] rounded-full ${night ? "bg-sky" : "border-2 border-ink-38"}`}
        />
        <span>{scene}</span>
      </Chip>
    </button>
  );
}
