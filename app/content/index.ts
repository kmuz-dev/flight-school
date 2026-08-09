import type { PlaneId, PlaneStructure } from "./types";
import { dart } from "./planes/dart";

export const PLANES: Readonly<Record<string, PlaneStructure>> = { dart };

export const PLANE_IDS = Object.keys(PLANES) as PlaneId[];

export function getPlane(id: string): PlaneStructure | undefined {
  return PLANES[id];
}
