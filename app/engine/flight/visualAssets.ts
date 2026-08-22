import type { StaticImageData } from "next/image";
import hallway1950s from "@/assets/flight/environments/hallway-1950s-hd.webp";
import hallway1980s from "@/assets/flight/environments/hallway-1980s-hd.webp";
import hallwayToday from "@/assets/flight/environments/hallway-today-hd.webp";
import wall1950s from "@/assets/flight/textures/surfaces/1950s-wall.webp";
import floor1950s from "@/assets/flight/textures/surfaces/1950s-floor.webp";
import trim1950s from "@/assets/flight/textures/surfaces/1950s-trim.webp";
import wall1980s from "@/assets/flight/textures/surfaces/1980s-wall.webp";
import floor1980s from "@/assets/flight/textures/surfaces/1980s-floor.webp";
import trim1980s from "@/assets/flight/textures/surfaces/1980s-trim.webp";
import wallToday from "@/assets/flight/textures/surfaces/today-wall.webp";
import floorToday from "@/assets/flight/textures/surfaces/today-floor.webp";
import trimToday from "@/assets/flight/textures/surfaces/today-trim.webp";
import trophyCase from "@/assets/flight/props/trophy-case.webp";
import lockersTeal from "@/assets/flight/props/lockers-teal.webp";
import lockersRed from "@/assets/flight/props/lockers-red.webp";
import avCart from "@/assets/flight/props/av-cart.webp";
import backpack from "@/assets/flight/props/backpack.webp";
import paperDecorations from "@/assets/flight/props/paper-decorations.webp";
import digitalSign from "@/assets/flight/props/digital-sign.webp";
import classroomDoor from "@/assets/flight/props/classroom-door.webp";
import bulletinBoard from "@/assets/flight/props/bulletin-board.webp";
import cleaningCart from "@/assets/flight/props/cleaning-cart.webp";
import boy50sIdle from "@/assets/flight/characters/50s-student-boy/idle.webp";
import boy50sNotice from "@/assets/flight/characters/50s-student-boy/notice.webp";
import boy50sDodge from "@/assets/flight/characters/50s-student-boy/dodge.webp";
import girl50sIdle from "@/assets/flight/characters/50s-student-girl/idle.webp";
import girl50sNotice from "@/assets/flight/characters/50s-student-girl/notice.webp";
import girl50sDodge from "@/assets/flight/characters/50s-student-girl/dodge.webp";
import teacher50sIdle from "@/assets/flight/characters/50s-teacher/idle.webp";
import teacher50sNotice from "@/assets/flight/characters/50s-teacher/notice.webp";
import teacher50sDodge from "@/assets/flight/characters/50s-teacher/dodge.webp";
import boy80sIdle from "@/assets/flight/characters/80s-student-boy/idle.webp";
import boy80sNotice from "@/assets/flight/characters/80s-student-boy/notice.webp";
import boy80sDodge from "@/assets/flight/characters/80s-student-boy/dodge.webp";
import girl80sIdle from "@/assets/flight/characters/80s-student-girl/idle.webp";
import girl80sNotice from "@/assets/flight/characters/80s-student-girl/notice.webp";
import girl80sDodge from "@/assets/flight/characters/80s-student-girl/dodge.webp";
import coach80sIdle from "@/assets/flight/characters/80s-coach/idle.webp";
import coach80sNotice from "@/assets/flight/characters/80s-coach/notice.webp";
import coach80sDodge from "@/assets/flight/characters/80s-coach/dodge.webp";
import boyTodayIdle from "@/assets/flight/characters/today-student-boy/idle.webp";
import boyTodayNotice from "@/assets/flight/characters/today-student-boy/notice.webp";
import boyTodayDodge from "@/assets/flight/characters/today-student-boy/dodge.webp";
import girlTodayIdle from "@/assets/flight/characters/today-student-girl/idle.webp";
import girlTodayNotice from "@/assets/flight/characters/today-student-girl/notice.webp";
import girlTodayDodge from "@/assets/flight/characters/today-student-girl/dodge.webp";
import staffTodayIdle from "@/assets/flight/characters/today-staff/idle.webp";
import staffTodayNotice from "@/assets/flight/characters/today-staff/notice.webp";
import staffTodayDodge from "@/assets/flight/characters/today-staff/dodge.webp";
import type { FlightEra, Vec3 } from "./types";

export type PersonArtState = "idle" | "notice" | "dodge";

export type PersonArt = Readonly<Record<PersonArtState, string>>;

const personArt = (idle: StaticImageData, notice: StaticImageData, dodge: StaticImageData): PersonArt => ({
  idle: idle.src,
  notice: notice.src,
  dodge: dodge.src,
});

export type CourseBackdropArt = Readonly<{ src: string; aspectRatio: number }>;

export const COURSE_BACKDROP_ART: Readonly<Record<FlightEra, CourseBackdropArt>> = {
  "1950s": { src: hallway1950s.src, aspectRatio: hallway1950s.width / hallway1950s.height },
  "1980s": { src: hallway1980s.src, aspectRatio: hallway1980s.width / hallway1980s.height },
  today: { src: hallwayToday.src, aspectRatio: hallwayToday.width / hallwayToday.height },
};

export type CourseSurfaceArt = Readonly<{
  wall: string;
  floor: string;
  trim: string;
}>;

export const COURSE_SURFACE_ART: Readonly<Record<FlightEra, CourseSurfaceArt>> = {
  "1950s": { wall: wall1950s.src, floor: floor1950s.src, trim: trim1950s.src },
  "1980s": { wall: wall1980s.src, floor: floor1980s.src, trim: trim1980s.src },
  today: { wall: wallToday.src, floor: floorToday.src, trim: trimToday.src },
};

export const PERSON_ART_BY_HAZARD: Readonly<Record<string, PersonArt>> = {
  "50s-student-a": personArt(boy50sIdle, boy50sNotice, boy50sDodge),
  "50s-staff": personArt(teacher50sIdle, teacher50sNotice, teacher50sDodge),
  "50s-student-b": personArt(girl50sIdle, girl50sNotice, girl50sDodge),
  "80s-student-a": personArt(boy80sIdle, boy80sNotice, boy80sDodge),
  "80s-staff": personArt(coach80sIdle, coach80sNotice, coach80sDodge),
  "80s-student-b": personArt(girl80sIdle, girl80sNotice, girl80sDodge),
  "today-student-a": personArt(boyTodayIdle, boyTodayNotice, boyTodayDodge),
  "today-staff": personArt(staffTodayIdle, staffTodayNotice, staffTodayDodge),
  "today-student-b": personArt(girlTodayIdle, girlTodayNotice, girlTodayDodge),
};

export const CLUTTER_ART_BY_HAZARD: Readonly<Record<string, string>> = {
  "50s-trophy": trophyCase.src,
  "80s-backpack": backpack.src,
  "80s-cart": avCart.src,
  "today-decoration": paperDecorations.src,
  "today-cart": cleaningCart.src,
};

export type CorridorDressing = {
  readonly id: string;
  readonly era: FlightEra;
  readonly image: string;
  readonly position: Vec3;
  readonly width: number;
  readonly height: number;
  readonly rotationY: number;
};

/**
 * Non-colliding visual dressing.
 *
 * Hazards stay in `course.ts`; this list may change freely without moving a
 * single collision volume or changing autopilot safety.
 */
export const CORRIDOR_DRESSING: readonly CorridorDressing[] = [
  { id: "50s-case-left", era: "1950s", image: trophyCase.src, position: { x: -13.35, y: 3.1, z: -72 }, width: 3.8, height: 6.2, rotationY: Math.PI / 2 },
  { id: "50s-board-right", era: "1950s", image: bulletinBoard.src, position: { x: 13.42, y: 6.4, z: -168 }, width: 5.8, height: 3.5, rotationY: -Math.PI / 2 },
  { id: "50s-door-left", era: "1950s", image: classroomDoor.src, position: { x: -13.38, y: 4.1, z: -322 }, width: 4.1, height: 7.4, rotationY: Math.PI / 2 },
  { id: "80s-lockers-left", era: "1980s", image: lockersTeal.src, position: { x: -13.38, y: 3.6, z: -468 }, width: 4.3, height: 6.8, rotationY: Math.PI / 2 },
  { id: "80s-lockers-right", era: "1980s", image: lockersRed.src, position: { x: 13.38, y: 3.6, z: -574 }, width: 4.3, height: 6.8, rotationY: -Math.PI / 2 },
  { id: "80s-board-left", era: "1980s", image: bulletinBoard.src, position: { x: -13.42, y: 6.5, z: -735 }, width: 5.8, height: 3.5, rotationY: Math.PI / 2 },
  { id: "today-door-right", era: "today", image: classroomDoor.src, position: { x: 13.38, y: 4.1, z: -900 }, width: 4.1, height: 7.4, rotationY: -Math.PI / 2 },
  { id: "today-sign-left", era: "today", image: digitalSign.src, position: { x: -13.42, y: 6.6, z: -1010 }, width: 3.2, height: 5.2, rotationY: Math.PI / 2 },
  { id: "today-board-right", era: "today", image: bulletinBoard.src, position: { x: 13.42, y: 6.4, z: -1160 }, width: 5.8, height: 3.5, rotationY: -Math.PI / 2 },
] as const;
