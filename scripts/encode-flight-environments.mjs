import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const environmentRoot = path.join(root, "app/assets/flight/environments");

await Promise.all(["1950s", "1980s", "today"].map(async (era) => {
  const source = path.join(environmentRoot, `hallway-${era}-hd.png`);
  const output = path.join(environmentRoot, `hallway-${era}-hd.webp`);
  await sharp(source)
    .webp({ quality: 96, smartSubsample: true, effort: 6 })
    .toFile(output);
}));
