import { describe, expect, it, vi } from "vitest";
import { stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  MirroredRepeatWrapping,
  NoColorSpace,
  SRGBColorSpace,
  Texture,
} from "three";
import {
  PAPER_ANISOTROPY_CAP,
  PAPER_TEXTURE_REPEAT,
  disposePaperTextures,
  loadPaperTextures,
  type PaperTextureLoader,
} from "@/engine/render/paperMaterial";

function loadedTextures(): { loader: PaperTextureLoader; textures: Texture[]; urls: string[] } {
  const textures = [new Texture(), new Texture(), new Texture()];
  const urls: string[] = [];
  let index = 0;
  return {
    textures,
    urls,
    loader: {
      async loadAsync(url: string): Promise<Texture> {
        urls.push(url);
        return textures[index++]!;
      },
    },
  };
}

describe("photographic paper maps", () => {
  it("keeps the approved production set within its exact byte and dimension budget", async () => {
    const assetDir = path.join(process.cwd(), "app/assets/materials");
    const expected = [
      ["paper-craft-albedo.webp", 1024, 80_640],
      ["paper-craft-normal.webp", 512, 166_372],
      ["paper-craft-roughness.webp", 512, 2_214],
    ] as const;
    let total = 0;
    for (const [name, dimension, bytes] of expected) {
      const file = path.join(assetDir, name);
      const metadata = await sharp(file).metadata();
      const size = (await stat(file)).size;
      expect(metadata.width, name).toBe(dimension);
      expect(metadata.height, name).toBe(dimension);
      expect(size, name).toBe(bytes);
      total += size;
    }
    expect(total).toBeLessThanOrEqual(257_906);
  });

  it("preserves roughness variation without pulling the paper below its calibrated range", async () => {
    const file = path.join(process.cwd(), "app/assets/materials/paper-craft-roughness.webp");
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
    let min = 255;
    let max = 0;
    let sum = 0;
    let squared = 0;
    let count = 0;
    for (let offset = 1; offset < data.length; offset += info.channels) {
      const value = data[offset]!;
      min = Math.min(min, value);
      max = Math.max(max, value);
      sum += value;
      squared += value * value;
      count += 1;
    }
    const mean = sum / count;
    const variance = squared / count - mean * mean;
    const effectiveRoughness = (mean / 255) * 0.88;

    expect(max - min).toBeGreaterThanOrEqual(4);
    expect(Math.sqrt(variance)).toBeGreaterThan(0.1);
    expect(effectiveRoughness).toBeGreaterThanOrEqual(0.85);
    expect(effectiveRoughness).toBeLessThanOrEqual(0.88);
  });

  it("loads the three production maps with their physical texture settings", async () => {
    const { loader, textures, urls } = loadedTextures();
    const result = await loadPaperTextures(32, loader);

    expect(urls).toHaveLength(3);
    expect(result).toEqual({ albedo: textures[0], normal: textures[1], roughness: textures[2] });
    for (const texture of textures) {
      expect(texture.wrapS).toBe(MirroredRepeatWrapping);
      expect(texture.wrapT).toBe(MirroredRepeatWrapping);
      expect(texture.repeat.toArray()).toEqual([PAPER_TEXTURE_REPEAT, PAPER_TEXTURE_REPEAT]);
      expect(texture.anisotropy).toBe(PAPER_ANISOTROPY_CAP);
      expect(texture.version).toBeGreaterThan(0);
    }
    expect(result.albedo.colorSpace).toBe(SRGBColorSpace);
    expect(result.normal.colorSpace).toBe(NoColorSpace);
    expect(result.roughness.colorSpace).toBe(NoColorSpace);

    disposePaperTextures(result);
  });

  it("releases every partial result when one map fails", async () => {
    const first = new Texture();
    const third = new Texture();
    const firstDispose = vi.spyOn(first, "dispose");
    const thirdDispose = vi.spyOn(third, "dispose");
    let index = 0;
    const loader: PaperTextureLoader = {
      async loadAsync(): Promise<Texture> {
        index += 1;
        if (index === 2) throw new Error("normal map failed");
        return index === 1 ? first : third;
      },
    };

    await expect(loadPaperTextures(4, loader)).rejects.toThrow("normal map failed");
    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(thirdDispose).toHaveBeenCalledTimes(1);
  });
});
