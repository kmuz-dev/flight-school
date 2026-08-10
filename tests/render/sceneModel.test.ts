import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { BufferGeometry, LineSegments, Material, Matrix4, Mesh, SRGBColorSpace, Vector3 } from "three";
import {
  ContactShadow,
  SceneModel,
  createBackdropTexture,
  displayBounds,
  facetGeometry,
  facetSignature,
  stageTheme,
  unionBounds,
} from "@/engine/render/sceneModel";
import { createCoreStub, LAYER_Z_MM, makeStructure } from "@/engine/render/__contracts__/coreStub";
import type { Vec2 } from "@/engine/core/types";

const SQUARE_CCW: readonly Vec2[] = [
  [-10, -10],
  [10, -10],
  [10, 10],
  [-10, 10],
];
const SQUARE_CW: readonly Vec2[] = [...SQUARE_CCW].reverse();

describe("facetGeometry", () => {
  it("fan-triangulates a convex polygon in the z=0 plane of paper space", () => {
    const geometry = facetGeometry(SQUARE_CCW);
    expect(geometry.getAttribute("position").count).toBe(4);
    expect(geometry.getIndex()?.count).toBe(6); // (n - 2) triangles
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i += 1) expect(positions.getZ(i)).toBe(0);
  });

  it("normalises winding so the +Z normal is always the front face", () => {
    const ccw = facetGeometry(SQUARE_CCW).getIndex()?.array;
    const cw = facetGeometry(SQUARE_CW).getIndex()?.array;
    expect(ccw).toBeDefined();
    expect(cw).toBeDefined();
    // Same triangles, opposite traversal order: the CW polygon gets flipped.
    expect(Array.from(cw as ArrayLike<number>)).not.toEqual(Array.from(ccw as ArrayLike<number>));
    const normals = facetGeometry(SQUARE_CW).getAttribute("normal");
    for (let i = 0; i < normals.count; i += 1) expect(normals.getZ(i)).toBe(1);
  });
});

describe("facetSignature", () => {
  it("changes when the facet set changes and holds when only poses change", () => {
    const core = createCoreStub();
    const structure = makeStructure(3);
    const a = core.computeFoldState(structure, 0);
    const b = core.computeFoldState(structure, 0);
    const c = core.computeFoldState(structure, 1);
    expect(facetSignature(a)).toBe(facetSignature(b));
    expect(facetSignature(a)).not.toBe(facetSignature(c));
  });
});

describe("unionBounds", () => {
  const bounds = (min: [number, number, number], max: [number, number, number]) => ({
    min: new Vector3(...min),
    max: new Vector3(...max),
    center: new Vector3(),
    radius: 1,
  });

  it("covers both boxes and leaves its operands alone", () => {
    const a = bounds([-10, 0, 0], [10, 5, 1]);
    const b = bounds([-2, -30, -4], [2, 30, 4]);
    const union = unionBounds(a, b);

    expect(union.min.toArray()).toEqual([-10, -30, -4]);
    expect(union.max.toArray()).toEqual([10, 30, 4]);
    expect(union.center.toArray()).toEqual([0, 0, 0]);
    // Three's Box3 keeps the vectors it is handed, so a careless union writes
    // through to the caller's bounds.
    expect(a.min.toArray()).toEqual([-10, 0, 0]);
    expect(b.max.toArray()).toEqual([2, 30, 4]);
  });
});

describe("displayBounds", () => {
  it("frames the lifted model together with the ground its shadow lands on", () => {
    const raw = {
      min: new Vector3(-100, -150, 0),
      max: new Vector3(100, 150, 40),
      center: new Vector3(0, 0, 20),
      radius: 200,
    };
    const framed = displayBounds(raw, 60);

    // A lifted plane framed on itself alone puts its own shadow off-screen.
    expect(framed.min.z).toBe(0);
    expect(framed.max.z).toBe(100);
    expect(framed.min.x).toBe(-100);
    expect(framed.max.y).toBe(150);
    expect(raw.max.z).toBe(40); // operand untouched
  });

  it("keeps the ground in frame even when the model already sits below z=0", () => {
    // Only the tutorial's last step lifts, and it lifts a rested model - but a
    // stage told to lift something that still straddles the table must not
    // crop the ground away, because the shadow is drawn at z=0 regardless.
    const framed = displayBounds(
      { min: new Vector3(-5, -5, -30), max: new Vector3(5, 5, 10), center: new Vector3(), radius: 1 },
      20,
    );
    expect(framed.min.z).toBe(0);
    expect(framed.max.z).toBe(30);
  });
});

describe("createBackdropTexture", () => {
  it("grades from the ground stop at the bottom to the sky stop at the top", () => {
    const theme = stageTheme("paper");
    const texture = createBackdropTexture(theme);
    const data = texture.image.data as Uint8Array;

    expect(texture.image.width).toBe(1);
    expect(texture.image.height).toBe(128);
    // sRGB, because Three does NOT tone-map a background texture: these two
    // land on exactly the hexes the design system names.
    expect(texture.colorSpace).toBe(SRGBColorSpace);

    const row = (i: number): number => (data[i * 4]! << 16) | (data[i * 4 + 1]! << 8) | data[i * 4 + 2]!;
    // v=0 is the BOTTOM of the screen quad, so the ground stop belongs at i=0.
    expect(row(0)).toBe(theme.displayGround);
    expect(row(127)).toBe(theme.displaySky);

    texture.dispose();
  });

  it("rises monotonically, so the grade never bands", () => {
    const texture = createBackdropTexture(stageTheme("night"));
    const data = texture.image.data as Uint8Array;
    for (let i = 1; i < 128; i += 1) {
      expect(data[i * 4]!).toBeGreaterThanOrEqual(data[(i - 1) * 4]!);
    }
    texture.dispose();
  });
});

/**
 * The backdrop is declared twice - once in GL for the live stage, once in CSS
 * for the still card underneath it - and it has to be the same picture, because
 * a hangar card wakes its scene under the pointer and a mismatch reads as a
 * flash. It also has to stay clear of the paper's own value, which is the
 * defect this pair of tests exists to prevent coming back: the ground used to
 * be #FFFFFF -> #F7F3E9, white paper renders around #F2F0EA, and the fleet
 * looked washed out because the aircraft and the ground were the same colour.
 */
describe("the display ground", () => {
  const CSS = readFileSync(path.resolve(import.meta.dirname, "../../app/globals.css"), "utf8");

  /** A token's hex, as a number, from the block starting at `blockStart`. */
  function token(blockStart: number, name: string): number {
    const at = CSS.indexOf(`${name}:`, blockStart);
    if (at < 0) throw new Error(`no ${name} after index ${blockStart}`);
    const value = CSS.slice(at + name.length + 1, CSS.indexOf(";", at)).trim();
    const hex = /^#([0-9a-f]{6})$/i.exec(value);
    if (!hex) throw new Error(`${name} is not a plain hex: ${value}`);
    return parseInt(hex[1]!, 16);
  }

  it.each([
    ["paper", "@theme"],
    ["night", ".night"],
  ] as const)("matches the CSS the still card paints, in %s", (name, block) => {
    const start = CSS.indexOf(block);
    expect(start).toBeGreaterThanOrEqual(0);
    const theme = stageTheme(name);
    expect(token(start, "--color-stage-sky")).toBe(theme.displaySky);
    expect(token(start, "--color-stage-ground")).toBe(theme.displayGround);
  });

  // Relative luminance, the same measure DESIGN.md's contrast rule uses.
  const luminance = (hex: number): number =>
    [16, 8, 0]
      .map((shift) => ((hex >> shift) & 255) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i]!, 0);

  /** What a lit white sheet actually renders as, sampled off the display stage. */
  const PAPER_ON_SCREEN = luminance(0xf2f0ea);
  const contrast = (a: number, b: number): number =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  it.each(["paper", "night"] as const)("stays darker than the paper at both stops, in %s", (name) => {
    const theme = stageTheme(name);
    // The sign is the load-bearing half, and it is what the old ground got
    // wrong: its sky stop was pure white, BRIGHTER than the lit paper, while
    // its ground stop was fractionally darker. An aircraft whose ground crosses
    // its own value from one side of the frame to the other has no silhouette
    // anywhere in between, however the lamps are set.
    expect(luminance(theme.displaySky)).toBeLessThan(PAPER_ON_SCREEN);
    expect(luminance(theme.displayGround)).toBeLessThan(luminance(theme.displaySky));
  });

  it.each(["paper", "night"] as const)("separates where the aircraft sits, in %s", (name) => {
    const ground = luminance(stageTheme(name).displayGround);
    // Not a text ratio. The plane floats low in the frame and its shadow lands
    // on the ground stop, so that is the stop that has to carry the reading.
    // Kraft scores 1.44 and Night Flight 15.9; the ground this replaced managed
    // 1.03, which is another way of saying the plane was invisible.
    expect(contrast(ground, PAPER_ON_SCREEN)).toBeGreaterThan(1.35);
  });
});

describe("ContactShadow", () => {
  const bounds = {
    min: new Vector3(-80, -150, 0),
    max: new Vector3(80, 150, 40),
    center: new Vector3(0, 0, 20),
    radius: 200,
  };

  it("takes the model's footprint plus a spread, offset toward where the light is not", () => {
    const shadow = new ContactShadow(stageTheme("paper"));
    shadow.fit(bounds, 12, -7, 30);

    expect(shadow.mesh.scale.x).toBeCloseTo(190, 9); // 160 wide + 30 spread
    expect(shadow.mesh.scale.y).toBeCloseTo(330, 9); // 300 deep + 30 spread
    expect(shadow.mesh.position.x).toBeCloseTo(12, 9);
    expect(shadow.mesh.position.y).toBeCloseTo(-7, 9);
    // Clear of z=0 by a hair so it never fights the rested model for the ground.
    expect(shadow.mesh.position.z).toBeGreaterThan(0);
    expect(shadow.mesh.position.z).toBeLessThan(1);

    shadow.dispose();
  });

  /**
   * The one thing that tells a viewer the plane ROSE rather than that it grew.
   * If the pool held still, the lift would read as a zoom.
   */
  it("goes wider and fainter as the plane rises, and exact at neutral", () => {
    const theme = stageTheme("paper");
    const shadow = new ContactShadow(theme);
    shadow.fit(bounds, 0, 0, 0);

    shadow.follow(0);
    expect(shadow.opacity).toBe(theme.shadowOpacity);
    const neutralWidth = shadow.mesh.scale.x;

    shadow.follow(1);
    const top = shadow.opacity;
    expect(top).toBeLessThan(theme.shadowOpacity);
    expect(shadow.mesh.scale.x).toBeGreaterThan(neutralWidth);

    shadow.follow(-1);
    expect(shadow.opacity).toBeGreaterThan(theme.shadowOpacity);
    expect(shadow.mesh.scale.x).toBeLessThan(neutralWidth);

    // Scale reads from the fitted footprint every time, never from the last
    // frame's scale - otherwise the pool would ratchet outward as it breathes.
    shadow.follow(0);
    expect(shadow.mesh.scale.x).toBe(neutralWidth);
    expect(shadow.opacity).toBe(theme.shadowOpacity);

    shadow.dispose();
  });

  it("clamps, so a stage that overdrives it cannot invert the pool", () => {
    const shadow = new ContactShadow(stageTheme("night"));
    shadow.follow(50);
    const far = shadow.opacity;
    shadow.follow(1);
    expect(shadow.opacity).toBe(far);
    expect(far).toBeGreaterThan(0);
    shadow.dispose();
  });
});

describe("SceneModel", () => {
  const theme = stageTheme("paper");

  it("builds one mesh per facet and rebuilds only when the facet set changes", () => {
    const core = createCoreStub();
    const structure = makeStructure(3);
    const model = new SceneModel(theme);

    const step0 = core.computeFoldState(structure, 0);
    expect(model.sync(step0)).toBe(true);
    expect(model.facetIds()).toEqual([0, 1]);

    // Same facet set: no rebuild.
    expect(model.sync(core.computeFoldState(structure, 0))).toBe(false);

    // New step splits a facet: rebuild.
    expect(model.sync(core.computeFoldState(structure, 1))).toBe(true);
    expect(model.facetIds()).toEqual([0, 1, 2]);

    model.dispose();
  });

  it("writes matrices only on a pose update, leaving geometry untouched", () => {
    const core = createCoreStub();
    const structure = makeStructure(2);
    const model = new SceneModel(theme);
    const state = core.computeFoldState(structure, 0);
    model.sync(state);

    const mesh = model.root.children[0] as Mesh;
    const geometry = mesh.geometry;
    // Meshes are matrix-driven: Three must not recompose from position/quaternion.
    expect(mesh.matrixAutoUpdate).toBe(false);

    model.applyPoses(core.poseAtProgress(structure, 0, 0.5));
    expect(mesh.matrix.elements[12]).toBeCloseTo(50, 5);
    expect(mesh.geometry).toBe(geometry);

    model.applyPoses(core.posesForState(state));
    expect(mesh.matrix.elements[12]).toBe(1000);
    // Layer z-offset comes from the core pose; the renderer never adds its own.
    const second = model.root.children[1] as Mesh;
    expect(second.matrix.elements[14]).toBeCloseTo(LAYER_Z_MM, 6);

    model.dispose();
  });

  it("ignores poses for facets it does not have", () => {
    const core = createCoreStub();
    const structure = makeStructure(2);
    const model = new SceneModel(theme);
    model.sync(core.computeFoldState(structure, 0));
    expect(() => model.applyPoses(new Map([[999, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 5, 5, 1]]]))).not.toThrow();
    model.dispose();
  });

  it("reports world bounds from the posed paper", () => {
    const core = createCoreStub();
    const structure = makeStructure(2);
    const model = new SceneModel(theme);
    const state = core.computeFoldState(structure, 0);
    model.sync(state);
    model.applyPoses(core.poseAtProgress(structure, 0, 0));

    const bounds = model.computeBounds();
    expect(bounds.radius).toBeGreaterThan(50);
    expect(bounds.max.z).toBeCloseTo(LAYER_Z_MM, 5);

    model.dispose();
  });

  /**
   * The bounds must describe the paper, not a box around a box around it.
   *
   * `Box3.applyMatrix4` re-fits an axis-aligned box around the eight transformed
   * corners of the local one, and a facet's local box is a rectangle around a
   * polygon lying flat in paper space. Rotate that rectangle into a fold and its
   * corners sweep past the paper they were drawn around; on the finished Dart
   * that reported the model as 200 x 310 x 172mm against an actual 57 x 310 x
   * 72, and every consumer - camera framing, the shadow camera, the annotation
   * anchor - was aimed at a plane three times wider than the one on screen. A
   * single rotated facet reproduces it, so this pins the vertex walk rather than
   * the plane that happened to expose it.
   */
  it("measures the paper itself, not the box swept by a rotated bounding box", () => {
    // A right triangle, because a rectangle cannot show the defect: its local
    // bounding box *is* the polygon, so rotating either gives the same answer.
    // A triangle fills half its box, and the empty half is what the box method
    // rotates into the result.
    const model = new SceneModel(theme);
    model.sync({
      facets: [
        {
          id: 0,
          polygon: [
            [0, 0],
            [100, 0],
            [0, 100],
          ],
          flatMap: [1, 0, 0, 0, 1, 0],
          layer: 0,
          bend: [],
        },
      ],
      creaseMarks: [],
      maxLayer: 0,
    });

    // 45 degrees about z, column-major as Three stores it.
    const c = Math.SQRT1_2;
    model.applyPoses(new Map([[0, [c, c, 0, 0, -c, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]]]));

    // Vertices land on x[-70.7, 70.7], y[0, 70.7]: a 141.4 x 70.7 box, whose
    // half-diagonal is 79.06. The box method rotates the triangle's empty
    // corner too, reaching y = 141.4 and reporting 100.
    const bounds = model.computeBounds();
    expect(bounds.radius).toBeCloseTo(79.06, 1);
    expect(bounds.radius).toBeLessThan(90);

    model.dispose();
  });

  /**
   * The composition order the whole standing-up change rests on.
   *
   * `root.matrix` is `placement * rest`, in that order and nowhere else. The
   * rest transform rolls the model about 85 degrees onto its belly, so
   * composing the two the other way round would carry the lift along with that
   * roll and slide the plane sideways instead of raising it - which looks like
   * a framing bug rather than a matrix bug, and is why it gets its own test.
   */
  it("lifts the model along world +Z however far the rest transform rolled it", () => {
    const model = new SceneModel(theme);
    // A quarter turn about Y: world +Z came from -X. If rest were applied last,
    // a +10 lift would come out along one of those instead.
    const rest = new Matrix4().makeRotationY(Math.PI / 2);
    model.setRest([...rest.elements]);

    const pivot = new Vector3(3, 4, 5);
    model.setPlacement(pivot, 0, 10, 0);

    const marker = new Vector3(1, 2, 3);
    const rested = marker.clone().applyMatrix4(rest);
    const placed = marker.clone().applyMatrix4(model.root.matrix);
    expect(placed.x).toBeCloseTo(rested.x, 9);
    expect(placed.y).toBeCloseTo(rested.y, 9);
    expect(placed.z).toBeCloseTo(rested.z + 10, 9);

    model.dispose();
  });

  it("banks about the aircraft's own axis, not about the world origin", () => {
    const model = new SceneModel(theme);
    model.setRest(null);

    // The Dart's centre sits 25mm off x=0, which is plenty to turn a 5-degree
    // roll into a visible slew if the rotation is taken about the origin.
    const pivot = new Vector3(25, 7, 40);
    model.setPlacement(pivot, 0, 0, Math.PI / 8);

    const held = pivot.clone().applyMatrix4(model.root.matrix);
    expect(held.x).toBeCloseTo(pivot.x, 9);
    expect(held.y).toBeCloseTo(pivot.y, 9);
    expect(held.z).toBeCloseTo(pivot.z, 9);

    // And it is a roll, not a yaw: a point offset along the fuselage (+y) does
    // not move, a point out on a wing (+x) does.
    const onNose = pivot.clone().add(new Vector3(0, 100, 0));
    expect(onNose.clone().applyMatrix4(model.root.matrix).distanceTo(onNose)).toBeCloseTo(0, 9);
    const onWing = pivot.clone().add(new Vector3(100, 0, 0));
    expect(onWing.clone().applyMatrix4(model.root.matrix).distanceTo(onWing)).toBeGreaterThan(1);

    model.dispose();
  });

  it("setRest(null) is the identity, so a tutorial stage pays nothing for it", () => {
    const model = new SceneModel(theme);
    model.setRest(null);
    model.setPlacement(new Vector3(9, 9, 9), 0, 0, 0);
    expect(model.root.matrix.elements).toEqual(new Matrix4().elements);
    // A short array is refused rather than half-read: a core that returned a
    // 3x3 by mistake would otherwise scramble the stage silently.
    model.setRest([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(model.root.matrix.elements).toEqual(new Matrix4().elements);
    model.dispose();
  });

  it("dispose() releases every geometry and material it created", () => {
    const core = createCoreStub();
    const structure = makeStructure(2);
    const model = new SceneModel(theme);
    model.sync(core.computeFoldState(structure, 0));

    const geometries: BufferGeometry[] = [];
    const materials = new Set<Material>();
    model.root.traverse((object) => {
      if (object instanceof Mesh || object instanceof LineSegments) {
        geometries.push(object.geometry);
        const material = object.material;
        if (Array.isArray(material)) material.forEach((m) => materials.add(m));
        else materials.add(material);
      }
    });
    expect(geometries.length).toBe(4); // 2 facets x (mesh + outline)
    expect(materials.size).toBe(2); // one shared paper material, one shared edge material

    const geometrySpies = geometries.map((g) => vi.spyOn(g, "dispose"));
    const materialSpies = [...materials].map((m) => vi.spyOn(m, "dispose"));

    model.dispose();

    for (const spy of geometrySpies) expect(spy).toHaveBeenCalledTimes(1);
    for (const spy of materialSpies) expect(spy).toHaveBeenCalledTimes(1);
    expect(model.facetIds()).toEqual([]);
    expect(model.root.children.length).toBe(0);
  });
});
