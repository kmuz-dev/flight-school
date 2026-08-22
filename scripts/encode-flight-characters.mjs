import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const characterRoot = path.join(root, "app/assets/flight/characters");
const archetypes = [
  "50s-student-boy",
  "50s-student-girl",
  "50s-teacher",
  "80s-student-boy",
  "80s-student-girl",
  "80s-coach",
  "today-student-boy",
  "today-student-girl",
  "today-staff",
];

await Promise.all(
  archetypes.flatMap((archetype) => ["idle", "notice", "dodge"].map(async (state) => {
    const source = path.join(characterRoot, archetype, `${state}.png`);
    const output = path.join(characterRoot, archetype, `${state}.webp`);
    await sharp(source)
      .webp({ quality: 96, alphaQuality: 100, smartSubsample: true, effort: 6 })
      .toFile(output);
  })),
);
