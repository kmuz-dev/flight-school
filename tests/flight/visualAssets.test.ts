import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { HALLWAY_HAZARDS, HALLWAY_SECTIONS } from "@/engine/flight/course";
import {
  CLUTTER_ART_BY_HAZARD,
  CORRIDOR_DRESSING,
  PERSON_ART_BY_HAZARD,
} from "@/engine/flight/visualAssets";

const ASSET_ROOT = path.join(process.cwd(), "app/assets/flight");
const CHARACTER_IDS = [
  "50s-student-boy",
  "50s-student-girl",
  "50s-teacher",
  "80s-student-boy",
  "80s-student-girl",
  "80s-coach",
  "today-student-boy",
  "today-student-girl",
  "today-staff",
] as const;
const STATES = ["idle", "notice", "dodge"] as const;

describe("Cinematic Schoolbook production assets", () => {
  it("maps every authored hazard to visual art without changing collision data", () => {
    const people = HALLWAY_HAZARDS.filter((hazard) => hazard.kind === "person").map((hazard) => hazard.id).sort();
    const clutter = HALLWAY_HAZARDS.filter((hazard) => hazard.kind === "clutter").map((hazard) => hazard.id).sort();
    expect(Object.keys(PERSON_ART_BY_HAZARD).sort()).toEqual(people);
    expect(Object.keys(CLUTTER_ART_BY_HAZARD).sort()).toEqual(clutter);
  });

  it("ships all twenty-seven reaction cutouts with real alpha", async () => {
    for (const character of CHARACTER_IDS) {
      for (const state of STATES) {
        const file = path.join(ASSET_ROOT, "characters", character, `${state}.webp`);
        expect(fs.existsSync(file), file).toBe(true);
        const metadata = await sharp(file).metadata();
        expect(metadata.hasAlpha, file).toBe(true);
        expect(metadata.width, file).toBeGreaterThanOrEqual(1000);
        expect(metadata.height, file).toBeGreaterThanOrEqual(1500);
      }
    }
  });

  it("keeps decorative dressing inside its authored era section", () => {
    expect(new Set(CORRIDOR_DRESSING.map((asset) => asset.id)).size).toBe(CORRIDOR_DRESSING.length);
    for (const asset of CORRIDOR_DRESSING) {
      const section = HALLWAY_SECTIONS.find((candidate) => candidate.id === asset.era)!;
      expect(asset.position.z, asset.id).toBeLessThanOrEqual(section.startZ);
      expect(asset.position.z, asset.id).toBeGreaterThan(section.endZ);
    }
  });

  it("uses the high-definition era backdrops and extracted surface textures", async () => {
    const manifest = fs.readFileSync(path.join(process.cwd(), "app/engine/flight/visualAssets.ts"), "utf8");
    for (const era of ["1950s", "1980s", "today"] as const) {
      expect(manifest).toContain(`hallway-${era}-hd.webp`);
      const backdrop = path.join(ASSET_ROOT, "environments", `hallway-${era}-hd.webp`);
      expect(fs.existsSync(backdrop), backdrop).toBe(true);
      const backdropMetadata = await sharp(backdrop).metadata();
      expect(backdropMetadata.width, backdrop).toBeGreaterThanOrEqual(1500);
      expect(backdropMetadata.height, backdrop).toBeGreaterThanOrEqual(940);
      for (const surface of ["wall", "floor", "trim"] as const) {
        expect(manifest).toContain(`surfaces/${era}-${surface}.webp`);
        const file = path.join(ASSET_ROOT, "textures", "surfaces", `${era}-${surface}.webp`);
        expect(fs.existsSync(file), file).toBe(true);
        const metadata = await sharp(file).metadata();
        expect(metadata.width, file).toBe(1024);
        expect(metadata.height, file).toBe(1024);
      }
    }
  });
});
