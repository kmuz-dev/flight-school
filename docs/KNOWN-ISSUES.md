# Known issues

Defects found and confirmed, with the evidence gathered, so the next session starts from what is known rather than from the symptom.
Fixed issues are removed from this file; the commit that fixes one says so.

## The stage rasterises a motionless aeroplane at 60fps

**Where.** `FoldRenderer.startLoop` in `app/engine/render/renderer.ts`, so every live stage: the Tutorial, and the Hangar bay while inspecting.

**What.** The loop has no dirty check.
It calls `renderFrame` and re-arms unconditionally for as long as `renderActive` is true, whether or not anything has moved - a settled fold under `prefers-reduced-motion`, with no orbit in progress and no breathing, is redrawn sixty times a second until the stage goes offscreen or the document is hidden.

**Evidence.** `tests/e2e/layout.spec.ts` sits on the tutorial for up to three minutes, and on a two-core CI runner under SwiftShader the page stopped answering: the desktop width failed all three attempts at three different lines, including a bare `page.evaluate`, which is a pegged main thread rather than a hang.
Serialising the three viewport walks takes the contention out and is what makes that spec reliable today, so this is mitigated in the suite and unfixed at the source.

**Why it matters beyond CI.** There is no GPU in this loop on a CI runner, and there is one on a cadet's laptop - but a still aeroplane redrawn continuously is still a fan, a warm palm and a shortened battery, on the screen a beginner spends the longest on.
PRD acceptance criterion 8 asks the renderer to pause offscreen and when hidden, which it does; this is the same argument one step further in.

**The fix, when someone takes it.** Render on demand: mark dirty on pose change, camera change, resize, material load and control damping, and let the loop idle otherwise.
The care is in the things that must keep it alive - OrbitControls damping, the display stage's breathing and lift, and any in-flight GSAP timeline - so it is a renderer change with real edges, not a one-liner, which is why it is written down rather than squeezed into a layout fix.

## The Hammer's keel and fin render as a stippled hatch (mitigated, residual)

**Where.** Any surface showing the finished Hammer, worst on the preflight hero at the default three-quarter angle: a fine regular diagonal hatch along the keel and across the outward face of the fin, roughly where the plane's six-layer nose is.
Present on the other five planes only faintly.

**Diagnosed, 2026-08-22: it is aliasing of the sheet's own thickness geometry.**

Every slab rim in the model is drawn narrower than one device pixel, on every plane, at the framing every display stage uses.
Measured by projecting `SHEET_MM` and `CHAMFER_MM` through the production camera (FOV 34, distance `1.15 x radius / sin(FOV/2)`) into an 804x684 panel at the pixel ratio the renderer caps to:

| Plane | Bounding radius | mm per device pixel | Sheet edge | Chamfer band |
|---|---|---|---|---|
| Dart | 160mm | 0.281 | 0.60px | 0.18px |
| Bulldog | 140mm | 0.246 | 0.69px | 0.20px |
| Harrier | 146mm | 0.257 | 0.66px | 0.19px |
| Sea Glider | 142mm | 0.250 | 0.68px | 0.20px |
| Hammer | 124mm | 0.217 | 0.78px | 0.23px |
| Square Cruiser | 107mm | 0.188 | 0.90px | 0.27px |

A 0.2px feature cannot be resolved by the 4x MSAA the stage runs, so each rim beats against the pixel grid instead of being drawn.
Where one rim does that, the result is a slightly dirty edge, which is the faint version the other five planes show.
Where six or eight stack in line - the Hammer's nose is rolled back on itself twice - the beats line up into the regular ladder that is the reported hatch.

**The earlier "ruled out" entry for sub-pixel geometry was mis-read, and this is the correction.**
That probe rendered with `SHEET_MM` at 0.9 and `CHAMFER_MM` at 0.26, five times life size, and recorded that the hatch "scaled up with the geometry rather than resolving".
It would: `refit` fits the camera distance to the model's bounding radius, so scaling the model scales the viewing distance with it and mm-per-pixel scales identically.
The rim stays the same fraction of a pixel at any scale, and that test could never have separated the hypotheses.

**What has been ruled out, by measurement.**

- *Sub-pixel FACET geometry.* The hypothesis named the Hammer's 96 facets, many of them long slivers. Projecting every facet polygon of every plane through the same camera puts the thinnest one at **7.59px** on the Hammer and 94.8px at the median on the Dart; the only sub-pixel facets anywhere are two on the Dart. The flat faces are not the problem - their rims are.
- *The photographic paper maps.* Blocking all three `paper-craft-*.webp` requests, so the stage falls back to the procedural fibre material with no normal map at all, produces a **pixel-identical** hatch. Neither the normal map nor its minification is involved.
- *Coplanar adjacent facets.* A probe over all six planes for facet pairs sharing a plane (normal and offset within a fifth of a layer) and touching at two or more vertices within 0.05mm found **zero** on every plane. No continuous sheet of paper is being drawn as two slabs with a seam between them.
- *Coplanar overlapping facets.* The earlier probe stands: zero pairs coplanar to within 0.001 of a unit normal, overlapping within 40mm and closer than 0.2mm, at the same layer or any other.
- *Depth-buffer precision.* The frustum was 1mm to 20000mm on a model 600mm away, leaving about 0.02mm of depth resolution where the paper is, against a 0.08mm gap between stacked layer surfaces. Binding near and far to the model's bounding sphere (in `refit`) improved that by roughly two orders of magnitude. The hatch is unchanged, so this was a real defect but not this one - the fix is kept on its own merits.
- *The ink outline.* Display stages stopped drawing it in `1db6e6f`; the hatch survives without it.
- *The shadow map.* Display stages set `castShadow = false`, so there is no depth pass to acne.

**Fixed on the Preflight hero, by A/B, and the two obvious candidates both lost.**

Four candidates were built and measured on one fixed device (DPR 2, where the defect is worst), each against a 6x render of its own geometry reduced to the same CSS-pixel grid. Distance from a correctly-sampled image is the honest metric here, because the hatch IS the sampling error.

| Candidate | Aliasing error (RMSE) | Verdict |
|---|---|---|
| Today: bevelled rim, ratio capped at 2 | 1.468 | the defect |
| A: square the rim, drop the sub-pixel chamfer | 1.724 | **17% worse** |
| B: raise the `full` ceiling from 2 to 3 | 1.468 | **no effect at all** |
| C: put both bevel bands on one tint | 1.463 | a wash, and it changes the look |
| **D: supersample 1.5x relative to the device** | **1.170** | **20% better, shipped** |
| D at 2x, for reference | 0.994 | 32% better, and 3.7x the frame cost |

A was wrong because the bevel is not the problem: softening the rim over a fraction of a pixel is worth something, and a hard square rim aliases harder. `RMSE(bevelled truth, square truth)` is 2.328, so the bevel is not invisible even when it IS resolved.

B was wrong for a duller reason. `maxPixelRatio` is a CEILING, and a retina screen sits at device ratio 2 and never reached a ceiling of 2 in the first place; raising it to 3 changes nothing except on a DPR-3 phone, which is the device least able to pay for it. The quantity that matters is samples per CSS pixel, which a ceiling cannot express - hence D's multiplier.

C was built on the observation below and did not survive contact with the measurement.

D is spent on one stage only. Frame time tracks pixel count almost exactly - measured at 1.9x to 2.2x wall clock for this 1.5x, against the 2.25x the arithmetic predicts - so the Tutorial (`full` but never `display`) and the Hangar bay (`display` but `preview`) both keep their old ratios. See `DISPLAY_SUPERSAMPLE`.

**Residual, and deliberately left.** The hero is better, not perfect: 1.170 against a ground truth of 0. The Hangar bay draws at one device pixel per CSS pixel and shows the hatch worst of anywhere, and is untouched - its aircraft is small, it is a decorative bay, and multiplying a `preview` ratio would be a ninefold rise in fill on the front door of the site. If the bay ever needs it, the lever is the same one.

**Found on the way, and separately worth fixing.** The `edgeTint` branch of the paper shader is unreachable. It fires on `abs(objectNormal.z) <= 0.3`, and the four surfaces a slab actually has sit at `nz` of 1, -1, +0.507 and -0.507, so nothing ever takes it: `theme.paperEdge` is dead, and the "restrained warm compressed-edge tint" the hyper-real brief asked for has never shipped. What the two bevel bands take instead is the front face (untinted) and `backTint` - so every edge in the fleet carries a light band directly above a dark one. That is not the cause of the hatch, which candidate C settles, but it is not what anyone specified either.

## Closed at Gate 3

The three entries opened at Gate 3 are all closed.
Three.js left the first-paint bundle when `@/engine` stopped statically importing the renderer and started fetching it through `loadFoldEngine()`; the tutorial's total blocking time fell from 9.4 s to 0.63 s and every screen's Lighthouse performance score rose by 20 to 37 points.
The tutorial's progress strip now meets WCAG 2.5.8 by geometry rather than by exception - the segments are 24 px square and claim their own row on a phone - and `tests/e2e/a11y.spec.ts` measures all twelve so it cannot quietly shrink again.
The third was never a defect but a warning about the measuring instrument, and it now lives where it is useful rather than in a defect log: `tests/e2e/hangar-perf.spec.ts` and `tests/e2e/vitals.spec.ts` both explain, at the point of use, why a wall-clock budget in a headless run reports on the CPU that ran it and why only CLS is asserted.
