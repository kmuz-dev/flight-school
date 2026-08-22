import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import loopingGlider from "@/assets/brand/flight-school-looping-glider.webp";

export type BrandMarkProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  readonly label?: string;
  readonly priority?: boolean;
  readonly sizes?: string;
};

/**
 * The one Flight School mark.
 *
 * Most placements sit beside localized brand copy and are decorative.
 * `label` exists for the rare standalone use, where the mark itself must carry
 * the accessible name rather than making a screen reader announce an empty
 * image or duplicate the adjacent wordmark.
 */
export function BrandMark({
  className = "",
  label,
  priority = false,
  sizes = "48px",
  ...props
}: BrandMarkProps) {
  return (
    <span
      {...props}
      className={`brand-mark ${className}`}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      <Image
        src={loopingGlider}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
      />
    </span>
  );
}

