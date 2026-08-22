import type { PlaneStructure } from "@/content/types";
import { computeFoldState } from "@/engine/core/state";
import { multiply, poseForFacet, transformPoint } from "@/engine/core/pose";
import { restTransform } from "@/engine/core/rest";
import { FLIGHT_TUNING } from "./config";
import { clamp } from "./math";
import type { FlightProfile } from "./types";

function polygonArea(points: readonly (readonly [number, number])[]): number {
  let twice = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]!;
    const next = points[(index + 1) % points.length]!;
    twice += current[0] * next[1] - next[0] * current[1];
  }
  return Math.abs(twice) / 2;
}

export function deriveFlightProfile(structure: PlaneStructure): FlightProfile {
  const state = computeFoldState(structure, structure.steps.length - 1);
  const rest = restTransform(state);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let projectedAreaMm2 = 0;

  for (const facet of state.facets) {
    const pose = multiply(rest, poseForFacet(facet));
    const projected: [number, number][] = [];
    for (const point of facet.polygon) {
      const world = transformPoint(pose, point);
      minX = Math.min(minX, world[0]);
      maxX = Math.max(maxX, world[0]);
      minY = Math.min(minY, world[1]);
      maxY = Math.max(maxY, world[1]);
      minZ = Math.min(minZ, world[2]);
      maxZ = Math.max(maxZ, world[2]);
      projected.push([world[0], world[1]]);
    }
    projectedAreaMm2 += polygonArea(projected);
  }

  const spanMm = Math.max(1, maxX - minX);
  const lengthMm = Math.max(1, maxY - minY);
  const heightMm = Math.max(0, maxZ - minZ);
  const slenderness = lengthMm / spanMm;
  const areaRatio = projectedAreaMm2 / Math.max(1, spanMm * lengthMm);
  const dihedralRatio = heightMm / spanMm;
  // Long, compact planforms retain speed. The area term is deliberately the
  // actual projected facet area rather than a plane-id coefficient: a tightly
  // folded Hammer and a broad Harrier land on opposite sides naturally.
  const speedIndex = lengthMm - projectedAreaMm2 * 0.0075;
  const speedScale = clamp(1 + (speedIndex + 20) * 0.0008, 0.9, 1.1);
  const glideRetention = clamp(0.94 + ((spanMm - 70) / 100) * 0.14, 0.94, 1.08);
  const stability = clamp(0.94 + areaRatio * 0.04 + dihedralRatio * 0.12, 0.94, 1.1);
  const turnResponse = clamp(1.07 - (slenderness - 1) * 0.06, 0.9, 1.1);

  return {
    planeId: structure.id,
    spanMm,
    lengthMm,
    heightMm,
    projectedAreaMm2,
    cruiseSpeed: FLIGHT_TUNING.baseCruiseSpeed * speedScale,
    maxSpeed: FLIGHT_TUNING.baseMaxSpeed * speedScale,
    turnResponse,
    pitchResponse: clamp(1.04 - dihedralRatio * 0.18, 0.94, 1.06),
    stability,
    glideRetention,
    gustResponse: clamp(0.92 + (spanMm / 210) * 0.12, 0.94, 1.08),
  };
}
