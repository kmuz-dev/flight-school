"use client";

/**
 * The dominant Preflight art panel: the finished aircraft, photographed.
 *
 * There is deliberately nothing to operate here. Preflight is a decision
 * screen - see the aircraft, confirm the paper, start folding - and an
 * inspection control sitting on the hero offered a second thing to do at the
 * exact moment the screen exists to make one choice. The finished aircraft is
 * the one the cadet is about to build with their hands, so a mouse-orbited
 * model of it is a detour from the product, not a feature of it. The fold
 * engine remains authoritative for Tutorial geometry, and the Hangar bay keeps
 * a live stage for browsing the catalogue.
 *
 * Two layers of fallback, in the order a reader would want them: the
 * production artwork, and beneath it the engine's own build-time SVG of the
 * final step, for the case where the image itself will not load.
 */
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { EngineSvg } from "@/components/ui/EngineSvg";
import { format } from "@/components/ui/format";

export type AircraftHeroProps = {
  /** Build-time engine render of the final step; the artwork's fallback. */
  svg: string;
  artwork: StaticImageData;
  artworkAlt: string;
  objectPosition: string;
  /** Optical correction inside this art well; see `AircraftPresentation`. */
  artworkScale: number;
  planeName: string;
  label: string;
};

export function AircraftHero({
  svg,
  artwork,
  artworkAlt,
  objectPosition,
  artworkScale,
  planeName,
  label,
}: AircraftHeroProps) {
  const [artFailed, setArtFailed] = useState(false);

  return (
    <section
      aria-label={label}
      className="relative isolate min-h-[380px] flex-1 overflow-hidden rounded-card bg-raised shadow-[0_18px_55px_rgb(26_43_74_/_0.13)] lg:min-h-[560px]"
      style={{ background: "linear-gradient(170deg, var(--color-stage-sky), var(--color-stage-ground))" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-ink-12) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div data-testid="preflight-artwork" className="absolute inset-0">
        {artFailed ? (
          <EngineSvg svg={svg} className="absolute inset-lg flex items-center justify-center" />
        ) : (
          <Image
            src={artwork}
            alt={format(artworkAlt, { name: planeName })}
            fill
            priority
            sizes="(max-width: 959px) 100vw, 65vw"
            onError={() => setArtFailed(true)}
            className="pointer-events-none max-w-full object-contain p-lg"
            style={{ objectPosition, scale: artworkScale }}
          />
        )}
      </div>
    </section>
  );
}
