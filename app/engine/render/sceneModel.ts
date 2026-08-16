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
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  DoubleSide,
  RepeatWrapping,
  Group,
  LinearFilter,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RGBAFormat,
  SRGBColorSpace,
  ShaderChunk,
  ShaderMaterial,
  Vector3,
  Vector2,
} from "three";
import type { Facet, FoldState, Vec2 } from "@/engine/core/types";
import { DISPLAY_RIG } from "@/engine/view";
import type { PoseMap } from "./coreApi";
import {
  PAPER_NORMAL_SCALE,
  PAPER_ROUGHNESS,
  type PaperTextureSet,
} from "./paperMaterial";


/**
 * Stage palette, in the DESIGN.md cream/ink two-ink system.
 *
 * One palette, not a pair. Night Flight used to supply a second - a deep-navy
 * scene change with a rim light on the paper - and every consumer from the
 * renderer down to the fold-editor carried a theme argument to choose between
 * them. The dark ground the product still has is the Hangar's photographed
 * room, and that is a photograph rather than a palette: the stage draws through
 * to it (`EngineOptions.transparent`) instead of matching it.
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
  readonly paperEdge: number;
  readonly edge: number;
  readonly edgeOpacity: number;
  readonly hemiSky: number;
  readonly hemiGround: number;
  readonly hemiIntensity: number;
  readonly keyColor: number;
  readonly keyIntensity: number;
  readonly displayKeyIntensity: number;
  readonly fillColor: number;
  readonly fillIntensity: number;
  /**
   * The same two lamps on a DISPLAY stage, which is lit for a different job.
   *
   * A tutorial is a diagram: the sheet has to sit unmistakably on its floor at
   * every step, including the first, where it is one flat rectangle lying on a
   * flat plane and only its value separates the two. That wants generous
   * ambient. A finished aircraft is a photograph of an object, and ambient is
   * exactly what stops an object having form - a hemisphere adds the same value
   * to every surface facing up, which is most of a paper aeroplane.
   *
   * Two settings rather than one compromise, because the compromise is what the
   * fleet already looked like.
   */
  readonly displayHemiIntensity: number;
  readonly displayFillIntensity: number;
  readonly rimColor: number;
  /**
   * Zero on this ground, and kept as a field rather than deleted.
   *
   * A rim separates a silhouette from a backdrop, and a light backdrop needs no
   * help - it was Night Flight's dark scene that did. The lamp is still built
   * and still aimed, because the Hangar's photographed room is a dark ground
   * that may yet want one, and a rig missing a lamp is a harder thing to
   * restore than a lamp set to zero.
   */
  readonly rimIntensity: number;
  readonly crease: number;
  readonly shadowOpacity: number;
  /**
   * Display stage only: the two stops of the backdrop that replaces the
   * graph-paper floor, top and bottom. They are the page's own
   * `--color-stage-sky` -> `--color-stage-ground`, which is exactly the CSS
   * gradient the panels around the canvas already use, so a card does not flash
   * when its live scene wakes over the static one. Change both or neither; the
   * reasoning behind the values lives on the tokens in `app/globals.css`.
   */
  readonly displaySky: number;
  readonly displayGround: number;
  /** Ink of the fake contact shadow a display stage casts instead of a real one. */
  readonly contactShadow: number;
};

export const STAGE_THEME: StageTheme = {
  background: 0xefe9da,
  floor: 0xfbf8f0,
  grid: 0x1a2b4a,
  gridStrength: 0.16,
  gridSize: 20,
  paperFront: 0xfdfbf4,
  paperBack: 0xeae2d0,
  paperEdge: 0xd8cfbd,
  edge: 0x1a2b4a,
  edgeOpacity: 0.22,
  hemiSky: 0xf7f3e9,
  hemiGround: 0xd9d2c2,
  hemiIntensity: 0.65,
  keyColor: 0xfff6e2,
  keyIntensity: 2.8,
  displayKeyIntensity: 2.4,
  fillColor: 0xcfe0f0,
  fillIntensity: 0.55,
  // The display rig is shared with the flat SVG - see `DISPLAY_RIG`, which
  // carries the measurements behind these numbers.
  displayHemiIntensity: DISPLAY_RIG.ambient,
  displayFillIntensity: DISPLAY_RIG.fill,
  rimColor: 0xffffff,
  rimIntensity: 0,
  crease: 0xd64541,
  shadowOpacity: 0.22,
  displaySky: 0xf0e7d3,
  displayGround: 0xd8c9a8,
  contactShadow: 0x1a2b4a,
};

/**
 * A tiling paper-fibre map, generated rather than shipped.
 *
 * Green carries the roughness, which is the channel `roughnessMap` reads. The
 * noise is deliberately anisotropic: machine-made paper has its fibres aligned
 * with the direction it came off the roll, which is why a sheet tears cleanly
 * one way and raggedly the other, and it is that faint directional grain rather
 * than random speckle that reads as paper instead of as stucco. What it buys is
 * a broad specular from the key light that varies across a panel, so a large
 * flat area stops being one printed value.
 *
 * This remains the deterministic fallback when the photographic maps cannot
 * be fetched or decoded.
 */
export function createFibreTexture(): DataTexture {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  // Deterministic value noise from an integer hash, not `Math.random`, so the
  // grain is identical in every session and every screenshot comparison.
  const hash = (x: number, y: number): number => {
    let h = (x * 374761393 + y * 668265263) | 0;
    h = (h ^ (h >>> 13)) | 0;
    h = Math.imul(h, 1274126177) | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      // Stretched 6:1 along x, so the fibres run rather than speckle.
      const n = hash(Math.floor(x / 6), y) * 0.65 + hash(Math.floor(x / 2), Math.floor(y / 3)) * 0.35;
      const i = (y * size + x) * 4;
      data[i] = 128;
      // Roughness varies by a few percent around the material's own value.
      data[i + 1] = Math.round(215 + n * 40);
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // UVs are the sheet in units of A4, so this is 14 tiles across 210mm.
  texture.repeat.set(14, 14);
  texture.needsUpdate = true;
  return texture;
}

/**
 * One shared paper material for every facet. `DoubleSide` plus a small shader
 * patch gives the sheet a distinguishable reverse side, so a folded-over facet
 * reads as the back of the paper, and a wrap term stands in for the light that
 * passes through it.
 */
export function createPaperMaterial(theme: StageTheme): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(theme.paperFront),
    roughness: PAPER_ROUGHNESS,
    metalness: 0,
    side: DoubleSide,
    roughnessMap: createFibreTexture(),
    normalScale: new Vector2(PAPER_NORMAL_SCALE, PAPER_NORMAL_SCALE),
  });
  // Thin sheets look wrong with single-sided shadow casting.
  material.shadowSide = DoubleSide;

  const front = new Color(theme.paperFront);
  const relativeTint = (hex: number): Color => {
    const tint = new Color(hex);
    return tint.setRGB(tint.r / front.r, tint.g / front.g, tint.b / front.b);
  };
  const backTint = relativeTint(theme.paperBack);
  const edgeTint = relativeTint(theme.paperEdge);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.backTint = { value: backTint };
    shader.uniforms.edgeTint = { value: edgeTint };
    /**
     * `String.replace` on a shader that no longer contains the anchor returns
     * the shader unchanged and compiles perfectly, so a Three upgrade that
     * renames a chunk would silently drop the paper's back face and its
     * translucency and leave nothing to find but "it looks worse than it did".
     * Every anchor below is a line lifted verbatim from Three's own chunks, so
     * every one of them is exactly that fragile.
     */
    const patch = (source: string, anchor: string, replacement: string): string => {
      if (!source.includes(anchor)) {
        throw new Error(`paper shader patch: Three no longer contains \`${anchor}\``);
      }
      return source.replace(anchor, replacement);
    };
    /**
     * Which side of the SHEET this fragment is on, in paper space.
     *
     * This was `gl_FrontFacing`, which read the winding and so came out right
     * for free while a facet was one infinitely thin quad. A facet is now a
     * closed slab, so every visible surface is a front face and that test would
     * go permanently true: the reverse of the paper would stop being drawn at
     * all, taking most of the separation between one panel and the next with
     * it. The sheet's own normal still knows which way it is looking, and it is
     * carried through the pose because it is the object normal.
     */
    shader.vertexShader = patch(
      patch(shader.vertexShader, "void main() {", "varying vec3 vPaperNormal;\nvoid main() {"),
      "#include <beginnormal_vertex>",
      "#include <beginnormal_vertex>\n\tvPaperNormal = objectNormal;",
    );
    shader.fragmentShader = patch(
      patch(
        patch(
          shader.fragmentShader,
          "void main() {",
          "uniform vec3 backTint;\nuniform vec3 edgeTint;\nvarying vec3 vPaperNormal;\nvoid main() {",
        ),
        "#include <color_fragment>",
        // Multiply rather than replace, so both reverse faces and compressed
        // edge bands keep the fibre and tonal variation from the albedo map.
        "#include <color_fragment>\n\tif ( vPaperNormal.z < -0.3 ) { diffuseColor.rgb *= backTint; } else if ( abs( vPaperNormal.z ) <= 0.3 ) { diffuseColor.rgb *= edgeTint; }",
      ),
      /**
       * Wrap lighting, which is what paper's translucency looks like.
       *
       * A sheet is thin enough that light entering the lit side scatters
       * through and leaves the other, so the terminator between lit and unlit
       * is soft and the shadow side is never black. Replacing
       * `saturate(dot(N,L))` with `(dot(N,L) + w) / (1 + w)` is the standard
       * cheap stand-in for that, and it is the one thing about paper that no
       * arrangement of lamps can imitate: a lamp can fill a shadow, but only
       * translucency softens the terminator itself.
       *
       * Kept low. At 0.5 the fold washes out entirely - the terminator is what
       * tells a cadet that two panels meet at an angle - so this softens the
       * edge without erasing it.
       *
       * `onBeforeCompile` runs BEFORE Three resolves its `#include` directives,
       * so the line this changes is not in the shader yet. The chunk has to be
       * patched and spliced in over its own include - which is also why the
       * guard above earns its keep: patching the resolved text compiles fine
       * and simply does nothing.
       */
      "#include <lights_physical_pars_fragment>",
      patch(
        ShaderChunk.lights_physical_pars_fragment,
        "float dotNL = saturate( dot( geometryNormal, directLight.direction ) );",
        `float dotNL = saturate( ( dot( geometryNormal, directLight.direction ) + ${DISPLAY_RIG.wrap.toFixed(2)} ) / ${(1 + DISPLAY_RIG.wrap).toFixed(2)} );`,
      ),
    );
  };
  material.customProgramCacheKey = () => `flightschool-paper-textured-2side-wrap-${DISPLAY_RIG.wrap}`;
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
 * How thick a sheet is drawn, in mm, and how much of that thickness is turned
 * over as a chamfer at the edge.
 *
 * Slightly under `LAYER_THICKNESS` (0.25mm, the gap the core leaves between
 * stacked layers) so two layers keep air between them and cannot z-fight. The
 * chamfer is what a crease actually is: paper cannot fold to a zero radius, it
 * folds around its own thickness, and that turned edge catching a different
 * value from the faces either side of it is most of what separates a
 * photograph of paper from a render of it.
 */
const SHEET_MM = 0.17;
const CHAMFER_MM = 0.05;

/** Inward unit normal of the edge from `a` to `b`, for a CCW polygon. */
function edgeInward(a: Vec2, b: Vec2): Vec2 | null {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return null;
  return [-dy / len, dx / len];
}

/**
 * The polygon pulled in by `inset`, each vertex moved along the bisector of its
 * two edges.
 *
 * Returns null when the facet is too small to survive it. Crease subdivision
 * produces slivers constantly, and insetting one of those turns it inside out,
 * which draws as a black shard rather than as nothing.
 */
function insetPolygon(ccwPolygon: readonly Vec2[], inset: number): Vec2[] | null {
  const n = ccwPolygon.length;
  const out: Vec2[] = [];
  for (let i = 0; i < n; i += 1) {
    const prev = ccwPolygon[(i - 1 + n) % n]!;
    const cur = ccwPolygon[i]!;
    const next = ccwPolygon[(i + 1) % n]!;
    const m1 = edgeInward(prev, cur);
    const m2 = edgeInward(cur, next);
    if (!m1 || !m2) return null;
    const bx = m1[0] + m2[0];
    const by = m1[1] + m2[1];
    const len = Math.hypot(bx, by);
    // A spike whose two edges double back on each other has no usable bisector.
    if (len < 1e-6) return null;
    const ux = bx / len;
    const uy = by / len;
    // Moving `inset` PERPENDICULAR to both edges means travelling further than
    // that along the bisector, by exactly 1/cos of the half-angle between them.
    const cos = ux * m1[0] + uy * m1[1];
    if (cos < 0.15) return null;
    const t = inset / cos;
    out.push([cur[0] + ux * t, cur[1] + uy * t]);
  }
  // The inset must not have turned the polygon inside out or collapsed it.
  const before = Math.abs(signedArea(ccwPolygon));
  const after = signedArea(out);
  if (after <= 0 || after < before * 0.25) return null;
  return out;
}

/**
 * A facet as a SLAB of paper in PAPER space rather than an infinitely thin
 * sheet: a top face, a bottom face, and a chamfered edge joining them, centred
 * on z=0 so the core's pose matrices still place the sheet's mid-plane exactly
 * where they always did.
 *
 * Zero thickness is a large part of why the fleet read as CG. A knife edge
 * cannot catch a highlight, so every fold met its neighbour in a hard line with
 * no transition and a stack of eight layers at the keel looked like one
 * surface. Giving the sheet its real thickness gets the crease radius for free,
 * because a crease radius IS the paper's thickness - nothing has to model the
 * fold itself.
 *
 * Winding is normalised to counter-clockwise so the +Z normal is the front
 * face. Falls back to the old flat fan for a facet too small to inset, which is
 * a facet far too small to see an edge on anyway.
 */
export function facetGeometry(polygon: readonly Vec2[]): BufferGeometry {
  const ccw = signedArea(polygon) >= 0 ? [...polygon] : [...polygon].reverse();
  const n = ccw.length;
  const half = SHEET_MM / 2;
  const rings = n >= 3 ? insetPolygon(ccw, CHAMFER_MM) : null;
  // The chamfer's own slope, from the two constants above rather than assumed
  // to be 45 degrees: it rises `half` over a run of `CHAMFER_MM`.
  const slope = Math.hypot(half, CHAMFER_MM);
  const chamferOut = half / slope;
  const chamferUp = CHAMFER_MM / slope;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  /**
   * A vertex, with its UV taken from its PAPER-space position in units of A4.
   *
   * The grain therefore belongs to the sheet rather than to a facet: two facets
   * that were one piece of paper before a crease split them still show one
   * continuous run of fibre, and the grain does not swim when a later fold
   * subdivides them again.
   */
  const push = (p: Vec2, z: number, nx: number, ny: number, nz: number): number => {
    const index = positions.length / 3;
    positions.push(p[0], p[1], z);
    normals.push(nx, ny, nz);
    uvs.push(p[0] / 210, p[1] / 297);
    return index;
  };

  if (!rings) {
    const base = ccw.map((p) => push(p, 0, 0, 0, 1));
    for (let i = 1; i < n - 1; i += 1) indices.push(base[0]!, base[i]!, base[i + 1]!);
  } else {
    const top = rings.map((p) => push(p, half, 0, 0, 1));
    for (let i = 1; i < n - 1; i += 1) indices.push(top[0]!, top[i]!, top[i + 1]!);

    const bottom = rings.map((p) => push(p, -half, 0, 0, -1));
    for (let i = 1; i < n - 1; i += 1) indices.push(bottom[0]!, bottom[i + 1]!, bottom[i]!);

    // Two chamfer bands: top ring down to the silhouette, silhouette down to
    // the bottom ring. Their normals point out and up, or out and down, which
    // is what makes a turned edge take a different value from the face it
    // borders instead of vanishing into it.
    for (let i = 0; i < n; i += 1) {
      const j = (i + 1) % n;
      const inward = edgeInward(ccw[i]!, ccw[j]!);
      if (!inward) continue;
      const ox = -inward[0] * chamferOut;
      const oy = -inward[1] * chamferOut;
      for (const [upper, lower, nz] of [
        [half, 0, chamferUp],
        [0, -half, -chamferUp],
      ] as const) {
        const a = upper === 0 ? ccw[i]! : rings[i]!;
        const b = upper === 0 ? ccw[j]! : rings[j]!;
        const c = lower === 0 ? ccw[j]! : rings[j]!;
        const d = lower === 0 ? ccw[i]! : rings[i]!;
        const v0 = push(a, upper, ox, oy, nz);
        const v1 = push(b, upper, ox, oy, nz);
        const v2 = push(c, lower, ox, oy, nz);
        const v3 = push(d, lower, ox, oy, nz);
        // Reversed relative to the top fan: walking the ring the same way round
        // while descending traces the band clockwise seen from outside.
        indices.push(v0, v2, v1, v0, v3, v2);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
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
  /**
   * Whether to draw the navy facet outline.
   *
   * A tutorial wants it: that stage is a diagram, and a cadet is reading which
   * panel just moved. A display stage does not - the sheet now has real
   * thickness, so its edges are lit geometry, and an ink hairline traced over
   * one is both the CG tell and a line fighting the chamfer beneath it for the
   * same pixels.
   */
  private readonly outlines: boolean;
  private readonly meshes = new Map<number, Mesh>();
  private signature = "";
  /** Standing the model up; changes once per step. */
  private readonly rest = new Matrix4();
  /** Where the standing model floats; changes every frame on a display stage. */
  private readonly placement = new Matrix4();
  private readonly scratch = new Matrix4();
  private readonly box = new Box3();
  /** Scratch for the per-vertex bounds walk; avoids an allocation per vertex. */
  private readonly point = new Vector3();

  constructor(theme: StageTheme, outlines = true) {
    this.outlines = outlines;
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

  /** Replace the procedural fallback as one atomic material handoff. */
  applyPaperTextures(textures: PaperTextureSet): void {
    const fallback = this.paperMaterial.roughnessMap;
    this.paperMaterial.map = textures.albedo;
    this.paperMaterial.normalMap = textures.normal;
    this.paperMaterial.roughnessMap = textures.roughness;
    this.paperMaterial.needsUpdate = true;
    if (fallback && fallback !== textures.roughness) fallback.dispose();
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

  /**
   * Stand the model up, as the model group's own matrix.
   *
   * This is the one slot on `root` that nothing else writes, and it is the only
   * place a whole-model transform may live. The core's fold axes are TABLE-space
   * lines and `poseAtProgress` left-multiplies its rotation onto each facet's
   * pose, so a rest transform composed INWARD would leave the facet in rest
   * space while its fold axis stayed in table space, and every fold would turn
   * about the wrong line. A group matrix is outside all of that by construction
   * rather than by discipline.
   *
   * `computeBounds` already forces a world-matrix update and walks posed
   * vertices, so camera framing, the shadow extent and the annotation anchor
   * follow this for free.
   */
  setRest(matrix: readonly number[] | null): void {
    if (matrix && matrix.length >= 16) this.rest.fromArray(matrix as number[]);
    else this.rest.identity();
    this.writeRoot();
  }

  /**
   * Where the standing model sits and how it is banked, composed OVER the rest
   * transform in the same group matrix.
   *
   * Roll is about the aircraft's own longitudinal axis through `pivot`, not
   * about the world origin, so a bank banks instead of swinging the whole plane
   * sideways - the Dart's centre sits 25mm off x=0 and 7mm off y=0, which is
   * plenty to turn a 5-degree roll into a visible slew.
   */
  setPlacement(pivot: Vector3, driftX: number, heightZ: number, bankRad: number): void {
    this.placement
      .makeTranslation(pivot.x + driftX, pivot.y, pivot.z + heightZ)
      .multiply(this.scratch.makeRotationY(bankRad))
      .multiply(this.scratch.makeTranslation(-pivot.x, -pivot.y, -pivot.z));
    this.writeRoot();
  }

  private writeRoot(): void {
    this.root.matrix.multiplyMatrices(this.placement, this.rest);
    this.root.matrixWorldNeedsUpdate = true;
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
    const textures = new Set([
      this.paperMaterial.map,
      this.paperMaterial.normalMap,
      this.paperMaterial.roughnessMap,
    ]);
    textures.forEach((texture) => texture?.dispose());
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

    if (this.outlines) {
      const outline = new LineSegments(outlineGeometry(facet.polygon), this.edgeMaterial);
      outline.matrixAutoUpdate = false;
      outline.renderOrder = facet.layer + 1;
      outline.frustumCulled = false;
      mesh.add(outline);
    }

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
 * The box a DISPLAY stage frames: the model at its neutral height, plus the
 * ground its contact shadow lands on.
 *
 * Without a floor, a lifted plane framed on itself alone puts its own shadow
 * outside the frame. The float is deliberately not included - `framingDistance`
 * already carries 15% air and the bob is a few percent of the radius, and a
 * camera that re-framed with the breathing is the thing that would look wrong.
 */
export function displayBounds(bounds: ModelBounds, liftMm: number): ModelBounds {
  const min = bounds.min.clone().setZ(0);
  const max = bounds.max.clone().setZ(bounds.max.z + liftMm);
  return boundsFromBox(new Box3(min, max));
}

/**
 * The display backdrop: a vertical grade where the graph-paper floor was.
 *
 * It has to be drawn in GL rather than left to CSS. The canvas is created with
 * `alpha: false`, so nothing behind it is ever visible - the panel gradients in
 * OrbitViewer and FoldStage have never once shown through. Assigning it to
 * `scene.background` is the cheapest surface there is: Three draws a plain
 * texture as a screen-space quad, and an sRGB one is not tone-mapped, so the
 * two stops land on exactly the hexes the design system names.
 *
 * A 1-D vertical ramp stretched over any aspect is still a vertical ramp, so
 * this needs no resize hook.
 */
export function createBackdropTexture(theme: StageTheme): DataTexture {
  const height = 128;
  // `new Color(hex)` decodes an sRGB hex into the LINEAR working space, so the
  // mix below is a mix of light rather than of screen values - which is what
  // keeps a two-stop grade from going muddy through its middle. The bytes must
  // then be encoded back, because the texture is declared sRGB: writing the
  // linear numbers straight out darkened both stops by about ten values and
  // silently missed the hexes the design system names.
  const sky = new Color(theme.displaySky);
  const ground = new Color(theme.displayGround);
  const mixed = new Color();
  const encoded = { r: 0, g: 0, b: 0 };
  const data = new Uint8Array(height * 4);
  for (let i = 0; i < height; i += 1) {
    // v=0 is the BOTTOM of the quad, so the ground stop belongs at i=0.
    const v = i / (height - 1);
    // Smoothstep rather than linear: the grade concentrates low, which reads as
    // light falling off toward a ground rather than as a two-colour wash.
    const k = v * v * (3 - 2 * v);
    mixed.copy(ground).lerp(sky, k).getRGB(encoded, SRGBColorSpace);
    data[i * 4] = Math.round(encoded.r * 255);
    data[i * 4 + 1] = Math.round(encoded.g * 255);
    data[i * 4 + 2] = Math.round(encoded.b * 255);
    data[i * 4 + 3] = 255;
  }
  const texture = new DataTexture(data, 1, height, RGBAFormat);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * The contact shadow a display stage casts instead of a real one.
 *
 * Deliberately fake. A hangar card renders at `quality: "preview"`, where
 * shadow mapping is switched off outright - that is the whole reason the
 * preview tier exists, because a depth pass is the most expensive thing this
 * stage could ask a mid-range phone for. One alpha-blended ellipse costs
 * nothing and, at this size and softness, is not distinguishable from the real
 * thing anyway.
 *
 * A raw `ShaderMaterial` rather than a patched `MeshBasicMaterial`: it wants no
 * lights, no fog and no tone mapping, and the whole fragment shader is shorter
 * than the patch would be.
 */
export class ContactShadow {
  readonly mesh: Mesh;
  private readonly material: ShaderMaterial;
  private readonly base: number;

  constructor(theme: StageTheme) {
    this.base = theme.shadowOpacity;
    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new Color(theme.contactShadow) },
        uOpacity: { value: theme.shadowOpacity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float d = length( vUv - 0.5 ) * 2.0;
          // Two terms: a tight core where the keel almost touches, and a wide
          // soft pool that stands in for the bounce the floor used to give.
          float core = 1.0 - smoothstep( 0.0, 0.85, d );
          float halo = 1.0 - smoothstep( 0.0, 1.0, d );
          gl_FragColor = vec4( uColor, uOpacity * ( core * 0.72 + halo * 0.28 ) );
        }
      `,
    });
    this.mesh = new Mesh(new PlaneGeometry(1, 1), this.material);
    this.mesh.name = "contact-shadow";
    this.mesh.renderOrder = -1;
    this.mesh.frustumCulled = false;
    // Clear of z=0 by a hair, so it never fights the rested model for the
    // ground plane they both claim.
    this.mesh.position.z = 0.1;
  }

  private width = 1;
  private depth = 1;

  /**
   * Sit under the model and take its footprint, plus a spread so the pool
   * reaches past the wings the way a soft light's would. Called on a step
   * change, never per frame.
   */
  fit(bounds: ModelBounds, offsetX: number, offsetY: number, spreadMm: number): void {
    this.width = bounds.max.x - bounds.min.x + spreadMm;
    this.depth = bounds.max.y - bounds.min.y + spreadMm;
    this.mesh.position.x = bounds.center.x + offsetX;
    this.mesh.position.y = bounds.center.y + offsetY;
    this.mesh.scale.set(this.width, this.depth, 1);
  }

  /**
   * Answer to the plane's height. `u` is where it sits in its bob, -1 at the
   * bottom and +1 at the top. Higher reads as wider and fainter, which is what
   * tells a viewer the plane rose rather than that it grew.
   */
  follow(u: number): void {
    const clamped = Math.max(-1, Math.min(1, u));
    this.material.uniforms.uOpacity!.value = this.base * (1 - 0.28 * clamped);
    const k = 1 + 0.1 * clamped;
    this.mesh.scale.x = this.width * k;
    this.mesh.scale.y = this.depth * k;
  }

  /** Current alpha at the pool's centre, for tests. */
  get opacity(): number {
    return this.material.uniforms.uOpacity!.value as number;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.mesh.removeFromParent();
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
