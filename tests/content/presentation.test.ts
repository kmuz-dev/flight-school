import { describe, expect, it } from "vitest";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PLANE_IDS } from "@/content";
import {
  AIRCRAFT_PRESENTATIONS,
  getAircraftPresentation,
} from "@/content/presentation";
import { STAGE_THEME } from "@/engine/render/sceneModel";

const AIRCRAFT_ASSET_DIR = path.join(process.cwd(), "app/assets/aircraft");
const CANONICAL_REFERENCE_DIR = path.join(process.cwd(), "docs/aircraft-art/references");
const ARTWORK_SIZE = { width: 1280, height: 1024, maxBytes: 300 * 1024 } as const;
const ALPHA_THRESHOLD = 16;
const SILHOUETTE_SIZE = 512;
/**
 * These floors guard each owner-approved presentation against later drift.
 * They are not proof that a generated photograph is physically foldable: the
 * procedural model and real-paper review retain that authority.
 *
 * Measured on the accepted release set and set just below it, so a later export
 * that quietly loses a nose or a wingtip fails here rather than shipping. Two
 * sit lower than the rest on purpose. The Dart is the owner-approved artwork
 * the whole fleet was matched to and its long needle nose reads as a much
 * thinner silhouette than the geometry's; the Harrier keeps its approved
 * simplified high view because both defining tip fins read more clearly there.
 *
 * The Bulldog and the Hammer sit below the strict 0.9 the geometry-led images
 * used to hold, and that is the corrected-nose set being honest: v3 rebuilt
 * both noses to match the fold, which changed the silhouette away from the
 * v2 image the earlier floor was measured on.
 */
const PRESENTATION_FIDELITY_FLOOR = {
  dart: 0.48,
  bulldog: 0.9,
  harrier: 0.75,
  "sea-glider": 0.93,
  hammer: 0.86,
  "square-cruiser": 0.91,
} as const;
const MAXIMUM_ASPECT_DRIFT = {
  dart: 0.1,
  bulldog: 0.05,
  harrier: 0.24,
  "sea-glider": 0.05,
  hammer: 0.05,
  "square-cruiser": 0.05,
} as const;
const MINIMUM_COVERAGE = 0.15;
const MAXIMUM_COVERAGE = 0.4;
const MINIMUM_PADDING = 0.02;
const MAXIMUM_PADDING = 0.3;
/**
 * Two pixels on a 1.3-megapixel image, which is the anti-aliased edge of a
 * chroma-keyed cutout rather than a green halo. The accepted set's worst is the
 * Bulldog at 1.53; four of the six are at zero.
 */
const MAXIMUM_CHROMA_PIXELS_PER_MEGAPIXEL = 2;
/**
 * How far the aircraft has to separate from the ground it is presented on.
 *
 * White paper on the Preflight stage's cream is the hard case by construction -
 * they are two light values - so this is a legibility floor, not a WCAG text
 * ratio. The accepted set runs 1.26 to 1.48.
 */
const MINIMUM_AVERAGE_OBJECT_CONTRAST = 1.2;
/**
 * The photographed Hangar plate, and how far the aircraft must separate from it.
 *
 * A far easier case than the cream stage - white paper on a dark room - so the
 * floor is correspondingly high. It is here to catch an aircraft that arrives
 * dark or muddy, which would vanish into the bay entirely.
 */
const HANGAR_PLATE = path.join(process.cwd(), "app/assets/hangar/hangar-interior.jpg");
const MINIMUM_BAY_CONTRAST = 5;

type Decoded = {
  readonly data: Buffer;
  readonly width: number;
  readonly height: number;
};

type VisibleBounds = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
};

async function decodedRgba(file: string): Promise<Decoded> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function alphaAt(image: Decoded, x: number, y: number): number {
  return image.data[(y * image.width + x) * 4 + 3]!;
}

function coverage(image: Decoded, threshold = 128): number {
  let visible = 0;
  for (let offset = 3; offset < image.data.length; offset += 4) {
    if (image.data[offset]! >= threshold) visible += 1;
  }
  return visible / (image.width * image.height);
}

function visibleBounds(image: Decoded): VisibleBounds {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (alphaAt(image, x, y) < ALPHA_THRESHOLD) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) throw new Error("image has no visible silhouette");
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function normalizedSilhouette(file: string): Promise<Buffer> {
  const source = await decodedRgba(file);
  const bounds = visibleBounds(source);

  const { data } = await sharp(file)
    .extract(bounds)
    .resize(SILHOUETTE_SIZE, SILHOUETTE_SIZE, {
      fit: "contain",
      kernel: "nearest",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data;
}

function silhouetteIou(actual: Buffer, canonical: Buffer): number {
  let intersection = 0;
  let union = 0;
  for (let offset = 3; offset < actual.length; offset += 4) {
    const actualVisible = actual[offset]! >= ALPHA_THRESHOLD;
    const canonicalVisible = canonical[offset]! >= ALPHA_THRESHOLD;
    if (actualVisible && canonicalVisible) intersection += 1;
    if (actualVisible || canonicalVisible) union += 1;
  }
  return intersection / union;
}

function greenFringeCount(image: Decoded): number {
  let count = 0;
  for (let offset = 0; offset < image.data.length; offset += 4) {
    const red = image.data[offset]!;
    const green = image.data[offset + 1]!;
    const blue = image.data[offset + 2]!;
    const alpha = image.data[offset + 3]!;
    if (
      alpha >= 32 &&
      green > red * 1.25 &&
      green > blue * 1.25 &&
      green - red > 30
    ) {
      count += 1;
    }
  }
  return count;
}

function rgb(hex: number): readonly [number, number, number] {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function luminance(red: number, green: number, blue: number): number {
  const linear = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

/** Composite over the real stage gradient and measure object/background separation. */
function averageCompositeContrast(
  image: Decoded,
  top: readonly [number, number, number],
  bottom: readonly [number, number, number],
): number {
  let total = 0;
  let samples = 0;
  for (let y = 0; y < image.height; y += 1) {
    const progress = y / Math.max(1, image.height - 1);
    const background = top.map(
      (channel, index) => channel + (bottom[index]! - channel) * progress,
    ) as unknown as readonly [number, number, number];
    const backgroundLuminance = luminance(...background);
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      const alpha = image.data[offset + 3]! / 255;
      if (alpha < 0.5) continue;
      const composite = [0, 1, 2].map(
        (channel) => image.data[offset + channel]! * alpha + background[channel]! * (1 - alpha),
      ) as unknown as readonly [number, number, number];
      const subjectLuminance = luminance(...composite);
      total +=
        (Math.max(subjectLuminance, backgroundLuminance) + 0.05) /
        (Math.min(subjectLuminance, backgroundLuminance) + 0.05);
      samples += 1;
    }
  }
  return total / samples;
}

/**
 * The one beauty render for an aircraft.
 *
 * Built from the id rather than read off `presentation.artwork`, because a
 * bundled image import is a `StaticImageData` object in the app and a bare URL
 * string under vitest - so reading `.src` here would be relying on a runtime
 * shape the types deny. The naming convention is instead pinned directly, by
 * the directory-listing test below.
 */
function artworkFile(id: string): string {
  return path.join(AIRCRAFT_ASSET_DIR, `${id}-hero.webp`);
}

describe("aircraft presentation manifest", () => {
  it("has exactly one beauty-art contract for every canonical plane", () => {
    expect(Object.keys(AIRCRAFT_PRESENTATIONS).sort()).toEqual([...PLANE_IDS].sort());
  });

  it.each(PLANE_IDS)("provides complete, usable presentation metadata for %s", (id) => {
    const presentation = getAircraftPresentation(id);

    expect(presentation.artwork).toBeTruthy();
    expect(presentation.objectPosition).toMatch(/^\d+% \d+%$/);
    expect(presentation.hangarScale).toBeGreaterThan(0);
    expect(presentation.heroScale).toBeGreaterThan(0);
    expect(Number.isFinite(presentation.displayView.azimuthDeg)).toBe(true);
    expect(presentation.displayView.elevationDeg).toBeGreaterThan(0);
    expect(presentation.displayView.elevationDeg).toBeLessThan(90);
  });

  it.each(PLANE_IDS)("ships one decoded, transparent beauty render for %s", async (id) => {
    const file = artworkFile(id);
    const metadata = await sharp(file).metadata();
    const image = await decodedRgba(file);
    const bytes = (await stat(file)).size;

    expect(metadata.format, file).toBe("webp");
    expect(metadata.hasAlpha, file).toBe(true);
    expect(metadata.width, file).toBe(ARTWORK_SIZE.width);
    expect(metadata.height, file).toBe(ARTWORK_SIZE.height);
    expect(bytes, file).toBeLessThanOrEqual(ARTWORK_SIZE.maxBytes);

    const corners = [
      alphaAt(image, 0, 0),
      alphaAt(image, image.width - 1, 0),
      alphaAt(image, 0, image.height - 1),
      alphaAt(image, image.width - 1, image.height - 1),
    ];
    expect(corners, `${file} must have four transparent corners`).toEqual([0, 0, 0, 0]);
    expect(coverage(image), `${file} minimum subject coverage`).toBeGreaterThanOrEqual(
      MINIMUM_COVERAGE,
    );
    expect(coverage(image), `${file} maximum subject coverage`).toBeLessThanOrEqual(
      MAXIMUM_COVERAGE,
    );

    const bounds = visibleBounds(image);
    const padding = [
      bounds.left / image.width,
      bounds.top / image.height,
      (image.width - bounds.left - bounds.width) / image.width,
      (image.height - bounds.top - bounds.height) / image.height,
    ];
    expect(Math.min(...padding), `${file} minimum safe padding`).toBeGreaterThanOrEqual(
      MINIMUM_PADDING,
    );
    expect(Math.max(...padding), `${file} subject must not be undersized`).toBeLessThanOrEqual(
      MAXIMUM_PADDING,
    );

    const fringePerMegapixel =
      (greenFringeCount(image) * 1_000_000) / (image.width * image.height);
    expect(fringePerMegapixel, `${file} visible chroma fringe`).toBeLessThanOrEqual(
      MAXIMUM_CHROMA_PIXELS_PER_MEGAPIXEL,
    );
  });

  /*
   * One file per aircraft and nothing else in the directory.
   *
   * This is what retires the card for good. A second export left behind would
   * pass every check above on its own merits while nothing rendered it, and the
   * pair could then drift apart unobserved - which is the failure the deleted
   * "card and hero are the same picture" test existed to catch.
   */
  it("keeps exactly one beauty render per aircraft and nothing else", async () => {
    const files = (await readdir(AIRCRAFT_ASSET_DIR)).sort();
    expect(files).toEqual(PLANE_IDS.map((id) => `${id}-hero.webp`).sort());
  });

  it.each(PLANE_IDS)("keeps the %s silhouette faithful to canonical geometry", async (id) => {
    const file = artworkFile(id);
    const canonicalFile = path.join(CANONICAL_REFERENCE_DIR, `${id}-canonical.png`);
    const artwork = await normalizedSilhouette(file);
    const canonical = await normalizedSilhouette(canonicalFile);
    const iou = silhouetteIou(artwork, canonical);

    expect(iou, `${id} normalized silhouette IoU`).toBeGreaterThanOrEqual(
      PRESENTATION_FIDELITY_FLOOR[id],
    );

    const artworkBounds = visibleBounds(await decodedRgba(file));
    const canonicalBounds = visibleBounds(await decodedRgba(canonicalFile));
    const artworkAspect = artworkBounds.width / artworkBounds.height;
    const canonicalAspect = canonicalBounds.width / canonicalBounds.height;
    expect(
      Math.abs(artworkAspect - canonicalAspect) / canonicalAspect,
      `${id} silhouette aspect drift`,
    ).toBeLessThanOrEqual(MAXIMUM_ASPECT_DRIFT[id]);
  });

  it.each(PLANE_IDS)("keeps the %s aircraft legible on the display ground", async (id) => {
    const image = await decodedRgba(artworkFile(id));
    const contrast = averageCompositeContrast(
      image,
      rgb(STAGE_THEME.displaySky),
      rgb(STAGE_THEME.displayGround),
    );
    expect(contrast, `${id} on the display gradient`).toBeGreaterThanOrEqual(
      MINIMUM_AVERAGE_OBJECT_CONTRAST,
    );
  });

  /*
   * And on the Hangar's own ground, which is a photograph rather than a colour.
   *
   * Measured against the real plate rather than against two sampled hexes, so
   * there is nothing here to drift out of step with `.hangar-photo`. It is
   * measured UNGRADED, which is the conservative direction: the shipped plate is
   * darkened (`brightness(0.72)`), so a white aircraft separates from it by more
   * than this, never less - and the floor cannot be quietly satisfied by the CSS
   * grade doing the work the artwork should be doing.
   */
  it.each(PLANE_IDS)("keeps the %s aircraft legible in the photographed bay", async (id) => {
    const bay = await sharp(HANGAR_PLATE)
      .resize(ARTWORK_SIZE.width, ARTWORK_SIZE.height, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer();
    const artwork = await decodedRgba(artworkFile(id));

    let total = 0;
    let samples = 0;
    for (let pixel = 0; pixel < artwork.width * artwork.height; pixel += 1) {
      const alpha = artwork.data[pixel * 4 + 3]! / 255;
      if (alpha < 0.5) continue;
      const behind = luminance(bay[pixel * 3]!, bay[pixel * 3 + 1]!, bay[pixel * 3 + 2]!);
      const front = luminance(
        ...([0, 1, 2].map(
          (channel) => artwork.data[pixel * 4 + channel]! * alpha + bay[pixel * 3 + channel]! * (1 - alpha),
        ) as unknown as [number, number, number]),
      );
      total += (Math.max(front, behind) + 0.05) / (Math.min(front, behind) + 0.05);
      samples += 1;
    }

    expect(total / samples, `${id} against the hangar plate`).toBeGreaterThanOrEqual(
      MINIMUM_BAY_CONTRAST,
    );
  });
});
