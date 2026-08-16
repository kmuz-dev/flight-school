/**
 * Beauty-art direction for finished aircraft.
 *
 * This deliberately lives beside, rather than inside, `PlaneStructure`.
 * Generated artwork and presentation framing may evolve without changing the
 * fold sequence, while `displayView` is also consumed by canonical SVG and 3D
 * inspection so all three representations begin at the same angle.
 *
 * One asset per aircraft, not two. The catalogue used to ship a 640x512 card
 * beside the 1280x1024 hero and a test that asserted they were the same picture
 * at two sizes - which is what `sizes` on a responsive `<img>` already
 * negotiates, so the second file bought nothing and cost a way for the pair to
 * disagree. The photographic Hangar retired the card that justified it: the
 * aircraft is now the same object at the same fidelity on every surface it
 * appears - Hangar, Preflight, Wings earned - and only its scale in the frame
 * differs.
 */
import type { StaticImageData } from "next/image";
import dart from "@/assets/aircraft/dart-hero.webp";
import bulldog from "@/assets/aircraft/bulldog-hero.webp";
import harrier from "@/assets/aircraft/harrier-hero.webp";
import seaGlider from "@/assets/aircraft/sea-glider-hero.webp";
import hammer from "@/assets/aircraft/hammer-hero.webp";
import squareCruiser from "@/assets/aircraft/square-cruiser-hero.webp";
import type { DisplayView } from "@/engine/core/types";
import type { PlaneId } from "./types";
import { AIRCRAFT_DISPLAY_VIEWS } from "./presentationViews";

export type AircraftPresentation = {
  /** The one beauty render, shared by every surface that shows the aircraft. */
  readonly artwork: StaticImageData;
  /** CSS `object-position`, kept with the crop rather than scattered in UI. */
  readonly objectPosition: string;
  /**
   * Optical correction in the Hangar bay, where the aircraft floats free in a
   * photographed room and its apparent size is the only thing setting the scale
   * of that room. Larger spreads than the hero's, because there is no frame
   * edge nearby to measure against.
   */
  readonly hangarScale: number;
  /** Optical correction inside the Preflight and Wings-earned art well. */
  readonly heroScale: number;
  readonly displayView: DisplayView;
};

/**
 * One exhaustive visual manifest. `satisfies` catches a missing aircraft at
 * compile time without widening the keys or the per-plane literal values.
 */
export const AIRCRAFT_PRESENTATIONS = {
  dart: {
    artwork: dart,
    objectPosition: "50% 50%",
    hangarScale: 1,
    heroScale: 1,
    displayView: AIRCRAFT_DISPLAY_VIEWS.dart,
  },
  bulldog: {
    artwork: bulldog,
    objectPosition: "50% 51%",
    hangarScale: 1.04,
    heroScale: 1.04,
    displayView: AIRCRAFT_DISPLAY_VIEWS.bulldog,
  },
  harrier: {
    artwork: harrier,
    objectPosition: "50% 52%",
    hangarScale: 0.96,
    heroScale: 0.96,
    displayView: AIRCRAFT_DISPLAY_VIEWS.harrier,
  },
  "sea-glider": {
    artwork: seaGlider,
    objectPosition: "50% 51%",
    hangarScale: 0.98,
    heroScale: 0.98,
    displayView: AIRCRAFT_DISPLAY_VIEWS["sea-glider"],
  },
  hammer: {
    artwork: hammer,
    objectPosition: "50% 50%",
    hangarScale: 1.02,
    heroScale: 1.02,
    displayView: AIRCRAFT_DISPLAY_VIEWS.hammer,
  },
  "square-cruiser": {
    artwork: squareCruiser,
    objectPosition: "50% 52%",
    hangarScale: 0.95,
    heroScale: 0.95,
    displayView: AIRCRAFT_DISPLAY_VIEWS["square-cruiser"],
  },
} as const satisfies Readonly<Record<PlaneId, AircraftPresentation>>;

export function getAircraftPresentation(id: PlaneId): AircraftPresentation {
  return AIRCRAFT_PRESENTATIONS[id];
}
