# Known issues

Defects found and confirmed, with the evidence gathered, so the next session starts from what is known rather than from the symptom.
Fixed issues are removed from this file; the commit that fixes one says so.

## The Hammer's keel and fin render as a stippled hatch

**Where.** Any surface showing the finished Hammer, worst on the preflight hero at the default three-quarter angle: a fine regular diagonal hatch along the keel and across the outward face of the fin, roughly where the plane's six-layer nose is.
Present on the other five planes only faintly.

**Not caused by the paper-thickness change.** It is on renders taken before `1db6e6f`, with flat zero-thickness quads, in the same two places.

**What has been ruled out, by measurement.**

- *Depth-buffer precision.* The frustum was 1mm to 20000mm on a model 600mm away, leaving about 0.02mm of depth resolution where the paper is, against a 0.08mm gap between stacked layer surfaces. Binding near and far to the model's bounding sphere (in `refit`) improved that by roughly two orders of magnitude. The hatch is unchanged, so this was a real defect but not this one - the fix is kept on its own merits.
- *Coincident facets.* A probe over all six planes' finished states, comparing every pair of facets by plane normal, plane offset and centroid distance, found **zero** pairs that are coplanar to within 0.001 of a unit normal, overlapping within 40mm, and closer than 0.2mm - at the same layer or at any other. The geometry does not put two surfaces in one place.
- *The ink outline.* Display stages stopped drawing it in `1db6e6f`; the hatch survives without it.
- *The shadow map.* Display stages set `castShadow = false`, so there is no depth pass to acne.
- *Sub-pixel geometry alone.* Rendering with `SHEET_MM` at 0.9 and `CHAMFER_MM` at 0.26, five times life size, scaled the hatch up with the geometry rather than resolving it.

**The remaining hypothesis, untested.** The Hammer's finished state carries 96 facets, many of them long slivers left by rolling the nose back on itself twice, and at the hero angle a stack of six or eight of them is seen almost edge-on. If each is a fraction of a pixel wide, 4x MSAA cannot separate them and the result is exactly this hatch - legitimately dense geometry, aliasing, rather than two surfaces fighting.
The way to settle it is to render one frame at eight times the pixel ratio and downsample: if the hatch resolves into distinct laminations it is aliasing, and if it survives it is not.

The three entries opened at Gate 3 are all closed.
Three.js left the first-paint bundle when `@/engine` stopped statically importing the renderer and started fetching it through `loadFoldEngine()`; the tutorial's total blocking time fell from 9.4 s to 0.63 s and every screen's Lighthouse performance score rose by 20 to 37 points.
The tutorial's progress strip now meets WCAG 2.5.8 by geometry rather than by exception - the segments are 24 px square and claim their own row on a phone - and `tests/e2e/a11y.spec.ts` measures all twelve so it cannot quietly shrink again.
The third was never a defect but a warning about the measuring instrument, and it now lives where it is useful rather than in a defect log: `tests/e2e/hangar-perf.spec.ts` and `tests/e2e/vitals.spec.ts` both explain, at the point of use, why a wall-clock budget in a headless run reports on the CPU that ran it and why only CLS is asserted.
