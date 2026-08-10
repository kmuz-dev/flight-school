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
- **Display ground:** `#F0E7D3` kraft into `#D8C9A8`, graded top to bottom. The ground a finished aircraft is presented against on a hangar card, the preflight hero and the certificate: `--color-stage-sky` and `--color-stage-ground`, mirrored in the fold engine's `STAGE_THEMES` because the live stage paints its own backdrop in GL. It is a surface, never a text ground (see the Decisions Log, 2026-08-10).
- **Ink (primary text/structure):** `#1A2B4A` navy. Borders, rules, and icons use ink at reduced opacity, not gray hexes.
- **Airmail red (accent):** `#D64541`. Primary CTAs, stamps, chevrons, active states. Rare and loud.
- **Sky blue (secondary):** `#7FA8C9`. Flight paths, progress, informational highlights.
- **Semantic:** success `#4A7C59` (stamped green, used for CERTIFIED marks), warning `#C98A2C`, error `#B03A2E`, info `#7FA8C9`.
- **Neutrals:** derive from ink navy at opacity steps (87%, 60%, 38%, 12%), never pure grays; keeps everything warm and coherent.
- **Dark mode ("Night Flight"):** a scene change, not an inversion. Surfaces `#0E1626` deep navy, raised `#16223A`, text cream `#F7F3E9`, red and sky accents lifted ~10% in lightness. Paper grain becomes subtle star-grain. The 3D stage gets a darker backdrop with rim lighting on the paper.
- **Contrast:** all text pairs must pass WCAG AA; instruction text passes AAA.
- **Text-weight variants:** the accent hexes above are for surfaces and marks. Where a colour carries text, or sits under it, the palette uses a darkened variant so the rule above holds: `--color-red-ink`, `--color-sky-ink`, `--color-ink-muted`, and `--color-on-red` for the label on a red action surface. Night Flight redefines all four (see the Decisions Log, 2026-08-10). `tests/design/contrast.test.ts` measures every pair against globals.css and fails below AA.

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
- **Delight moments (exactly three):** the rubber-stamp CERTIFIED slam on plane completion (scale-down + slight rotation + ink-bleed); plane cards lifting 2-4px like paper on hover; and the buoyant float a finished aircraft carries on every display surface (see the Decisions Log, 2026-08-10).
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
| 2026-08-10 | Display surfaces drop the graph-paper floor for a graded backdrop and a soft contact shadow | Deviation from SCREENS.md §1 and §2, which give every 3D surface the tutorial's floor. A floor is a teaching aid: it tells a cadet where the table is while paper is being folded on it. A finished aircraft is a photograph of an object, and a grid under a floating plane reads as a plane that failed to take off. The backdrop is drawn in GL, not CSS - the canvas is `alpha: false`, so the panel gradients behind it have never once shown through. The shadow is a fake alpha quad, not a shadow map: hangar cards render at the preview tier, where shadow mapping is off outright. The tutorial keeps its floor unchanged. |
| 2026-08-10 | Finished aircraft float rather than rotate | Reverses the "slowly rotating" half of the 2026-08-09 hangar decision. A constant spin holds the hero angle for about a second and then parks all six cards at the same non-hero angle in lockstep, which is the opposite of letting someone read a shape. The float is a slow bob and lateral drift on two incommensurate periods (4s and 6.5s) with a 5-degree bank taken as the derivative of the drift, so the aircraft rolls into its slide. Amplitudes are fractions of the model's bounding radius, never millimetres, so a 179mm Square Cruiser and a 310mm Dart breathe by the same visual angle. Phase is an FNV-1a hash of the plane id: no two cards breathe together, and a card the LRU evicts and re-wakes resumes rather than jumps. |
| 2026-08-10 | The third delight moment is the finished plane leaving the table | On the last fold of a tutorial the aircraft rises clear of the ground over 0.9s and holds there, then the certificate follows. Stepping back or scrubbing backwards puts it down again, because a cadet who moves off the last step is folding again. Under `prefers-reduced-motion` the staging is kept and only the motion is dropped: the plane is lifted, still, and does not breathe. |
| 2026-08-10 | A finished aircraft is presented on kraft, not on the page's own cream | The display ground was `--color-raised` -> `--color-paper`, i.e. `#FFFFFF` -> `#F7F3E9`, chosen so a still card and the live scene that wakes over it were the same picture. They were, and both were washed out: a lit white sheet renders around `#F2F0EA`, so the top stop was *brighter* than the aircraft and the bottom stop was 1.03:1 against it. A silhouette whose ground crosses its own value from one end of the frame to the other has no reading anywhere in between, and no lighting rig recovers contrast the backdrop has already removed - which is why several rounds of relighting had not fixed the flat, ugly cards. Kraft is the same cream carried toward manila, which is where the airmail fiction pointed anyway: `#F0E7D3` -> `#D8C9A8`, 1.44:1 at the ground stop where the plane sits and its shadow lands. Night Flight is unchanged; it never had the problem. The pairing rule survives intact as `--color-stage-sky` / `--color-stage-ground`, one token pair read by all three still surfaces and mirrored once in the engine, with `tests/render/sceneModel.test.ts` failing if the two copies drift or if either stop climbs back toward the paper. |
| 2026-08-10 | A display surface and a tutorial are lit for different jobs | The two shared one rig, and the compromise is what the fleet looked like. A tutorial is a diagram: the sheet has to sit unmistakably on its floor at every step, including the first, where it is one flat rectangle on a flat plane and only value separates the two. That wants generous ambient. A finished aircraft is a photograph of an object, and ambient is exactly what stops an object having form, because a hemisphere adds the same value to every surface facing up and that is most of a paper aeroplane. Measured on the Hammer, the Dart and the Sea Glider, the shared rig rendered two or three panel values at a darkest-to-brightest ratio of 0.69 in 3D and 0.87 on the still cards. The display rig drops the ambient and the fill to 0.35 and resolves four or five panels at 0.42, which is about where a white sheet in soft light sits; going further starts collapsing panels together again at the dark end. The tutorial rig is unchanged. Both renderers now read one `DISPLAY_RIG` in `app/engine/view.ts` beside the camera and the lamp directions they already shared - they had drifted, the SVG lighting a rim the stage had switched off. Night Flight already lit for form and keeps its own numbers. |
| 2026-08-10 | Paper is drawn with thickness, a turned edge and a translucent terminator | Three changes with one purpose: an aircraft that reads as a photographed object rather than a render. A facet was an infinitely thin quad, and a knife edge cannot catch a highlight, so every fold met its neighbour in a hard line and the eight layers at the Hammer's keel drew as one surface; each facet is now a 0.17mm slab with a chamfered edge, which gets the crease radius for free because a crease radius IS the paper's thickness. A generated fibre map, anisotropic like real machine-made paper and hung on the sheet rather than the facet, varies the specular so a large panel stops being one printed value. And a wrap term softens the terminator, standing in for the fact that a sheet is thin enough to pass light through itself - the one thing about paper no arrangement of lamps can imitate, since a lamp can fill a shadow but only translucency softens the edge of one. No new assets: the fibre is procedural, which keeps the no-AI-imagery rule intact. |
| 2026-08-10 | Text-weight variants of the accents, rather than new accents | An axe-core scan found 56 contrast failures across the four cadet screens, all of them the palette rather than the components: airmail red reaches 4.39:1 against white, sky blue 2.52, and the 60% and 38% ink steps 3.99 and 2.18 - so the Contrast line above was not actually being met anywhere secondary text or a red button appeared. The accents keep their hexes as surfaces and marks, and darken only for the job they are too light to do: `--color-red-ink` #C0362F, `--color-sky-ink` #456F93, `--color-ink-muted` ink at 70%. The 60% and 38% steps stay in the palette for what the Color section already assigns them - borders, rules, icons - and no longer carry prose. In Night Flight the lifted accents are already legible, so the text variants are the accents themselves; what flips is the label on a red surface, which becomes deep navy, because a lifted red is a light colour and white on it fails at 3.10. |
