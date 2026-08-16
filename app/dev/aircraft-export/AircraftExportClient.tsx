"use client";

import { useEffect, useState } from "react";
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { PLANES } from "@/content";
import type { PlaneId } from "@/content/types";
import { AIRCRAFT_DISPLAY_VIEWS } from "@/content/presentationViews";
import { DISPLAY_LIFT } from "@/engine/view";
import { core } from "@/engine/render/create";
import { framingDistance, orbitToPosition } from "@/engine/render/renderer";
import { SceneModel, STAGE_THEME } from "@/engine/render/sceneModel";

declare global {
  interface Window {
    __AIRCRAFT_EXPORTS__?: Partial<Record<PlaneId, string>>;
  }
}

const EXPORT_IDS: readonly PlaneId[] = [
  "bulldog",
  "harrier",
  "sea-glider",
  "hammer",
  "square-cruiser",
];

const WIDTH = 1280;
const HEIGHT = 1024;
const FOV_DEG = 30;

function renderAircraft(renderer: WebGLRenderer, id: PlaneId): string {
  const structure = PLANES[id];
  if (!structure) throw new Error(`Missing plane: ${id}`);

  const theme = STAGE_THEME;
  const scene = new Scene();
  const model = new SceneModel(theme, false);
  scene.add(model.root);

  const state = core.computeFoldState(structure, structure.steps.length - 1);
  model.sync(state);
  model.setRest(core.restTransform(state));
  model.applyPoses(core.posesForState(state));
  const restingBounds = model.computeBounds();
  model.setPlacement(restingBounds.center, 0, DISPLAY_LIFT * restingBounds.radius, 0);
  const bounds = model.computeBounds();

  const hemi = new HemisphereLight(
    new Color(theme.hemiSky),
    new Color(theme.hemiGround),
    theme.displayHemiIntensity,
  );
  const key = new DirectionalLight(new Color(theme.keyColor), theme.keyIntensity);
  const fill = new DirectionalLight(new Color(theme.fillColor), theme.displayFillIntensity);
  const d = bounds.radius * 4;
  key.position.set(
    bounds.center.x - d * 0.55,
    bounds.center.y - d * 0.75,
    bounds.center.z + d * 1.2,
  );
  key.target.position.copy(bounds.center);
  fill.position.set(
    bounds.center.x + d * 0.9,
    bounds.center.y + d * 0.3,
    bounds.center.z + d * 0.5,
  );
  fill.target.position.copy(bounds.center);
  scene.add(hemi, key, key.target, fill, fill.target);

  const aspect = WIDTH / HEIGHT;
  const camera = new PerspectiveCamera(FOV_DEG, aspect, 1, 20000);
  camera.up.set(0, 0, 1);
  const target = new Vector3(bounds.center.x, bounds.center.y, bounds.center.z);
  orbitToPosition(
    {
      ...AIRCRAFT_DISPLAY_VIEWS[id],
      distance: framingDistance(bounds.radius, FOV_DEG, aspect) * 0.9,
    },
    target,
    camera.position,
  );
  camera.near = Math.max(bounds.radius * 0.1, 0.5);
  camera.far = bounds.radius * 20;
  camera.lookAt(target);
  camera.updateProjectionMatrix();

  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/png");

  model.dispose();
  hemi.dispose();
  key.dispose();
  fill.dispose();
  scene.clear();
  return url;
}

export default function AircraftExportClient() {
  const [exports, setExports] = useState<Partial<Record<PlaneId, string>>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    try {
      const canvas = document.createElement("canvas");
      const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });
      renderer.outputColorSpace = SRGBColorSpace;
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(1);

      const rendered = Object.fromEntries(
        EXPORT_IDS.map((id) => [id, renderAircraft(renderer, id)]),
      ) as Partial<Record<PlaneId, string>>;
      renderer.dispose();
      renderer.forceContextLoss();
      if (!cancelled) {
        window.__AIRCRAFT_EXPORTS__ = rendered;
        setExports(rendered);
      }
    } catch (reason) {
      if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason));
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = EXPORT_IDS.every((id) => Boolean(exports[id]));
  return (
    <main
      data-export-ready={ready ? "true" : "false"}
      data-export-error={error}
      style={{ minHeight: "100vh", background: "#122238", color: "white", padding: 24 }}
    >
      <h1>Canonical aircraft export</h1>
      {error ? <pre>{error}</pre> : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {EXPORT_IDS.map((id) => (
          <figure key={id} style={{ margin: 0, background: "#dce7ec" }}>
            {exports[id] ? (
              <img
                alt={id}
                data-aircraft-id={id}
                src={exports[id]}
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            ) : null}
            <figcaption style={{ padding: 8, color: "#122238" }}>{id}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
