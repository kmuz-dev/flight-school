/**
 * The little crease-pattern marks beside fold terms: valley is a dipping
 * crease, mountain a rising one, plain a reference line.
 */
import type { CreaseIconVariant } from "@/components/tutorial/types";

export function CreaseIcon({ variant }: { variant: CreaseIconVariant }) {
  const color =
    variant === "valley"
      ? "var(--color-red)"
      : variant === "mountain"
        ? "var(--color-sky)"
        : "var(--color-ink-38)";
  const dash = variant === "mountain" ? "3 2" : undefined;
  return (
    <svg width="18" height="24" viewBox="0 0 18 24" aria-hidden="true" className="shrink-0">
      {[0, 5, 10, 15].map((x) => (
        <line
          key={x}
          x1={x + 1}
          y1={2}
          x2={x + 1}
          y2={22}
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={dash}
        />
      ))}
    </svg>
  );
}
