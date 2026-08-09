import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FOCUS_RING } from "./focus";

/**
 * The academy's action button: airmail red for the one primary action on a
 * screen, ink outline for everything secondary. 4px radius per DESIGN.md
 * (inputs and chips), never a pill.
 */
export type StampButtonVariant = "primary" | "secondary";

const VARIANTS: Record<StampButtonVariant, string> = {
  primary: "bg-red text-white hover:brightness-95",
  secondary: "border-2 border-ink text-ink hover:bg-ink-12",
};

export function StampButton({
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  variant?: StampButtonVariant;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-sm rounded-input px-md py-md font-body text-base font-semibold transition-[filter,background-color] duration-150 ease-move disabled:cursor-not-allowed disabled:opacity-38 ${VARIANTS[variant]} ${FOCUS_RING} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
