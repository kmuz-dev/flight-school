import { FLIGHT_TUNING, PERSON_VISUAL_TUNING } from "./config";
import { clamp, distanceSquared } from "./math";
import type { FlightEra, Vec3 } from "./types";

export type HallwaySection = {
  readonly id: FlightEra;
  readonly startZ: number;
  readonly endZ: number;
  readonly wall: number;
  readonly floor: number;
  readonly accent: number;
  readonly light: number;
};

export type HallwayHazard = {
  readonly id: string;
  readonly kind: "person" | "clutter";
  readonly era: FlightEra;
  readonly position: Vec3;
  readonly radius: number;
  readonly nearRadius: number;
  readonly height: number;
  readonly label: "student" | "staff" | "locker" | "cart" | "backpack" | "decoration";
};

export type AirGust = {
  readonly id: string;
  readonly era: FlightEra;
  readonly position: Vec3;
  readonly radius: number;
};

export const HALLWAY_SECTIONS: readonly HallwaySection[] = [
  { id: "1950s", startZ: 40, endZ: -400, wall: 0xe7d6b5, floor: 0x7d3f2f, accent: 0x17324d, light: 0xffe5b7 },
  { id: "1980s", startZ: -400, endZ: -830, wall: 0xe6dfbd, floor: 0x286f78, accent: 0xd14b35, light: 0xf7f4df },
  { id: "today", startZ: -830, endZ: FLIGHT_TUNING.finishZ - 50, wall: 0xe8e4dc, floor: 0x66757b, accent: 0x9f2d2d, light: 0xf4f8ff },
] as const;

export const HALLWAY_HAZARDS: readonly HallwayHazard[] = [
  { id: "50s-student-a", kind: "person", era: "1950s", position: { x: -7, y: 2.8, z: -120 }, radius: 1.4, nearRadius: 4.8, height: 5.8, label: "student" },
  { id: "50s-trophy", kind: "clutter", era: "1950s", position: { x: 9.5, y: 1.6, z: -205 }, radius: 1.5, nearRadius: 3.2, height: 3.4, label: "locker" },
  { id: "50s-staff", kind: "person", era: "1950s", position: { x: 5.5, y: 3, z: -285 }, radius: 1.5, nearRadius: 5.2, height: 6.1, label: "staff" },
  { id: "50s-student-b", kind: "person", era: "1950s", position: { x: -3.5, y: 2.8, z: -355 }, radius: 1.35, nearRadius: 4.6, height: 5.7, label: "student" },
  { id: "80s-backpack", kind: "clutter", era: "1980s", position: { x: -6.5, y: -0.2, z: -455 }, radius: 1.25, nearRadius: 2.8, height: 1.5, label: "backpack" },
  { id: "80s-student-a", kind: "person", era: "1980s", position: { x: 7.5, y: 2.8, z: -525 }, radius: 1.45, nearRadius: 4.8, height: 5.8, label: "student" },
  { id: "80s-cart", kind: "clutter", era: "1980s", position: { x: 1.5, y: 1.1, z: -610 }, radius: 2.1, nearRadius: 3.5, height: 2.6, label: "cart" },
  { id: "80s-staff", kind: "person", era: "1980s", position: { x: -8, y: 3, z: -690 }, radius: 1.5, nearRadius: 5, height: 6.1, label: "staff" },
  { id: "80s-student-b", kind: "person", era: "1980s", position: { x: 5, y: 2.8, z: -770 }, radius: 1.4, nearRadius: 4.7, height: 5.7, label: "student" },
  { id: "today-decoration", kind: "clutter", era: "today", position: { x: 0, y: 10.8, z: -880 }, radius: 1.8, nearRadius: 3.4, height: 1.2, label: "decoration" },
  { id: "today-student-a", kind: "person", era: "today", position: { x: -7.5, y: 2.8, z: -955 }, radius: 1.4, nearRadius: 4.9, height: 5.8, label: "student" },
  { id: "today-cart", kind: "clutter", era: "today", position: { x: 6, y: 1.2, z: -1030 }, radius: 2, nearRadius: 3.5, height: 2.8, label: "cart" },
  { id: "today-staff", kind: "person", era: "today", position: { x: 2.5, y: 3, z: -1110 }, radius: 1.5, nearRadius: 5.2, height: 6.1, label: "staff" },
  { id: "today-student-b", kind: "person", era: "today", position: { x: -5.5, y: 2.8, z: -1185 }, radius: 1.4, nearRadius: 4.7, height: 5.8, label: "student" },
] as const;

export const AIR_GUSTS: readonly AirGust[] = [
  { id: "50s-gust", era: "1950s", position: { x: 4.5, y: 5.3, z: -235 }, radius: 3.2 },
  { id: "80s-gust-a", era: "1980s", position: { x: -5, y: 5.8, z: -490 }, radius: 3 },
  { id: "80s-gust-b", era: "1980s", position: { x: 7, y: 6.2, z: -735 }, radius: 3 },
  { id: "today-gust-a", era: "today", position: { x: -6, y: 6.3, z: -925 }, radius: 2.8 },
  { id: "today-gust-b", era: "today", position: { x: 6.5, y: 6.6, z: -1140 }, radius: 2.8 },
] as const;

export function sectionAt(z: number): HallwaySection {
  return HALLWAY_SECTIONS.find((section) => z <= section.startZ && z > section.endZ) ?? HALLWAY_SECTIONS.at(-1)!;
}

export function courseProgress(z: number): number {
  return clamp((18 - z) / (18 - FLIGHT_TUNING.finishZ), 0, 1);
}

export function surfaceCollision(position: Vec3, radius = 0.75): "surface" | null {
  if (Math.abs(position.x) + radius >= FLIGHT_TUNING.corridorHalfWidth) return "surface";
  if (position.y - radius <= FLIGHT_TUNING.floorY) return "surface";
  if (position.y + radius >= FLIGHT_TUNING.ceilingY) return "surface";
  return null;
}

export function collidingHazard(position: Vec3, radius = 0.72): HallwayHazard | null {
  for (const hazard of HALLWAY_HAZARDS) {
    const verticalCenter = hazard.position.y;
    const verticalRadius = hazard.height / 2;
    if (Math.abs(position.y - verticalCenter) > verticalRadius + radius) continue;
    const dx = position.x - hazard.position.x;
    const dz = position.z - hazard.position.z;
    if (dx * dx + dz * dz <= (hazard.radius + radius) ** 2) return hazard;
  }
  return null;
}

export function nearbyPerson(position: Vec3, ignored: ReadonlySet<string>): HallwayHazard | null {
  for (const hazard of HALLWAY_HAZARDS) {
    if (hazard.kind !== "person" || ignored.has(hazard.id)) continue;
    if (Math.abs(position.z - hazard.position.z) > 2.2) continue;
    if (distanceSquared(position, hazard.position) <= hazard.nearRadius ** 2) return hazard;
  }
  return null;
}

export function personConcern(position: Vec3, speed: number, hazard: HallwayHazard): number {
  if (hazard.kind !== "person") return 0;
  const distanceAhead = position.z - hazard.position.z;
  const leadLimit = Math.min(
    PERSON_VISUAL_TUNING.noticeDistance,
    Math.max(42, Math.max(0, speed) * 3.2),
  );
  if (distanceAhead <= PERSON_VISUAL_TUNING.noticeMinimumLead || distanceAhead >= leadLimit) return 0;

  const lateralDistance = Math.abs(position.x - hazard.position.x);
  if (lateralDistance >= PERSON_VISUAL_TUNING.noticeLateralRadius) return 0;

  const approach = 1 - (distanceAhead - PERSON_VISUAL_TUNING.noticeMinimumLead)
    / (leadLimit - PERSON_VISUAL_TUNING.noticeMinimumLead);
  const alignment = 1 - lateralDistance / PERSON_VISUAL_TUNING.noticeLateralRadius;
  return clamp(approach * 0.7 + alignment * 0.3, 0, 1);
}

export function enteredGust(position: Vec3, used: ReadonlySet<string>): AirGust | null {
  for (const gust of AIR_GUSTS) {
    if (!used.has(gust.id) && distanceSquared(position, gust.position) <= gust.radius ** 2) return gust;
  }
  return null;
}
