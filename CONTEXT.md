# Flight School - Domain Context

Flight School is a paper airplane tutorial website.
Users pick a plane design, then get walked from raw paper through every fold to a finished, flyable plane.
Modeled on the interaction quality of [thebuggeddev/anatomy](https://github.com/thebuggeddev/anatomy) (content-as-code interactive explorer).

## Audience

All ages, written kid-clear: a sharp 10-year-old can follow any tutorial alone, with adult-grade visual polish.
This sets the complexity ceiling (no design ships if a 10-year-old cannot complete it from the steps) and the copy register (no unexplained folding jargon; terms like "valley fold" are taught on first use).

## Glossary

| Term | Meaning |
|------|---------|
| Plane (Design) | A named paper airplane model in the catalog (e.g. the Dart). Has a finished-plane visual, a fold sequence, and flight characteristics. |
| Fold Sequence | The ordered list of Steps that takes a sheet of paper to the finished Plane. |
| Step | One atomic folding action a user performs. Has an instruction, a visual, and an optional explanatory paragraph. |
| Paper Prep | The pre-folding stage: what paper size/type is needed and how to cut common paper (e.g. Letter, A4, 4x6) down to it. |
| Hangar | The catalog and the home page: one aircraft at a time, floating in a photographed hangar interior, chosen from a strip of six markers. |
| Bay | The photographic surface the Hangar aircraft occupies. A room, not a theme - the only dark surface in the product. |

## Current V1 Decisions

- **Catalog:** Six planes form a fixed difficulty ladder with two easy, two medium, and two advanced designs.
- **Step visuals:** A procedural fold engine renders every instructional step as an animated, scrubbable, orbitable WebGL fold with a canonical static SVG fallback ([ADR 0001](docs/adr/0001-procedural-3d-fold-engine.md)).
- **Aircraft presentation:** Generated beauty artwork is allowed only in the Hangar, Preflight, and Wings earned screens.
  One render per aircraft serves all three; only its scale in the frame differs.
  The engine's canonical final state is authoritative for silhouette and powers explicit 3D inspection and SVG fallback.
- **Hangar:** One aircraft in a photographed room rather than a grid of six cards.
  Arrows, a marker strip, the arrow keys, and a horizontal swipe change aircraft; the strip carries which aircraft have earned wings.
  The bay opens on the first unfinished aircraft once stored progress has hydrated.
  WebGL is never mounted by arriving, hovering or focusing - only by a named button or a short drag - and at most one scene is ever live.
- **One scene, one palette:** Night Flight was retired.
  The instructional screens keep the cream Paper system, the Hangar bay is dark because it is a photograph, and the stage draws through to it rather than matching it.
  The storage key stayed at `flightschool.v1`: a retired `theme` field is simply not read forward, so no cadet loses progress to the change.
- **Display fallback:** Beauty artwork remains visible while explicitly requested WebGL loads.
  Successful WebGL replaces it.
  WebGL failure or unavailability shows a labeled canonical SVG in the inspection region.
  Beauty-image failure outside inspection also falls back to the canonical SVG.
- **Paper Prep:** The fold engine renders Paper Prep as Step 0 of each sequence.
  Each plane declares its required paper and the user chooses Letter, A4, or 4x6 paper.
  A sheet is offered only when the plane genuinely folds from it: either it carries a prep run for that sheet, or the sheet matches the authored one in both size and proportion.
  Letter and A4 are one sheet to the catalog, which is why sequences are authored as `letter-a4`; a square is not, and the five rectangular planes do not offer it.
- **Explanation layer:** Each step may have one short rationale beneath its folding action and each plane has an Estimated flight profile on Preflight.
  Deep aerodynamics remains a later iteration.
- **User state:** Browser localStorage holds resume position and earned wings per plane.
  No accounts or backend state exist.
- **Completion truth:** Only Finish on the final tutorial step records completion.
  A direct Wings earned visit never awards a wing.
- **Localization:** Twelve content-as-code locales launch together.
  English is the source of truth and the remaining dictionaries are audited against it.
- **Stack:** Next.js 16 App Router, TypeScript, Tailwind 4, Three.js, and GSAP run in `output: 'export'` mode.
- **Backend:** There is no database, API route, or authentication layer.
  TypeScript content compiles into the static build.
- **Deployment:** Cloudflare Workers static assets is primary.
  `wrangler.jsonc` serves `out/` directly without a Worker script at `https://flight-school.kudakw-mutasa.workers.dev/`.
  GitHub Pages remains the base-path-safe fallback.
- **Design system:** The current Blueprint-led release system lives in [DESIGN.md](DESIGN.md), [SCREENS.md](docs/SCREENS.md), and [UI-RELEASE-SPEC.md](docs/UI-RELEASE-SPEC.md).
  Older Stitch, Claude Design, and mockup-brief artifacts are retained only as exploration history.

## Superseded Decisions Retained for History

The first V1 concept used five or six planes before the catalog was fixed at six.
It required the engine final-state mesh as the only finished-plane asset and prohibited image generation.
It proposed engine-rendered catalog thumbnails and live 3D Hangar cards on hover or selection.
It merged Stitch and Claude Design mockups, including chevron striping and academy licence treatments.
The 2026-08-10 release refinement superseded those presentation choices while preserving the procedural engine as the instructional source of truth.

A six-card Hangar grid with tier filters shipped in that refinement and was replaced on 2026-08-16 by the photographic bay.
Night Flight was a first-class dark theme across every screen until the same date.
Wings earned was styled as a flight certificate, with a Certified stamp and licence-tier naming, until completion was made truthful.
