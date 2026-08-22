# Hyper-real Paper Tutorial and 3D Inspection

Status: approved for implementation on 2026-08-16.

This is the decision-complete handoff for the production-critical paper-material and inspection follow-on to the Photographic Hangar release.

## Outcome and quality bar

- Give every Tutorial fold and every Preflight and Hangar inspection one shared hyper-real warm-white craft-paper material.
- Keep the procedural fold geometry authoritative, including when a finished aircraft is inspected.
- Remove the Why disclosure and place its explanation beneath the folding instruction as an unlabeled second paragraph.
- Keep Tip callouts and expandable Fold terms.
- Keep beauty art as the default and while 3D loads.
- Restore beauty art if WebGL fails, with canonical SVG used only when the beauty image also fails.
- Treat robustness, tests, failure handling, accessibility, performance, and visual validation as release blockers.

## Scope boundaries

In scope:

- Tutorial content schema, instructional rail, paper material, and richer instructional lighting.
- Preflight and Hangar 3D inspection controls, crossfade, reset, retry, and failure behavior.
- Final-state camera, rest-frame, scale, and canonical geometry fidelity for all six aircraft.
- All 12 locales, engine contracts, component tests, renderer tests, E2E journeys, artwork audits, and product documentation.

Out of scope:

- Progress, completion, routes, deployment, Hangar carousel behavior, or existing beauty-art files.
- Display-only meshes, image-wrapped geometry, dark Tutorial styling, depth-of-field, fingerprints, stains, or heavy paper damage.

## Design decision

Chosen approach: use one shared PBR material over the canonical procedural geometry.
This makes the aircraft shown during folding and the aircraft shown during inspection the same object.

Rejected approach: create separate display-only or image-wrapped models.
That would allow a closer one-angle imitation of the beauty art but would drift from the actual folding sequence and bake incorrect lighting into rotating surfaces.

## Approved assets

Copy these generated production assets into `app/assets/materials/`:

- `paper-craft-albedo.webp`: 1024px sRGB, 80,640 bytes.
- `paper-craft-normal.webp`: 512px linear, 166,372 bytes after the final semantic re-encode.
- `paper-craft-roughness.webp`: 512px linear, 2,214 bytes with retained spatial variation.

The source package is retained outside the repository at:

```text
/Users/kuda/.codex/generated_images/01a00110-bcb5-79b1-97e5-6a3e458e9667/
```

The three production files total 249,226 bytes, below the approved 257,906-byte ceiling.
They must remain behind the lazy renderer boundary.

Use mirrored repeat wrapping at 4 by 4 repeats, roughness 0.88, normal scale 0.18, and anisotropy capped at 8.
Preserve the current sheet thickness, chamfering, back-face distinction, and wrap-light translucency.
Tint reverse faces multiplicatively so the paper texture remains visible.
Give chamfer surfaces a restrained warm compressed-edge tint.

## Implementation plan

### Tutorial content

- Remove the Why disclosure and `tutorial.why` strings.
- Rename `PlaneStrings.why` to optional `PlaneStrings.explanations`.
- Remove `FoldStep.hasWhy` from engine content and every aircraft definition.
- Migrate every existing Why translation into the corresponding explanation entry across all 12 locales.
- Render the instruction first and the explanation as a separate unlabeled paragraph.
- Keep Tip callouts and Fold terms, with Fold terms remaining the only expandable instructional section.
- Remove dormant Why types, fixtures, validation, documentation, and tests.

### Shared paper renderer

- Load the approved albedo, normal, and roughness maps only inside the lazy Three.js renderer chunk.
- Keep the current deterministic fibre texture only as the material-asset failure fallback.
- Delay `EngineOptions.onReady` until the texture set has loaded or the procedural fallback has activated.
- Never reveal an untextured intermediate frame.
- Report material-load failures, retain truthful `renderMode: "webgl"`, and continue with the procedural material.
- Dispose textures with the owning renderer and avoid module-global GPU resources.

### Tutorial lighting

- Keep the cream graph-paper stage, crease graphics, annotations, and instructional cameras.
- Use a richer instructional rig with a warm key near 2.8, cool fill near 0.55, hemisphere near 0.65, and shadow opacity near 0.22.
- Preserve readable fold edges on the initial flat sheet and avoid clipped whites under ACES tone mapping.

### Preflight and Hangar inspection

- Keep beauty art visible during renderer and material loading, then crossfade to canonical 3D.
- Apply the shared paper material to all six aircraft.
- Keep Preflight on the cream studio stage and Hangar transparent over the photographed bay.
- Support constrained orbit, wheel or pinch zoom, and a visible localized Reset view control.
- Keep pan disabled and retain safe elevation and distance limits.
- Add `FoldEngineHandle.resetView()` to restore authored `displayView`, fitted distance, and target.
- Make the SVG implementation a safe no-op.
- On renderer failure, preserve or restore beauty art, announce that 3D is unavailable, and offer retry.
- Use canonical SVG only if the beauty image also fails.
- Dispose the active Hangar renderer and return to beauty art whenever aircraft selection changes.

### Aircraft fidelity

- Audit Dart, Bulldog, Harrier, Sea Glider, Hammer, and Square Cruiser against their approved artwork.
- Correct display scale, target, camera, and rest-frame alignment before changing geometry.
- If geometry is still wrong, fix the earliest responsible canonical fold step and revalidate every later state.
- Never add display-only geometry.
- Preserve all approved beauty artwork byte-for-byte.

## Interface changes

- Add `FoldEngineHandle.resetView(): void`.
- Rename `TutorialStepView.why` to optional `TutorialStepView.explanation`.
- Rename localized `why` records to `explanations`.
- Remove `FoldStep.hasWhy` and `TutorialUiStrings.why`.
- Add localized Reset view, 3D unavailable, and Retry 3D strings.
- Do not add new `EngineOptions` flags or plane-specific material configuration.

## Acceptance and verification

- Characterize the existing Why, Fold terms, Tip, renderer-loading, orbit, and fallback behavior before changing it.
- Verify explanations render as second paragraphs without a Why label or disclosure.
- Verify Fold terms remains keyboard-operable and Tips remain visible.
- Validate exact locale and placeholder parity across all 12 dictionaries, including Arabic RTL.
- Test map color spaces, wrapping, normal strength, delayed readiness, asset-failure fallback, and texture disposal.
- Confirm initial Hangar and Preflight loads fetch neither Three.js nor the three paper maps.
- Test crossfade, orbit, zoom limits, Reset view, retry, beauty fallback, and secondary SVG fallback.
- Exercise inspection for all six aircraft and confirm only one Hangar renderer can exist.
- Add visual comparisons for every finished aircraft plus representative early, middle, and final Tutorial folds.
- Verify desktop, mobile, reduced motion, 200% zoom, image failure, WebGL failure, renderer-chunk failure, and low-quality renderer mode.
- Keep the new assets within the approved 257,906-byte production budget and outside the eager bundle.

Run against a fresh production build:

```bash
npm run typecheck
npm run lint
npm test
npm run validate:content
npm run i18n:audit -- --strict
npm run build
npm run test:e2e
npx tsx scripts/audit-aircraft-art.ts
```

Use focused green commits for content migration, paper material, lighting, inspection behavior, aircraft fidelity, and tests and documentation.
