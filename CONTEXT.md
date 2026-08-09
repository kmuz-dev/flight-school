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
| Step | One atomic folding action a user performs. Has an instruction, a visual, and (later iterations) a "why" explanation. |
| Paper Prep | The pre-folding stage: what paper size/type is needed and how to cut common paper (e.g. Letter, A4, 4x6) down to it. |

## Decisions

- **V1 catalog**: 5-6 Planes in a difficulty ladder - two easy, two medium, one or two advanced.
- **Step visuals**: a procedural Three.js fold engine renders every Step as an animated, scrubbable, orbitable 3D fold ([ADR 0001](docs/adr/0001-procedural-3d-fold-engine.md)).
- **Finished-plane viewer**: the same engine mesh in its final folded state; no separate asset.
- **No image generation**: ChatGPT image gen was wanted only for 3D/motion/folding, which the engine now covers. All visuals (steps, 360 viewer, catalog thumbnails) are engine renders. No external art pipeline.

- **Paper Prep**: rendered by the same fold engine as 'Step 0' of each sequence. Each Plane declares required paper; the user picks what they have (Letter / A4 / 4x6) and the engine animates the convert-and-cut sequence.
- **Why-layer (V1)**: optional one-line "why" per Step plus a per-Plane Flight Profile (speed/distance/stunt ratings, flight description, throwing guidance). Deep aerodynamics is a later iteration.
- **User state**: localStorage only - resume position per Plane, completed badges. No accounts, no backend state.
- **i18n**: multi-locale at launch (anatomy-style content-as-code dictionaries). English is the source of truth; other locales are translated dictionaries audited against it.

- **Stack**: Next.js 16 App Router + TypeScript + Tailwind 4 + Three.js + GSAP, in full static-export mode (`output: 'export'`). The anatomy repo's library set without its vinext/Cloudflare-Workers harness.
- **Backend**: none. No database, no API routes, no auth. All content is TypeScript data compiled into the static build.
- **Deployment**: Cloudflare Pages free tier (unlimited bandwidth, PR preview deploys). GitHub Pages is the documented fallback (same static output, needs basePath config). This is a free-hosting demo project by design.
