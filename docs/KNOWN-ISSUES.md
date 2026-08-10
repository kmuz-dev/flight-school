# Known issues

Defects found and confirmed, with the evidence gathered, so the next session starts from what is known rather than from the symptom.
Fixed issues are removed from this file; the commit that fixes one says so.

## The finished plane is small on the 3D stage, and the framing maths disagrees with the render

**Where:** the preflight hero (`app/components/preflight/OrbitViewer.tsx`) and the last steps of the tutorial stage.
**Symptom:** a finished plane occupies roughly 15% of the stage width. It reads as a speck in an empty room rather than as the hero of the screen.

**Measured, on `/en/plane/dart/` at a 1440x1100 viewport (desktop chromium, static export):**

- The camera sits 853mm from its target, with a 34 degree vertical FOV and a 0.94 aspect. That makes the visible frame 526mm wide and 494mm tall at the target plane.
- `SceneModel.computeBounds()` reports the posed model as x[-88, 112], y[-148, 162], z[-86, 86] - 200 x 310 x 172mm.
- Dumping every facet mesh's world-space box individually agrees: each one spans the full sheet length, and four carry the wing bend out to z = +/-86.
- A 310mm model in a 526mm frame should fill roughly 40% of the width even after the 3/4 view's foreshortening. It fills about 15%.

**What this rules out:**

- Not a stale bounding box. `SceneModel.addFacet` sets `matrixAutoUpdate = false`, geometries are rebuilt whenever the facet set changes, and `computeBounds` recomputes each `geometry.boundingBox` on demand.
- Not a stage transform. Neither `stage` nor `model.root` carries a scale, position or rotation.
- Not the camera failing to move. The measured camera distance matches `defaultDistance` exactly, so `refit()` and the camera tween are doing what they claim.

**What it leaves:** the world-space box and the rendered silhouette genuinely disagree by roughly a factor of three, and the cause is not yet identified. Everything downstream of the box - camera framing, the shadow-camera extent, the annotation anchor height - is being computed from a model measurement that does not describe what is on screen.

**Attempted and reverted:** an `EngineOptions.fitToModel` flag plus a `framingDistanceForBox` solve that frames the box's silhouette along the camera's own axes instead of the sphere around it. The maths is right (it was checked by hand against the logged extents) and it did move the camera, but it barely changed the rendered size - which is the evidence above. It was reverted rather than shipped: an unverified change to shared camera geometry, added at a gate close, is worse than the defect it does not fix.

**Related observation, not yet judged:** the finished Dart reaches 86mm below the table (z = -86). Paper below the table is not a thing. The wing pair opens by rotating one layer up and the other down about the same crease, which is what `layers: "top"` / `"bottom"` is for, but nothing then rests the finished plane on the table. Whether that is a defect or just an unmodelled convention should be settled before the physical fold test at Gate 4.

**Why this is more than cosmetic.** In V1 the cost is a hero shot that does not fill its stage. The proposed V2 raises the stakes: [ADR 0002](adr/0002-flight-simulation-walled-exception.md) derives every aerodynamic parameter from this same finished geometry - planform area and span from the final pose projected onto the ground plane, dihedral from the bend angle on the wing facets - and derives them precisely so that no plane carries a hand-tuned coefficient. A final pose that is wrong by a factor of three in world space, or that puts half the aircraft under the table, would produce wrong physics silently, and the check ADR 0002 is proudest of - simulated flight ranking the fleet consistently with its authored ratings - would be measuring the defect rather than the content. This should be resolved before any V2 work starts, not because V1 needs it urgently but because V2 cannot start on top of it.
