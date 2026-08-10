import { describe, it } from "vitest";
import { computeFoldState, computeStepDelta } from "@/engine/core/state";
import { poseAtProgress, transformPoint } from "@/engine/core/pose";
import { PLANES } from "@/content";

describe("mid-fold sweep", () => {
  it("min z through every step", () => {
    for (const [id, structure] of Object.entries(PLANES)) {
      console.log(`--- ${id}`);
      for (let i = 0; i < structure.steps.length; i += 1) {
        const prev = computeFoldState(structure, i - 1);
        const delta = computeStepDelta(structure, i) as any;
        if (!delta) continue;
        let minZ = Infinity, maxZ = -Infinity;
        for (let k = 0; k <= 24; k += 1) {
          const poses = poseAtProgress(prev, delta, k / 24);
          for (const facet of prev.facets) {
            const m = poses.get(facet.id);
            if (!m) continue;
            for (const p of facet.polygon) {
              const z = transformPoint(m, p)[2];
              minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
            }
          }
        }
        const a = (structure.steps[i] as any).action;
        const dir = a.crease ? [a.crease.b[0] - a.crease.a[0], a.crease.b[1] - a.crease.a[1]] : null;
        console.log(
          `  ${String(i + 1).padStart(2)} ${a.type.padEnd(7)} ${(a.direction ?? "-").padEnd(8)} side=${(a.side ?? "-").padEnd(5)} ` +
          `creaseDir=${dir ? `(${dir[0].toFixed(0)},${dir[1].toFixed(0)})`.padEnd(14) : "-".padEnd(14)} ` +
          `deltaAngle=${String(delta.angleDeg).padStart(5)} sweep z[${minZ.toFixed(0).padStart(5)},${maxZ.toFixed(0).padStart(5)}] ${minZ < -1 ? "  <-- THROUGH THE TABLE" : ""}`,
        );
      }
    }
  });
});
