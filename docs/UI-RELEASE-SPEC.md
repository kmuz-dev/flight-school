# Flight School - UI Release Specification

Status: approved implementation contract, 2026-08-10.

This document is the compact release checklist for visual, responsive, interaction, and content behavior.
The product requirements live in [PRD.md](PRD.md), screen composition lives in [SCREENS.md](SCREENS.md), and tokens live in [DESIGN.md](../DESIGN.md).

## Visual system

- Use a Blueprint-led editorial system with strong whitespace and restrained technical detail.
- Confine Blueprint grids, crease annotations, and measurement language to aircraft or instructional regions.
- Use Instrument Sans for body and interface copy, Archivo Narrow for major display titles, and IBM Plex Mono only for measurements, step counters, and compact technical labels.
- Use sentence case by default.
- Permit short uppercase tier or technical labels only where scanning improves.
- Use cream paper and raised white surfaces in the default theme, with navy structure and one primary airmail-red action per screen.
- Use success green `#356044` for text on cream or white; reserve the lighter green for non-text marks and surfaces.
- Keep the Hangar bay dark and photographic and every instructional screen on the cream Paper system; the bay is a room, not a second theme.
- Prefer whitespace, proportion, typography, and soft material shadows over borders or motifs.

## Aircraft representation

- Beauty artwork is allowed only in the Hangar, Preflight, and Wings earned screens.
- The procedural engine is authoritative for tutorial instruction, explicit 3D inspection, and SVG fallback.
- Beauty artwork may improve paper material, edge thickness, crease definition, lighting, and presentation.
- Beauty artwork may not change the nose, wing planform, fins, keel, symmetry, or defining proportions of the canonical final fold.
- The approved Dart render is the material and lighting reference, not a geometry source for other aircraft.
- The Bulldog must retain its short folded-back blunt nose and opened wings.
- The Harrier must retain its broad glider planform, folded-back nose, and nested tip fins.
- Keep beauty artwork visible while an explicitly requested renderer loads.
- Replace beauty artwork with the canonical SVG if the beauty image itself fails.
- When Inspect in 3D is activated in the Hangar, keep beauty artwork visible while the renderer loads. Preflight has no such control.
- Replace the inspection region with WebGL after successful initialization.
- Constrain orbit and wheel or pinch zoom, disable pan, and provide a localized Reset view control.
- Keep or restore beauty artwork, announce that 3D is unavailable, and offer Retry 3D if WebGL is unavailable or initialization fails.
- Use the canonical SVG only if the beauty image itself also fails.
- Never describe an SVG fallback as interactive 3D.

## Responsive layout

| Range | Hangar | Preflight | Tutorial | Wings earned |
|---|---|---|---|---|
| Under 640px | Full-bleed bay, aircraft above placard, arrows on the bay edges, marker strip over the floor; touch targets at least 44px | Artwork above paper choice; sticky primary action | Stage, transport, then rail; sticky Back and Next without overlap | Artwork above copy; stacked actions |
| 640px to 959px | Full-bleed bay, stacked, with the wings chip hidden from the nav | Balanced stacked layout; profile below paper choice | Stage above rail; controls may wrap by semantic group | Two balanced content regions when space permits |
| 960px and above | Full-bleed bay with the aircraft offset top-right and the placard lower-left | Dominant artwork beside decision rail | Stage at least 60% of working width with instruction rail beside it | Artwork and achievement copy share the hero |

All ranges must support 200% text zoom without clipped copy, inaccessible controls, or horizontal page scrolling.
Arabic mirrors directional layouts and icons while preserving numbers, timelines, and aircraft orientation where mirroring would change instructional meaning.

## Interaction and accessibility

- Provide a visible-on-focus skip link to the main region.
- Use native links for navigation, native buttons for actions, native radio inputs for paper choice, native range input behavior for scrubbing, and a native select for direct step access.
- Preserve expected arrow-key behavior for radio groups and select controls.
- Keep a clear, high-contrast focus indicator in both themes.
- Announce tutorial step changes and renderer fallback through polite live regions without moving focus.
- Keep Fold 1, resumed steps, revisited steps, and directly selected steps paused on entry.
- Auto-play a later fold once only after the learner deliberately advances with Next.
- Suspend renderer work while the stage is offscreen or the document is hidden, without changing the learner's play or pause state.
- Honor reduced motion for decorative transitions while keeping fold playback, scrubbing, and replay available.

## Content and state truthfulness

- Use Wings earned and Flight School achievement for completion language.
- Do not use Certified, licence number, flight manifest, social proof, unrecorded statistics, or claims of external qualification.
- Label Speed, Distance, Airtime, and Ease as an Estimated flight profile and show them only in Preflight.
- Visiting Wings earned directly never records completion.
- Render neither earned nor unearned completion content until browser progress has hydrated.
- Fold it again clears resume position, returns to Step 1, and preserves the earned wing.
- The next uncompleted aircraft is the primary completion action when one exists.
- Return to Hangar becomes the primary completion action when all six aircraft are complete.
- Translate all visible and assistive copy in all 12 locale dictionaries with placeholder parity.

## State matrix

| Concern | Required states |
|---|---|
| Direction | Left-to-right, Arabic right-to-left |
| Motion | Standard, reduced motion |
| Beauty artwork | Loading, loaded, failed with canonical SVG |
| Renderer | Not requested, loading, WebGL active, suspended, retryable failure, beauty fallback, secondary SVG fallback |
| Hangar selection | First aircraft, first unfinished aircraft, all six complete |
| Progress | New, resumable, final step, completed, restarting |
| Completion route | Hydrating, earned, unearned |
| Controls | Default, hover where applicable, focus-visible, active, disabled, busy |

## Release acceptance

- Initial Hangar and Preflight visits do not request the Three.js renderer chunk.
- No Hangar hover or focus event mounts WebGL.
- At most one explicitly opened Hangar live scene exists at once, and changing aircraft disposes it.
- All primary paths work with keyboard alone, touch, reduced motion, and Arabic RTL.
- Every text color passes WCAG AA, and tutorial instruction text meets AAA.
- Golden screenshots cover six aircraft, four screens, mobile and desktop, plus Arabic RTL.
- A real-paper fold-through confirms that each physical result matches the tutorial final state and approved beauty artwork.
