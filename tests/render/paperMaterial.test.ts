import { describe, expect, it, vi } from "vitest";
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
