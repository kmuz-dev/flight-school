# Design System - Flight School

## Product Context

- **What this is:** A paper airplane tutorial site where every fold step is an animated 3D fold rendered by a shared fold engine (see docs/PRD.md).
- **Who it's for:** All ages, written kid-clear; a sharp 10-year-old completes any tutorial alone.
- **Space/industry:** Craft tutorials / interactive education. Category peers (foldnfly.com, origami.me) are functional but visually dated.
- **Project type:** Static content web app with a heavy interactive 3D component.
- **Memorable thing:** "A flight academy for paper." Tiers are licenses, completion badges are wings, the catalog is the Hangar. The fiction lives in typography, borders, and microcopy, never in cartoon illustration.

## Aesthetic Direction

- **Direction:** Mid-century flight academy: vintage airmail meets modern editorial.
- **Decoration level:** Intentional. Airmail chevron borders, dotted flight-path lines, perforated ticket edges, subtle paper grain, rubber-stamp marks.
- **Mood:** The product is literally paper, so the site is built from paper materials: cream surfaces, ink navy structure, airmail red moments. Warm, precise, quietly playful. Classy first, themed second.
- **Kitsch guard (hard rule):** No cartoon pilots, no clip-art clouds, no aviation photos. The fiction is carried by type, layout motifs, and copy only.

## Typography

All faces are on Google Fonts so external mockup tools (Stitch, Claude Design) can load them.

- **Display/Hero:** Archivo Narrow (600/700). All-caps, tight tracking, placard style: "FLIGHT LICENSE: BEGINNER". Reserved for headers and section placards only; never body-length text. (Confirmed against the approved Stitch mockup, which uses Archivo Narrow for headlines.)
- **Body:** Instrument Sans (400/500/600). Kid-clear, warm, highly legible at tutorial reading sizes.
- **UI/Labels:** Instrument Sans 600, sentence case for buttons, small-caps-feel labels via Archivo 700 at small sizes.
- **Data/Flight details:** IBM Plex Mono (400/500), tabular-nums. Step counters, paper specs, ratings, badge serials. This is the technical-document voice of the academy.
- **Code (docs only):** IBM Plex Mono.
- **Loading:** Google Fonts, `display=swap`, preconnect. Self-host at build time in production (static export).
- **Scale (rem):** display-xl 3.5 / display 2.5 / h1 2.0 / h2 1.5 / h3 1.25 / body 1.0 (16px) / small 0.875 / micro 0.75. Tutorial instruction text renders at 1.125 minimum; kids read it at arm's length.

## Color

- **Approach:** Restrained two-ink system plus one accent. Color is meaningful: red means action or achievement, blue means information and flight.
- **Paper (background):** `#F7F3E9` cream; raised surfaces `#FFFFFF` with soft warm shadow.
- **Ink (primary text/structure):** `#1A2B4A` navy. Borders, rules, and icons use ink at reduced opacity, not gray hexes.
- **Airmail red (accent):** `#D64541`. Primary CTAs, stamps, chevrons, active states. Rare and loud.
- **Sky blue (secondary):** `#7FA8C9`. Flight paths, progress, informational highlights.
- **Semantic:** success `#4A7C59` (stamped green, used for CERTIFIED marks), warning `#C98A2C`, error `#B03A2E`, info `#7FA8C9`.
- **Neutrals:** derive from ink navy at opacity steps (87%, 60%, 38%, 12%), never pure grays; keeps everything warm and coherent.
- **Dark mode ("Night Flight"):** a scene change, not an inversion. Surfaces `#0E1626` deep navy, raised `#16223A`, text cream `#F7F3E9`, red and sky accents lifted ~10% in lightness. Paper grain becomes subtle star-grain. The 3D stage gets a darker backdrop with rim lighting on the paper.
- **Contrast:** all text pairs must pass WCAG AA; instruction text passes AAA.

## Spacing

- **Base unit:** 8px.
- **Density:** Comfortable, generous around the 3D stage; the fold viewer always gets breathing room.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout

- **Approach:** Hybrid. The Hangar (catalog) is grid-disciplined; the tutorial is a composed stage.
- **The Hangar:** responsive grid of plane cards styled as spec-sheet boarding passes: perforated edge, plane thumbnail, name placard, license tier, step count, flight-profile ratings in mono, wings badge when completed.
- **The tutorial (cockpit stage):** 3D fold viewer dominant (60%+ of viewport on desktop), instrument strip beneath it (replay, scrub, step counter), instruction rail beside it (instruction, why-line, fold-term gloss). On mobile the stage stacks above the instruction card.
- **Grid:** 12-column desktop, 4-column mobile; max content width 1200px; the 3D stage may bleed wider.
- **Border radius:** sm 4px on inputs and chips, md 8px on cards; stamps and placards are square-cornered. No pill buttons except the scrub handle.

## Motion

- **Approach:** The folds are the star and get full choreography (GSAP timelines, scrubbable). UI motion is minimal-functional.
- **Delight moments (exactly two):** the rubber-stamp CERTIFIED slam on plane completion (scale-down + slight rotation + ink-bleed), and plane cards lifting 2-4px like paper on hover.
- **Easing:** enter ease-out, exit ease-in, move ease-in-out; fold animations use gentle ease-in-out with a slight settle.
- **Duration:** micro 50-100ms, short 150-250ms, medium 250-400ms; fold animations 800-1500ms depending on fold size.
- **Reduced motion:** honors `prefers-reduced-motion`; folds jump to end state with a crossfade.

## Avoid-List (from category research)

Pastel craft pink; endless uniform card grids; numbered steps in pastel circles; script or handwritten fonts; ad-cluttered step pages; purple gradients; icon-in-colored-circle feature rows; centered-everything landing pages; stock photography.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-09 | Initial design system created | /design-consultation with competitive research (origami.me captured; foldnfly and flyporter unreachable headless). User chose the flight-academy fiction over the engine-as-hero direction. |
| 2026-08-09 | Two-ink + one-accent palette | Kitsch guard: the academy fiction stays classy through restraint, theming via type and motifs only. |
| 2026-08-09 | Display face is Archivo Narrow | User approved the Stitch mockup's headline font and identified it as Archivo Narrow; same family as the original Archivo choice. |
| 2026-08-09 | Airmail chevron striping stays | User initially disliked it on the certificate, then reversed on direct question; motif remains system-wide. |
| 2026-08-09 | Hangar planes go live-3D on hover and selection | Cards show static renders by default; a hovered or selected card wakes a floating, slowly rotating 3D plane. Touch devices get selection-only. |
| 2026-08-09 | Screen-level synthesis of Stitch + Claude Design mockups | Recorded in docs/SCREENS.md; tutorial follows Claude Design, preflight is Stitch visual + Claude info, plus a tutorial-bottom tip bar. |
