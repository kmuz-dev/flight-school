import type { PlaneId } from "./types";
import type { DisplayView } from "@/engine/core/types";

/**
 * Canonical finished-aircraft camera direction, shared by presentation assets,
 * live inspection, SVG fallback, and the reproducible art audit script.
 */
export const AIRCRAFT_DISPLAY_VIEWS = {
  dart: { azimuthDeg: 145, elevationDeg: 25 },
  bulldog: { azimuthDeg: 144, elevationDeg: 26 },
  harrier: { azimuthDeg: 150, elevationDeg: 31 },
  "sea-glider": { azimuthDeg: 145, elevationDeg: 30 },
  hammer: { azimuthDeg: 144, elevationDeg: 28 },
  "square-cruiser": { azimuthDeg: 143, elevationDeg: 33 },
} as const satisfies Readonly<Record<PlaneId, DisplayView>>;
