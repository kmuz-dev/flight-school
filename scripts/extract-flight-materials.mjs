import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "app/assets/flight/textures");
const outputDirectory = path.join(sourceDirectory, "surfaces");

const surfaces = [
  { era: "1950s", name: "wall", column: 0, row: 0 },
  { era: "1950s", name: "floor", column: 0, row: 1 },
  { era: "1950s", name: "trim", column: 1, row: 2 },
  { era: "1980s", name: "wall", column: 0, row: 0 },
  { era: "1980s", name: "floor", column: 0, row: 1 },
  { era: "1980s", name: "trim", column: 1, row: 0 },
  { era: "today", name: "wall", column: 0, row: 0 },
  { era: "today", name: "floor", column: 1, row: 1 },
  { era: "today", name: "trim", column: 2, row: 0 },
];

await mkdir(outputDirectory, { recursive: true });

await Promise.all(surfaces.map(async ({ era, name, column, row }) => {
  const source = path.join(sourceDirectory, `materials-${era}.webp`);
  const { width, height } = await sharp(source).metadata();
  if (!width || !height) throw new Error(`Could not read ${source}`);
  const cellWidth = Math.floor(width / 3);
  const cellHeight = Math.floor(height / 3);
  const inset = Math.max(10, Math.floor(Math.min(cellWidth, cellHeight) / 52));
  const output = path.join(outputDirectory, `${era}-${name}.webp`);
  await sharp(source)
    .extract({
      left: column * cellWidth + inset,
      top: row * cellHeight + inset,
      width: cellWidth - inset * 2,
      height: cellHeight - inset * 2,
    })
    .resize(1024, 1024, { kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 92, effort: 6 })
    .toFile(output);
}));
