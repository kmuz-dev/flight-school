/**
 * Reproducible camera calibration and canonical-reference generation.
 *
 * Default mode searches readable three-quarter views against approved hero
 * alpha without stretching either silhouette. Pass `--write-references` after
 * updating `AIRCRAFT_DISPLAY_VIEWS` to render the matching canonical SVG/PNG
 * set from the production final FoldState.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PLANES, PLANE_IDS } from "../app/content/index";
import type { PlaneId } from "../app/content/types";
import { AIRCRAFT_DISPLAY_VIEWS } from "../app/content/presentationViews";
import { computeFoldState } from "../app/engine/core/state";
import { renderStateToSvg } from "../app/engine/core/svgRender";
import type { DisplayView, FoldState } from "../app/engine/core/types";

const ROOT = process.cwd();
const ASSET_DIR = path.join(ROOT, "app/assets/aircraft");
const REFERENCE_DIR = path.join(ROOT, "docs/aircraft-art/references");
const REFERENCE_SIZE = { width: 1400, height: 1120 } as const;
const MASK_SIZE = 320;
const ALPHA_THRESHOLD = 16;
const MAX_ASPECT_DRIFT = 0.15;

type Mask = {
  readonly alpha: Buffer;
  readonly aspect: number;
};

type SearchResult = {
  readonly view: DisplayView;
  readonly iou: number;
  readonly aspectDrift: number;
};

function withoutDisplayShadow(svg: string): string {
  return svg.replace(/(<svg[^>]*>).*?(<g><polygon)/s, "$1$2");
}

function canonicalSvg(state: FoldState, displayView: DisplayView): string {
  return withoutDisplayShadow(
    renderStateToSvg(state, {
      ...REFERENCE_SIZE,
      display: true,
      displayView,
      showCreaseMarks: false,
    }),
  );
}

async function decodeAlpha(input: string | Buffer): Promise<{
  readonly alpha: Buffer;
  readonly width: number;
  readonly height: number;
}> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(info.width * info.height);
  for (let pixel = 0; pixel < alpha.length; pixel += 1) alpha[pixel] = data[pixel * 4 + 3]!;
  return { alpha, width: info.width, height: info.height };
}

function boundsOf(
  alpha: Buffer,
  width: number,
  height: number,
): { left: number; top: number; width: number; height: number } {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alpha[y * width + x]! < ALPHA_THRESHOLD) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < minX || maxY < minY) throw new Error("silhouette is empty");
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function normalizedMask(input: string | Buffer): Promise<Mask> {
  const decoded = await decodeAlpha(input);
  const bounds = boundsOf(decoded.alpha, decoded.width, decoded.height);
  const { data } = await sharp(input)
    .extract(bounds)
    .resize(MASK_SIZE, MASK_SIZE, {
      fit: "contain",
      kernel: "nearest",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(MASK_SIZE * MASK_SIZE);
  for (let pixel = 0; pixel < alpha.length; pixel += 1) alpha[pixel] = data[pixel * 4 + 3]!;
  return { alpha, aspect: bounds.width / bounds.height };
}

function iou(a: Buffer, b: Buffer): number {
  let intersection = 0;
  let union = 0;
  for (let pixel = 0; pixel < a.length; pixel += 1) {
    const inA = a[pixel]! >= ALPHA_THRESHOLD;
    const inB = b[pixel]! >= ALPHA_THRESHOLD;
    if (inA && inB) intersection += 1;
    if (inA || inB) union += 1;
  }
  return intersection / union;
}

function coarseCandidates(): DisplayView[] {
  const values: DisplayView[] = [];
  for (let azimuthDeg = 60; azimuthDeg <= 220; azimuthDeg += 4) {
    for (let elevationDeg = 8; elevationDeg <= 84; elevationDeg += 4) {
      values.push({ azimuthDeg, elevationDeg });
    }
  }
  return values;
}

function refinementCandidates(center: DisplayView): DisplayView[] {
  const values: DisplayView[] = [];
  for (let azimuthDeg = center.azimuthDeg - 4; azimuthDeg <= center.azimuthDeg + 4; azimuthDeg += 1) {
    for (
      let elevationDeg = center.elevationDeg - 4;
      elevationDeg <= center.elevationDeg + 4;
      elevationDeg += 1
    ) {
      values.push({ azimuthDeg, elevationDeg });
    }
  }
  return values;
}

async function bestView(id: PlaneId): Promise<SearchResult> {
  const structure = PLANES[id]!;
  const state = computeFoldState(structure, structure.steps.length - 1);
  const hero = await normalizedMask(path.join(ASSET_DIR, `${id}-hero.webp`));
  const search = async (
    views: readonly DisplayView[],
    prior: SearchResult | null,
  ): Promise<SearchResult | null> => {
    let best = prior;
    for (const view of views) {
      const candidate = await normalizedMask(Buffer.from(canonicalSvg(state, view)));
      const aspectDrift = Math.abs(candidate.aspect - hero.aspect) / hero.aspect;
      if (aspectDrift > MAX_ASPECT_DRIFT) continue;
      const score = iou(candidate.alpha, hero.alpha);
      if (!best || score > best.iou) best = { view, iou: score, aspectDrift };
    }
    return best;
  };

  let best = await search(coarseCandidates(), null);
  if (best) {
    best = await search(refinementCandidates(best.view), best);
  }
  if (!best) throw new Error(`${id}: no readable candidate passed the aspect guard`);
  return best;
}

async function writeReferences(): Promise<void> {
  await mkdir(REFERENCE_DIR, { recursive: true });
  for (const id of PLANE_IDS) {
    const structure = PLANES[id]!;
    const state = computeFoldState(structure, structure.steps.length - 1);
    const svg = canonicalSvg(state, AIRCRAFT_DISPLAY_VIEWS[id]);
    await writeFile(path.join(REFERENCE_DIR, `${id}-canonical.svg`), svg);
    await sharp(Buffer.from(svg))
      .resize(REFERENCE_SIZE.width, REFERENCE_SIZE.height)
      .png()
      .toFile(path.join(REFERENCE_DIR, `${id}-canonical.png`));
  }
}

if (process.argv.includes("--write-references")) {
  await writeReferences();
  console.log(`Wrote ${PLANE_IDS.length} canonical SVG/PNG reference pairs.`);
} else {
  const requestedId = process.argv.find((arg) => arg.startsWith("--id="))?.slice(5);
  const ids = requestedId ? [requestedId as PlaneId] : PLANE_IDS;
  for (const id of ids) {
    if (!PLANE_IDS.includes(id)) throw new Error(`Unknown plane id: ${id}`);
    const result = await bestView(id);
    console.log(
      `${id}: azimuth=${result.view.azimuthDeg} elevation=${result.view.elevationDeg} ` +
        `IoU=${result.iou.toFixed(4)} aspect-drift=${(result.aspectDrift * 100).toFixed(2)}%`,
    );
  }
}
