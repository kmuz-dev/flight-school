import sharp from "sharp";

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  console.error("Usage: node scripts/strip-sprite-background.mjs <input.png> <output.png>");
  process.exit(1);
}

const source = sharp(input).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const pixelCount = width * height;
const outside = new Uint8Array(pixelCount);
const queue = new Uint32Array(pixelCount);
let head = 0;
let tail = 0;

const isRenderedTransparency = (index) => {
  const offset = index * channels;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const alpha = data[offset + 3];
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return alpha === 0 || (Math.min(r, g, b) >= 224 && spread <= 14);
};

const enqueue = (index) => {
  if (outside[index] || !isRenderedTransparency(index)) return;
  outside[index] = 1;
  queue[tail++] = index;
};

for (let x = 0; x < width; x += 1) {
  enqueue(x);
  enqueue((height - 1) * width + x);
}
for (let y = 1; y < height - 1; y += 1) {
  enqueue(y * width);
  enqueue(y * width + width - 1);
}

while (head < tail) {
  const index = queue[head++];
  const x = index % width;
  const y = Math.floor(index / width);
  if (x > 0) enqueue(index - 1);
  if (x + 1 < width) enqueue(index + 1);
  if (y > 0) enqueue(index - width);
  if (y + 1 < height) enqueue(index + width);
}

for (let index = 0; index < pixelCount; index += 1) {
  if (outside[index]) data[index * channels + 3] = 0;
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(output);
