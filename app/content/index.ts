import type { PlaneId, PlaneStructure } from "./types";
import { dart } from "./planes/dart";
import { bulldog } from "./planes/bulldog";
import { harrier } from "./planes/harrier";
import { seaGlider } from "./planes/seaGlider";
import { hammer } from "./planes/hammer";
import { squareCruiser } from "./planes/squareCruiser";

/** Catalogue order is the difficulty ladder from PRD section 5. */
export const PLANES: Readonly<Record<string, PlaneStructure>> = {
  dart,
  bulldog,
  harrier,
  "sea-glider": seaGlider,
  hammer,
  "square-cruiser": squareCruiser,
};

export const PLANE_IDS = Object.keys(PLANES) as PlaneId[];

export function getPlane(id: string): PlaneStructure | undefined {
  return PLANES[id];
}
