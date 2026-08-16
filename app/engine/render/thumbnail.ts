/**
 * Hangar thumbnails: a plane's final fold state as a PNG data URL.
 *
 * SPEC 4.3 forbids six live WebGL contexts on the catalog, so every thumbnail
 * goes through ONE shared offscreen renderer, one at a time. With no WebGL at
 * all we fall back to the core's SVG, encoded as a data URL, so callers always
 * get something they can drop into `<img src>`.
 */
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import type { PlaneStructure } from "@/content/types";
import type { CoreApi } from "./coreApi";
import { isWebGLAvailable } from "./fallback";
import { SceneModel, STAGE_THEME } from "./sceneModel";
import { CAMERA_PRESETS, framingDistance, orbitToPosition } from "./renderer";

export type ThumbnailOptions = {
  readonly width?: number;
  readonly height?: number;
  readonly pixelRatio?: number;
};

const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 360;
const FOV_DEG = 30;

let sharedRenderer: WebGLRenderer | null = null;
/** Serialises renders so the single shared context is never re-entered. */
let queue: Promise<unknown> = Promise.resolve();

function getSharedRenderer(): WebGLRenderer | null {
  if (sharedRenderer) return sharedRenderer;
  if (!isWebGLAvailable()) return null;
  try {
    sharedRenderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      // Required: `toDataURL` reads the buffer after the draw call returns.
      preserveDrawingBuffer: true,
    });
    sharedRenderer.outputColorSpace = SRGBColorSpace;
    sharedRenderer.toneMapping = ACESFilmicToneMapping;
    sharedRenderer.toneMappingExposure = 1.05;
    sharedRenderer.setClearColor(0x000000, 0);
    return sharedRenderer;
  } catch {
    sharedRenderer = null;
    return null;
  }
}

/** SVG of the final state, encoded so it can be used as an `<img>` source. */
export function svgThumbnail(structure: PlaneStructure, core: CoreApi): string {
  const state = core.computeFoldState(structure, structure.steps.length - 1);
  const svg = core.renderStateToSvg(state, { rest: true });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Render `structure`'s finished plane to a data URL. Never throws: any WebGL
 * problem degrades to the SVG rendering.
 */
export function renderThumbnail(
  structure: PlaneStructure,
  core: CoreApi,
  options: ThumbnailOptions = {},
): Promise<string> {
  const run = (): string => {
    const renderer = getSharedRenderer();
    if (!renderer) return svgThumbnail(structure, core);
    try {
      return drawThumbnail(renderer, structure, core, options);
    } catch {
      return svgThumbnail(structure, core);
    }
  };
  const next = queue.then(run, run);
  // Keep the chain alive even if a caller never handles a rejection.
  queue = next.catch(() => undefined);
  return next;
}

function drawThumbnail(
  renderer: WebGLRenderer,
  structure: PlaneStructure,
  core: CoreApi,
  options: ThumbnailOptions,
): string {
  const width = options.width ?? DEFAULT_WIDTH;
  const height = options.height ?? DEFAULT_HEIGHT;
  const theme = STAGE_THEME;

  const scene = new Scene();
  const model = new SceneModel(theme);
  scene.add(model.root);

  const state = core.computeFoldState(structure, structure.steps.length - 1);
  model.sync(state);
  model.applyPoses(core.posesForState(state));
  const bounds = model.computeBounds();

  const hemi = new HemisphereLight(
    new Color(theme.hemiSky),
    new Color(theme.hemiGround),
    theme.hemiIntensity,
  );
  const key = new DirectionalLight(new Color(theme.keyColor), theme.keyIntensity);
  const fill = new DirectionalLight(new Color(theme.fillColor), theme.fillIntensity);
  const d = bounds.radius * 4;
  key.position.set(bounds.center.x - d * 0.55, bounds.center.y - d * 0.75, bounds.center.z + d * 1.2);
  fill.position.set(bounds.center.x + d * 0.9, bounds.center.y + d * 0.3, bounds.center.z + d * 0.5);
  scene.add(hemi, key, fill);

  const aspect = width / height;
  const camera = new PerspectiveCamera(FOV_DEG, aspect, 1, 20000);
  camera.up.set(0, 0, 1);
  const target = new Vector3(bounds.center.x, bounds.center.y, bounds.center.z);
  orbitToPosition(
    { ...CAMERA_PRESETS.threeQuarter, distance: framingDistance(bounds.radius, FOV_DEG, aspect) },
    target,
    camera.position,
  );
  camera.lookAt(target);
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(options.pixelRatio ?? 2);
  renderer.setSize(width, height, false);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/png");

  model.dispose();
  hemi.dispose();
  key.dispose();
  fill.dispose();
  scene.clear();
  return url;
}

/** Release the shared context. Call when the hangar unmounts. */
export function disposeThumbnailRenderer(): void {
  if (!sharedRenderer) return;
  sharedRenderer.dispose();
  sharedRenderer.forceContextLoss();
  sharedRenderer = null;
  queue = Promise.resolve();
}
