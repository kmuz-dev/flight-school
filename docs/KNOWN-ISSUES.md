# Known issues

Defects found and confirmed, with the evidence gathered, so the next session starts from what is known rather than from the symptom.
Fixed issues are removed from this file; the commit that fixes one says so.

## Three.js is in the first-paint bundle of every screen

`app/engine/index.ts` statically imports `render/renderer`, which imports `three`, so `@/engine` pulls the whole renderer into whatever route touches it.
On the hangar that is 178 KB of JavaScript of which Lighthouse measures 122 KB unused, on a page whose six cards are build-time SVG until a cadet wakes a scene.
Measured on the exported build under Lighthouse mobile emulation (4x CPU throttle, slow 4G): LCP 3.6 s on the hangar, of which 87% is render delay, against a 1.1 s first contentful paint.

The fix is to make the three call sites - `PlaneCard`, `OrbitViewer`, `FoldStage` - reach the factory through `await import("@/engine")` inside the effect that builds the engine, so Three.js becomes a lazily fetched chunk rather than part of the critical path.
It is not a small change: `createEngine` is an injected factory in all three components and in their tests, and making it async changes that contract and every effect's cleanup.
Left open deliberately at Gate 3 rather than done half-way, because it touches the engine seam and the display-stage components at the same time.

## Lighthouse reports `target-size` on the tutorial's progress strip, and always will

The strip's twelve step buttons are one segment wide - 13.4 CSS px on a phone - and WCAG 2.5.8 asks for 24x24.
Twelve 24 px targets need 288 px plus gaps and the strip has about 295 px to work with on a 375 px viewport, so the criterion cannot be met by geometry without abandoning either the twelve-segment readout or the jump-to-step behaviour.

It is met through 2.5.8's Equivalent exception instead: every step the strip reaches is also reachable from the transport's back and next buttons, which are full size.
The touch target was still raised from 6 px to 24 px tall with a pseudo-element that does not move the bar (`app/components/tutorial/TransportBar.tsx`), because a 6 px tall target is bad on a phone whether or not it conforms.
Lighthouse measures the element's own rectangle and cannot see a pseudo-element, so the audit stays red at 96/100 accessibility on `/plane/*/fold/`.
Nothing to fix; this note exists so the red audit is not re-investigated.

## Performance numbers from any headless run are reports on the CPU, not on the product

Headless Chromium rasterises WebGL through SwiftShader on CI and on a laptop alike, so a Lighthouse run of a screen with a live stage measures software rendering under a 4x CPU throttle.
That is why the tutorial scores 44 for performance with a 9.4 s total blocking time while its CLS is 0 and it has no console errors.
`tests/e2e/hangar-perf.spec.ts` records the same lesson at length after two attempts at a millisecond budget turned CI red on unrelated commits, and `tests/e2e/vitals.spec.ts` asserts only CLS for the same reason.
Real-device numbers are a Gate 4 question, against the deployed site.
