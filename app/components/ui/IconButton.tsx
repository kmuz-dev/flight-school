import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FOCUS_RING } from "./focus";

/**
 * Icon-only control. `label` is mandatory and becomes the accessible name -
 * there is no way to render one of these without a name.
 */
export function IconButton({
  label,
  active = false,
  className = "",
  children,
  ...rest
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex size-10 items-center justify-center rounded-input border transition-colors duration-150 ease-move disabled:opacity-38 ${
        active ? "border-red bg-red text-white" : "border-ink-38 text-ink hover:bg-ink-12"
      } ${FOCUS_RING} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
