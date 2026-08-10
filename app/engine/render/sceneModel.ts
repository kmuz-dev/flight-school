/**
 * FoldState -> Three.js meshes.
 *
 * One double-sided mesh per facet. Geometry is built from the facet's PAPER-space
 * polygon (millimeters, origin at sheet centre) and left there; the core's pose
 * matrix does all the placing. Geometry is rebuilt only when the facet set
 * changes (i.e. a new step); every animation frame writes matrices only.
 *
 * World space == the core's TABLE space: the table is the z=0 plane and +Z is up.
 * The camera's up vector is set to +Z to match, so pose matrices go straight in.
 */
import {
  BufferAttribute,
  BufferGeometry,
  Box3,
  Color,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";
import type { Facet, FoldState, Vec2 } from "@/engine/core/types";
import type { PoseMap } from "./coreApi";

export type ThemeName = "paper" | "night";

/**
 * Stage palette. Colours are the DESIGN.md tokens: the light stage is the
 * cream/ink two-ink system, Night Flight is the deep-navy scene change with rim
 * light on the paper rather than an inversion.
 */
export type StageTheme = {
  /** Scene clear colour behind the stage floor. */
  readonly background: number;
  readonly floor: number;
  readonly grid: number;
  readonly gridStrength: number;
  /** Graph-paper square size, in millimetres. */
  readonly gridSize: number;
  readonly paperFront: number;
  readonly paperBack: number;
  readonly edge: number;
  readonly edgeOpacity: number;
  readonly hemiSky: number;
  readonly hemiGround: number;
  readonly hemiIntensity: number;
  readonly keyColor: number;
  readonly keyIntensity: number;
  readonly fillColor: number;
  readonly fillIntensity: number;
  readonly rimColor: number;
  readonly rimIntensity: number;
  readonly crease: number;
  readonly shadowOpacity: number;
};

export const STAGE_THEMES: Readonly<Record<ThemeName, StageTheme>> = {
  paper: {
    background: 0xefe9da,
    floor: 0xfbf8f0,
    grid: 0x1a2b4a,
    gridStrength: 0.16,
    gridSize: 20,
    paperFront: 0xfdfbf4,
    paperBack: 0xeae2d0,
    edge: 0x1a2b4a,
    edgeOpacity: 0.22,
    hemiSky: 0xf7f3e9,
    hemiGround: 0xd9d2c2,
    hemiIntensity: 0.9,
    keyColor: 0xfff6e2,
    keyIntensity: 2.4,
    fillColor: 0xcfe0f0,
    fillIntensity: 0.75,
    rimColor: 0xffffff,
    rimIntensity: 0,
    crease: 0xd64541,
    shadowOpacity: 0.16,
  },
  night: {
    background: 0x0b1220,
    floor: 0x121c2e,
    grid: 0xf7f3e9,
    gridStrength: 0.14,
    gridSize: 20,
    paperFront: 0xf4efe3,
    paperBack: 0xd0c9b8,
    edge: 0xf7f3e9,
    edgeOpacity: 0.3,
    hemiSky: 0x1b2a45,
    hemiGround: 0x04070d,
    hemiIntensity: 0.45,
    keyColor: 0xdce8f5,
    keyIntensity: 1.5,
    fillColor: 0x2a3a57,
    fillIntensity: 0.5,
    rimColor: 0xe8effa,
    rimIntensity: 2.6,
    crease: 0xe8615c,
    shadowOpacity: 0.45,
  },
};

export function stageTheme(name: ThemeName | undefined): StageTheme {
  return STAGE_THEMES[name === "night" ? "night" : "paper"];
}

/**
 * One shared paper material for every facet. `DoubleSide` plus a tiny shader
 * patch gives the sheet a distinguishable reverse side, so a folded-over facet
 * reads as the back of the paper. Face parity comes for free: a pose with a
 * negative determinant (a reflection, i.e. face-down) makes Three flip the
 * winding, so `gl_FrontFacing` already encodes it.
 */
export function createPaperMaterial(theme: StageTheme): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(theme.paperFront),
    roughness: 0.94,
    metalness: 0,
    side: DoubleSide,
  });
  // Thin sheets look wrong with single-sided shadow casting.
  material.shadowSide = DoubleSide;

  const back = new Color(theme.paperBack);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.backColor = { value: back };
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform vec3 backColor;\nvoid main() {")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\n\tif ( !gl_FrontFacing ) { diffuseColor.rgb = backColor; }",
      );
  };
  material.customProgramCacheKey = () => "flightschool-paper-2side";
  return material;
}

/** Signed area of a polygon; sign tells us the winding in paper space. */
function signedArea(polygon: readonly Vec2[]): number {
  let sum = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    if (!a || !b) continue;
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return sum / 2;
}

/**
 * Fan-triangulate a convex polygon in the z=0 plane of PAPER space.
 * Winding is normalised to counter-clockwise so the +Z normal is the front face.
 */
export function facetGeometry(polygon: readonly Vec2[]): BufferGeometry {
  const n = polygon.length;
  const positions = new Float32Array(n * 3);
  const normals = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    const p = polygon[i];
    if (!p) continue;
    positions[i * 3] = p[0];
    positions[i * 3 + 1] = p[1];
    positions[i * 3 + 2] = 0;
    normals[i * 3 + 2] = 1;
  }

  const ccw = signedArea(polygon) >= 0;
  const indices: number[] = [];
  for (let i = 1; i < n - 1; i += 1) {
    if (ccw) indices.push(0, i, i + 1);
    else indices.push(0, i + 1, i);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  // Facets are placed by pose matrices, never by their own transform, so a
  // bounding sphere computed in paper space is all Three needs for culling.
  geometry.computeBoundingSphere();
  return geometry;
}

/** Closed outline of the facet, drawn as a child so it inherits the pose. */
function outlineGeometry(polygon: readonly Vec2[]): BufferGeometry {
  const n = polygon.length;
  const positions = new Float32Array(n * 2 * 3);
  for (let i = 0; i < n; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % n];
    if (!a || !b) continue;
    positions[i * 6] = a[0];
    positions[i * 6 + 1] = a[1];
    positions[i * 6 + 2] = 0;
    positions[i * 6 + 3] = b[0];
    positions[i * 6 + 4] = b[1];
    positions[i * 6 + 5] = 0;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
}

/** Identity of the facet set: ids plus polygon shape. Layer/pose changes are free. */
export function facetSignature(state: FoldState): string {
  const parts: string[] = [];
  for (const facet of state.facets) {
    let s = `${facet.id}:`;
    for (const p of facet.polygon) s += `${p[0].toFixed(3)},${p[1].toFixed(3)};`;
    parts.push(s);
  }
  return parts.join("|");
}

export type ModelBounds = {
  readonly min: Vector3;
  readonly max: Vector3;
  readonly center: Vector3;
  readonly radius: number;
};

function boundsFromBox(box: Box3): ModelBounds {
  const min = box.min.clone();
  const max = box.max.clone();
  return {
    min,
    max,
    center: min.clone().add(max).multiplyScalar(0.5),
    radius: Math.max(min.distanceTo(max) * 0.5, 1),
  };
}

/**
 * The box that holds both, for framing a step rather than one end of it: the
 * camera is placed once and holds while the paper sweeps between two states.
 */
export function unionBounds(a: ModelBounds, b: ModelBounds): ModelBounds {
  // Cloned, because Box3 keeps the vectors it is handed and union() writes into
  // them - the operands would come back mutated.
  return boundsFromBox(new Box3(a.min.clone(), a.max.clone()).union(new Box3(b.min, b.max)));
}

/**
 * The paper itself: a `Group` of facet meshes, rebuilt only on facet-set change.
 */
export class SceneModel {
  readonly root = new Group();

  private readonly paperMaterial: MeshStandardMaterial;
  private readonly edgeMaterial: LineBasicMaterial;
  private readonly meshes = new Map<number, Mesh>();
  private signature = "";
  private readonly box = new Box3();
  /** Scratch for the per-vertex bounds walk; avoids an allocation per vertex. */
  private readonly point = new Vector3();

  constructor(theme: StageTheme) {
    this.root.name = "fold-model";
    this.root.matrixAutoUpdate = false;
    this.paperMaterial = createPaperMaterial(theme);
    this.edgeMaterial = new LineBasicMaterial({
      color: new Color(theme.edge),
      transparent: true,
      opacity: theme.edgeOpacity,
      depthWrite: false,
    });
  }

  /**
   * Make the mesh set match `state`. Returns true when geometry was rebuilt.
   * Cheap and idempotent: call it on every step change, never per frame.
   */
  sync(state: FoldState): boolean {
    const next = facetSignature(state);
    if (next === this.signature && this.meshes.size === state.facets.length) return false;
    this.signature = next;
    this.clearMeshes();
    for (const facet of state.facets) this.addFacet(facet);
    return true;
  }

  /** Per-frame hot path: write matrices, touch nothing else. */
  applyPoses(poses: PoseMap): void {
    for (const [id, mesh] of this.meshes) {
      const m = poses.get(id);
      if (!m || m.length < 16) continue;
      mesh.matrix.fromArray(m as number[]);
      mesh.matrixWorldNeedsUpdate = true;
    }
  }

  /** Facet ids present in the scene, for pose-coverage assertions. */
  facetIds(): number[] {
    return [...this.meshes.keys()];
  }

  /**
   * World-space bounds of the posed paper. Call after a pose write, on step
   * changes only - it forces a matrix-world update and walks every vertex.
   */
  computeBounds(): ModelBounds {
    this.root.updateMatrixWorld(true);
    this.box.makeEmpty();
    // Per vertex, not per bounding box. `Box3.applyMatrix4` transforms the eight
    // corners of the local box and re-fits an axis-aligned box around them, and
    // a facet's local box is a rectangle around a polygon lying flat in paper
    // space: rotate that rectangle into a fold and its corners sweep well past
    // the paper they were drawn around. Measured on the finished Dart, the box
    // method reported the model as 200 x 310 x 172mm where the paper actually
    // occupies 57 x 310 x 72 - correct only along the one axis the folds happen
    // not to rotate about. Camera framing, the shadow camera extent and the
    // annotation anchor all read this, so all three were being aimed at a model
    // three times wider than the one on screen.
    for (const mesh of this.meshes.values()) {
      const position = mesh.geometry.getAttribute("position");
      if (!position) continue;
      for (let i = 0; i < position.count; i += 1) {
        this.point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
        this.box.expandByPoint(this.point);
      }
    }
    if (this.box.isEmpty()) {
      return boundsFromBox(new Box3(new Vector3(-100, -100, 0), new Vector3(100, 100, 0)));
    }
    return boundsFromBox(this.box);
  }

  dispose(): void {
    this.clearMeshes();
    this.paperMaterial.dispose();
    this.edgeMaterial.dispose();
    this.root.removeFromParent();
  }

  private addFacet(facet: Facet): void {
    if (facet.polygon.length < 3) return;
    const mesh = new Mesh(facetGeometry(facet.polygon), this.paperMaterial);
    mesh.name = `facet-${facet.id}`;
    mesh.matrixAutoUpdate = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // Deeper layers render first so the coincident-plane stack at the nose
    // resolves front-to-back the way the paper is actually folded.
    mesh.renderOrder = facet.layer;

    const outline = new LineSegments(outlineGeometry(facet.polygon), this.edgeMaterial);
    outline.matrixAutoUpdate = false;
    outline.renderOrder = facet.layer + 1;
    outline.frustumCulled = false;
    mesh.add(outline);

    this.meshes.set(facet.id, mesh);
    this.root.add(mesh);
  }

  private clearMeshes(): void {
    for (const mesh of this.meshes.values()) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      for (const child of mesh.children) {
        if (child instanceof LineSegments) child.geometry.dispose();
      }
      mesh.clear();
    }
    this.meshes.clear();
  }
}

/**
 * The graph-paper stage floor from the mockups: a large plane with a shader-drawn
 * 20mm grid that fades out toward the edges. Patched `MeshStandardMaterial`
 * rather than a raw `ShaderMaterial` so it still receives the key light's shadow.
 */
export function createStageFloorMaterial(theme: StageTheme, fadeRadius: number): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(theme.floor),
    roughness: 1,
    metalness: 0,
    side: DoubleSide,
  });
  const gridColor = new Color(theme.grid);
  const backdrop = new Color(theme.background);

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGridSize = { value: theme.gridSize };
    shader.uniforms.uGridColor = { value: gridColor };
    shader.uniforms.uGridStrength = { value: theme.gridStrength };
    shader.uniforms.uBackdrop = { value: backdrop };
    shader.uniforms.uFadeStart = { value: fadeRadius * 0.35 };
    shader.uniforms.uFadeEnd = { value: fadeRadius };

    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "varying vec3 vStagePos;\nvoid main() {")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n\tvStagePos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;",
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        [
          "varying vec3 vStagePos;",
          "uniform float uGridSize;",
          "uniform vec3 uGridColor;",
          "uniform float uGridStrength;",
          "uniform vec3 uBackdrop;",
          "uniform float uFadeStart;",
          "uniform float uFadeEnd;",
          "void main() {",
        ].join("\n"),
      )
      .replace(
        "#include <color_fragment>",
        [
          "#include <color_fragment>",
          "\tvec2 cell = vStagePos.xy / uGridSize;",
          "\tvec2 aa = fwidth( cell );",
          "\tvec2 gridDist = abs( fract( cell - 0.5 ) - 0.5 ) / max( aa, vec2( 1e-5 ) );",
          "\tfloat lineMask = 1.0 - min( min( gridDist.x, gridDist.y ), 1.0 );",
          "\tdiffuseColor.rgb = mix( diffuseColor.rgb, uGridColor, lineMask * uGridStrength );",
          "\tfloat fade = 1.0 - smoothstep( uFadeStart, uFadeEnd, length( vStagePos.xy ) );",
          "\tdiffuseColor.rgb = mix( uBackdrop, diffuseColor.rgb, fade );",
        ].join("\n"),
      );
  };
  material.customProgramCacheKey = () => `flightschool-stage-floor-${theme.floor}`;
  return material;
}
