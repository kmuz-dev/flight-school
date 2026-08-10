# Known issues

Defects found and confirmed, with the evidence gathered, so the next session starts from what is known rather than from the symptom.
Fixed issues are removed from this file; the commit that fixes one says so.

None open.

The three entries opened at Gate 3 are all closed.
Three.js left the first-paint bundle when `@/engine` stopped statically importing the renderer and started fetching it through `loadFoldEngine()`; the tutorial's total blocking time fell from 9.4 s to 0.63 s and every screen's Lighthouse performance score rose by 20 to 37 points.
The tutorial's progress strip now meets WCAG 2.5.8 by geometry rather than by exception - the segments are 24 px square and claim their own row on a phone - and `tests/e2e/a11y.spec.ts` measures all twelve so it cannot quietly shrink again.
The third was never a defect but a warning about the measuring instrument, and it now lives where it is useful rather than in a defect log: `tests/e2e/hangar-perf.spec.ts` and `tests/e2e/vitals.spec.ts` both explain, at the point of use, why a wall-clock budget in a headless run reports on the CPU that ran it and why only CLS is asserted.
