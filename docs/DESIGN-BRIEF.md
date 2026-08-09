# Flight School - Mockup Brief (paste into Google Stitch / Claude Design)

This is the condensed, paste-ready version of [DESIGN.md](../DESIGN.md) for external mockup tools.
Paste everything below the line into the tool, then ask for the screen you want.

---

Design mockups for **Flight School**, a paper airplane tutorial website where every fold step is shown as a real animated 3D fold.
Users pick a plane from a catalog, then follow step-by-step 3D folding instructions from raw paper to a finished plane they can orbit.

**Identity: "A flight academy for paper."**
Difficulty tiers are pilot licenses (Beginner License, Pilot License, Ace License), completion badges are wings, the catalog is called the Hangar.
The fiction is carried entirely by typography, layout motifs, and copy.
Hard rule: NO cartoon pilots, NO clip-art clouds, NO aviation stock photos, no illustration clutter.

**Aesthetic:** mid-century flight academy - vintage airmail meets modern editorial.
The product is literally paper, so the interface is built from paper materials: cream paper surfaces, navy ink structure, airmail red moments.
Motifs: airmail chevron borders (red/blue diagonal stripes), dotted flight-path lines, perforated boarding-pass edges, subtle paper grain, rubber-stamp marks.

**Color:**

- Background paper cream `#F7F3E9`, raised cards white with soft warm shadows
- Ink navy `#1A2B4A` for all text, borders, and icons (borders use navy at low opacity, never gray)
- Airmail red `#D64541` for primary buttons, stamps, chevrons, active states - rare and loud
- Sky blue `#7FA8C9` for flight paths, progress, secondary info
- Stamped green `#4A7C59` for success and CERTIFIED marks
- Dark mode is "Night Flight": deep navy `#0E1626` surfaces, cream text, accents slightly brightened - a scene change, not an inversion

**Typography (Google Fonts):**

- Display: Archivo Black / Archivo 800, ALL-CAPS, tight tracking, used like airfield placards ("FLIGHT LICENSE: BEGINNER", "THE HANGAR") - headers and labels only
- Body: Instrument Sans, warm and highly legible; tutorial instructions at 18px minimum
- Data: IBM Plex Mono for step counters (STEP 04 / 12), paper specs, ratings, badge serials

**Layout:**

- The Hangar (home/catalog): disciplined grid of plane cards styled as spec-sheet boarding passes - perforated edge detail, plane render, name placard, license tier, step count, flight ratings (Speed / Distance / Airtime / Ease shown as mono-type gauge marks), wings badge if completed
- Tutorial screen ("cockpit stage"): large 3D fold viewer dominating 60%+ of the viewport, an instrument strip below it (replay button, scrub timeline, step counter), and an instruction rail beside it with the step instruction, an optional one-line "why", and first-use fold-term explanations. Mobile stacks the stage above the instruction card.
- 8px spacing base, comfortable density, generous space around the 3D viewer
- Border radius: 4px inputs, 8px cards; stamps and placards square-cornered; no pill buttons

**Motion notes (for interactive mockups):** fold animations are the star; UI motion is quiet.
Exactly two delight moments: a rubber-stamp CERTIFIED slam when a plane is completed, and cards lifting a few pixels like paper on hover.

**Tone of copy:** kid-clear (a 10-year-old follows it alone), warm, precise, lightly playful academy fiction ("Preflight: get your paper", "You've earned your wings").

**Avoid (category cliches):** pastel craft pink, endless uniform grids, numbered steps in pastel circles, script fonts, purple gradients, icon-in-colored-circle feature rows, centered-everything landing pages, stock photography.

**Screens to mock (in priority order):**

1. The Hangar - catalog grid with 6 plane cards across three license tiers, one card showing the completed/wings state
2. Tutorial step view - mid-sequence (e.g. STEP 04 / 12 of The Dart) with the 3D stage, instrument strip, and instruction rail
3. Plane detail / preflight - orbitable finished plane, flight profile ratings, throw tip, paper requirement, "Start folding" CTA
4. Completion moment - the CERTIFIED stamp over the finished plane with earned wings badge
5. Night Flight dark mode variant of screens 1 and 2
