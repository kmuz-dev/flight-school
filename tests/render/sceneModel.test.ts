import { describe, expect, it, vi } from "vitest";
import { BufferGeometry, LineSegments, Material, Mesh, Vector3 } from "three";
import {
  SceneModel,
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
