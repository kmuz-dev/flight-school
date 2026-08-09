import type { ReactNode } from "react";

/**
 * Square-cornered mono placard (DESIGN.md: "stamps and placards are
 * square-cornered"). Used for the license tier, camera presets and the stage
 * status readouts.
 */
export type ChipVariant = "outline" | "ink" | "red" | "quiet";

const VARIANTS: Record<ChipVariant, string> = {
  outline: "border border-ink-38 text-ink",
  ink: "bg-ink text-paper",
  red: "bg-red text-white",
  quiet: "border border-ink-12 text-ink-60",
};

export function Chip({
  variant = "outline",
  className = "",
  children,
}: {
  variant?: ChipVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-xs px-sm py-xs font-mono text-micro font-semibold tracking-[0.12em] uppercase ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
