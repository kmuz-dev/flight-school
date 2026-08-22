# Design System - Flight School

## Product Context

- **What this is:** Flight School is a paper airplane tutorial site whose shared procedural fold engine powers every instructional step.
- **Who it is for:** The writing is kid-clear enough for a sharp 10-year-old to complete a tutorial alone, while the visual finish is adult-grade.
- **Space:** It is an interactive craft-learning product with a substantial 3D component.
- **Memorable idea:** "A flight academy for paper."
  Completion badges are wings and the catalog is the Hangar.
  The academy voice is light and internal and never implies a real licence or external certification.

## Aesthetic Direction

- **Direction:** Blueprint-led modern editorial with a restrained mid-century flight-school accent.
- **Decoration:** Blueprint grids and technical annotations appear only inside aircraft and instructional regions.
  Elsewhere, whitespace, hierarchy, paper grain, and a few precise rules carry the system.
- **Mood:** Cream surfaces, navy structure, airmail-red actions, and premium photographed-paper aircraft make the product warm, precise, and quietly playful.
  Useful comes first and themed comes second.
- **Kitsch guard:** Do not use cartoon pilots, clip-art clouds, aviation stock photography, or illustration clutter.
  The Hangar bay is the one photographic surface, and it is a generated empty hangar interior serving as the room an aircraft is presented in - never a photograph of a real aeroplane, and never a decorative hero image.
- **Truth guard:** Do not use manifest fiction, licence numbers, social proof, fabricated metrics, or externally suggestive certification.
- **Aircraft guard:** Generated beauty artwork may appear only in the Hangar, Preflight, and Wings earned screens.
  The procedural engine remains authoritative for instruction and explicit 3D inspection.
  Inspection failure retains beauty artwork, and the canonical SVG is the secondary fallback when that artwork also fails.
  Generated silhouettes must match the canonical final fold geometry.

## Typography

The production font set is deliberately small and is self-hosted in the static build.

- **Display and hero:** Archivo Narrow 600 or 700.
  Sentence case is the default.
  Restrained uppercase is permitted only for short technical placards and tier labels.
- **Body:** Instrument Sans 400, 500, or 600.
  Tutorial instructions render at 1.125rem minimum.
- **Interface labels:** Instrument Sans 600 in sentence case.
- **Data and technical labels:** IBM Plex Mono 400 or 500 with tabular numerals.
  Use it only for measurements, step counters, and compact technical labels.
- **Code in documentation:** IBM Plex Mono.
- **Loading:** Use self-hosted files with `display=swap`.
- **Scale:** display-xl 3.5rem, display 2.5rem, h1 2rem, h2 1.5rem, h3 1.25rem, body 1rem, small 0.875rem, and micro 0.75rem.

## Color

- **Approach:** Use a restrained two-ink system plus one accent.
  Red means action or achievement, while blue means information and flight.
- **Paper:** Use `#F7F3E9` for the page and `#FFFFFF` for raised surfaces.
- **Display ground:** Grade `#F0E7D3` into `#D8C9A8` behind a finished aircraft.
  The shared tokens are `--color-stage-sky` and `--color-stage-ground`.
  The engine's `STAGE_THEMES` mirrors those tokens because the live canvas paints its own opaque backdrop.
  This is an aircraft surface and never a text ground.
- **Ink:** Use `#1A2B4A` for primary text and structure.
  Borders, rules, and icons use ink at reduced opacity instead of separate gray hex values.
- **Airmail red:** Use `#D64541` for primary actions, achievement accents, and active states.
  It must remain rare and visually loud.
- **Sky blue:** Use `#7FA8C9` for flight paths, progress, and informational marks.
- **Semantic colors:** Use success surface `#4A7C59`, success text `#356044`, warning `#C98A2C`, error `#B03A2E`, and info `#7FA8C9`.
- **Neutrals:** Derive neutral marks from navy at 87%, 60%, 38%, and 12% opacity.
- **Hangar bay:** The one dark surface, and a room rather than a second palette.
  Type over the photograph is `#FFFDF7` and `rgb(247 243 233 / 0.76)`, lifted clear of the plate by a scrim and a soft shadow pool rather than by a panel.
  Its values are literal in `app/globals.css` because they describe one room; they are not tokens and nothing else may use them.
- **Contrast:** Every text pair passes WCAG AA and tutorial instruction text passes AAA.
- **Text variants:** Use `--color-red-ink`, `--color-sky-ink`, `--color-success-ink`, `--color-ink-muted`, and `--color-on-red` when an accent carries text.
  `tests/design/contrast.test.ts` fails when a required pair falls below its threshold.
  It measures tokens, so it cannot see the Hangar bay, whose ground is a photograph; the axe scan in `tests/e2e/a11y.spec.ts` measures that one from the rendered page.

## Spacing

- **Base unit:** 8px.
- **Density:** Keep comfortable space around aircraft and the tutorial stage.
- **Scale:** 2xs 2px, xs 4px, sm 8px, md 16px, lg 24px, xl 32px, 2xl 48px, and 3xl 64px.

## Layout

- **Approach:** The Hangar is a quiet object catalog and the tutorial is a composed learning stage.
- **Hangar:** Use large approved aircraft artwork, name, difficulty tier, step count, and an unobtrusive Wings earned mark.
  Cards do not carry ratings or ticket decoration.
- **Tutorial:** Give at least 60% of the desktop working width to the procedural stage.
  The header owns the single authoritative step progress display.
  The playback strip beneath the stage contains only Play or Pause, scrub, Replay, and time.
  The instruction rail contains the action, an optional explanatory paragraph, fold-term help, and Back or Next navigation.
  On mobile, the stage and playback strip stack above the instruction rail.
- **Grid:** Use a 12-column desktop grid, a 4-column mobile grid, and a 1200px maximum content width.
  The procedural stage may bleed wider where space permits.
- **Radius:** Use 4px for inputs and chips and 8px for cards.
  Do not use pill buttons except for the scrub handle.
- **Responsive contract:** The Hangar is one full-bleed bay at every width; it stacks the placard under the aircraft on a phone rather than reflowing a grid.
  Keep primary tutorial navigation and the Preflight primary action reachable on mobile without covering content.
  Every layout must tolerate Arabic RTL and 200% text zoom.

## Motion

- **Approach:** Fold animations are the star and UI motion is functional and restrained.
- **Delight:** The Hangar aircraft breathes on a compound 4s bob and 6.5s sway, hashed per aircraft so no two move in lockstep, and banks into its own drift rather than wobbling against it.
  Changing aircraft flies the old one out along its nose axis and the new one in behind it on the same route, over 680ms.
  An explicitly opened 3D aircraft carries the same float, from the same constants, so the handover has no seam.
  The finished tutorial aircraft may leave the table before the Wings earned moment.
  Beauty artwork itself remains still and premium.
- **Easing:** Use ease-out for entry, ease-in for exit, and ease-in-out for movement.
- **Duration:** Use 50ms to 100ms for micro motion, 150ms to 250ms for short motion, 250ms to 400ms for medium motion, and 800ms to 1500ms for fold animations.
- **Reduced motion:** Remove decorative motion while preserving fold playback, scrubbing, and replay.

## Avoid List

Avoid pastel craft pink, dense Blueprint decoration across the whole page, endless uniform card grids, perforated ticket edges, manifest and licence fiction, certification claims, diagonal stamps over aircraft, repeated progress controls, pseudo-radio buttons, script fonts, purple gradients, icon-in-colored-circle feature rows, centered-everything landing pages, and aviation stock photography.

The Hangar is deliberately off-centre for the last of those: the bay sits toward the top-right and the placard occupies the lower-left, which also runs with the aircraft, since the artwork's nose points low-left.

## Decisions Log

The release contract is [SCREENS.md](docs/SCREENS.md) and [UI-RELEASE-SPEC.md](docs/UI-RELEASE-SPEC.md).
Historical entries below explain the path to the release system but do not override those documents.

### 2026-08-16: The photographic Hangar, and one honest completion

The six-card grid became one full-bleed bay: a generated hangar interior with a single aircraft floating in it, chosen by arrows, a marker strip, the arrow keys, or a horizontal swipe.
The strip carries what the grid did well - the whole fleet, and which of them are folded - and the bay carries what it did badly, which was showing any one aircraft at a size worth looking at.
Night Flight was retired with the grid: a second palette was a second version of every surface to design, translate and contrast-test, and the dark surface the product still has is a photographed room rather than a theme.
Wings are now awarded only by the tutorial's Finish; the completion route reads and never writes.

### 2026-08-10: Blueprint-led release refinement

Generated beauty artwork is permitted in the Hangar, Preflight, and Wings earned screens after validation against canonical final fold geometry.
The tutorial, explicit 3D inspection, and fallback remain procedural.
This supersedes the Stitch-led cards, hover-mounted WebGL, certificate, licence, manifest, and social-proof directions.

### 2026-08-10: Accessible text colors

The original accent palette failed several text contrast pairings.
The palette now uses `--color-red-ink` `#C0362F`, `--color-sky-ink` `#456F93`, `--color-success-ink` `#356044`, and a 70% navy muted-text token.
Surface accent colors remain available for marks that do not carry text.

### 2026-08-16: Shared photographic paper material

The live engine represents each facet as a 0.17mm slab with a chamfered edge.
A shared albedo, normal, and roughness set gives Tutorial folds and explicit 3D inspection the same warm-white paper surface as the approved artwork.
The maps stay behind the lazy renderer boundary and use mirrored four-by-four repeats, 0.88 roughness, 0.18 normal scale, and anisotropy capped at eight.
A sheet-space procedural fibre map remains only as the asset-load fallback.
A wrap-lighting term softens the terminator to suggest thin paper translucency.

### 2026-08-10: Separate display and tutorial lighting

The tutorial rig keeps generous ambient light so a flat starting sheet remains distinct from its floor.
Its warm key is 2.8, cool fill is 0.55, hemisphere is 0.65, and shadow opacity is 0.22.
The finished-aircraft display rig uses lower ambient and fill values to reveal folded form.
Both renderers read the shared `DISPLAY_RIG` in `app/engine/view.ts`.

### 2026-08-10: Kraft display ground

The earlier white-to-cream ground washed out the white aircraft.
The current `#F0E7D3` to `#D8C9A8` kraft ground improves the silhouette and shares one token pair across display surfaces.

### 2026-08-10: Finished-aircraft motion

Finished aircraft float instead of rotating because rotation repeatedly hid the authored hero angle.
The float uses scale-relative amplitude and a stable plane-id phase so aircraft do not move in lockstep.
Reduced motion keeps the lifted pose and removes the drift.

### 2026-08-10: Final-fold lift

The final tutorial fold raises the aircraft from the table before the Wings earned moment.
Moving back or scrubbing backward returns the aircraft to the table.
Reduced motion keeps the lifted final pose without animating the transition.

### 2026-08-10: Floorless finished-aircraft display

Finished-aircraft surfaces use a graded backdrop and soft contact shadow instead of the tutorial graph-paper floor.
The tutorial retains its floor because it establishes the folding workspace.
The contact shadow is a lightweight alpha quad rather than a shadow map.

### 2026-08-09: Initial visual exploration

The first design pass established the two-ink and one-accent palette, Archivo Narrow display face, and flight-school framing.
It also explored airmail chevrons, Stitch and Claude Design screen synthesis, and live 3D on Hangar hover.
Those mockup-specific composition and interaction choices are superseded by the 2026-08-10 release refinement.
