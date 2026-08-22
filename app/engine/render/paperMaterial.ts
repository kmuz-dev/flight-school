/**
 * The photographic surface shared by every procedural sheet.
 *
 * This module is reachable only from the lazy renderer chunk. Importing the
 * three maps here therefore cannot pull them into Hangar or Preflight until a
 * cadet explicitly asks for 3D, while the Tutorial gets the same material from
 * the same code path.
 */
import {
  MirroredRepeatWrapping,
  NoColorSpace,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
import paperAlbedo from "@/assets/materials/paper-craft-albedo.webp";
import paperNormal from "@/assets/materials/paper-craft-normal.webp";
import paperRoughness from "@/assets/materials/paper-craft-roughness.webp";

export const PAPER_TEXTURE_REPEAT = 4;
export const PAPER_ROUGHNESS = 0.88;
export const PAPER_NORMAL_SCALE = 0.18;
export const PAPER_ANISOTROPY_CAP = 8;

export type PaperTextureSet = {
  readonly albedo: Texture;
  readonly normal: Texture;
  readonly roughness: Texture;
};

export type PaperTextureLoader = {
  loadAsync(url: string): Promise<Texture>;
};

function prepare(texture: Texture, color: boolean, anisotropy: number): Texture {
  texture.wrapS = MirroredRepeatWrapping;
  texture.wrapT = MirroredRepeatWrapping;
  texture.repeat.set(PAPER_TEXTURE_REPEAT, PAPER_TEXTURE_REPEAT);
  texture.anisotropy = Math.min(Math.max(anisotropy, 1), PAPER_ANISOTROPY_CAP);
  texture.colorSpace = color ? SRGBColorSpace : NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function disposePaperTextures(textures: PaperTextureSet): void {
  textures.albedo.dispose();
  textures.normal.dispose();
  textures.roughness.dispose();
}

/**
 * Load all maps as one unit.
 *
 * A partial material is worse than the deterministic fallback because a
 * missing normal or roughness map changes the object during the handoff. If
 * any request fails, release every map that did arrive and reject once.
 */
export async function loadPaperTextures(
  anisotropy: number,
  loader: PaperTextureLoader = new TextureLoader(),
): Promise<PaperTextureSet> {
  const settled = await Promise.allSettled([
    loader.loadAsync(paperAlbedo.src),
    loader.loadAsync(paperNormal.src),
    loader.loadAsync(paperRoughness.src),
  ]);
  const loaded = settled.flatMap((entry) => entry.status === "fulfilled" ? [entry.value] : []);
  const failed = settled.find((entry): entry is PromiseRejectedResult => entry.status === "rejected");
  if (failed) {
    loaded.forEach((texture) => texture.dispose());
    throw failed.reason;
  }

  const [albedo, normal, roughness] = loaded;
  if (!albedo || !normal || !roughness) {
    loaded.forEach((texture) => texture.dispose());
    throw new Error("paper material maps did not finish loading");
  }
  return {
    albedo: prepare(albedo, true, anisotropy),
    normal: prepare(normal, false, anisotropy),
    roughness: prepare(roughness, false, anisotropy),
  };
}
