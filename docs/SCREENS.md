# Flight School - Screen Synthesis Spec (V1)

This document merges two approved mockup explorations into the single screen-level design for the build.
It extends [DESIGN.md](../DESIGN.md) (tokens, type, color, motion) with per-screen composition decisions.

## Reference mockups (exported, in this repo)

- **Stitch export:** `docs/stitch_paper_academy_flight_school/` - four screens, each with `screen.png` and `code.html` (the_hangar_catalog, preflight_the_glider, tutorial_cockpit_step_04, wings_earned).
- **Claude Design export:** `docs/flight-school-design-system/project/Flight School.dc.html` - a single self-contained page showing all five screens: 1a Hangar, 1b Tutorial, 1c Preflight, 1d Completion, 1e/1f Night Flight dark variants of Hangar and Tutorial. Open it in a browser to view.

This spec was resolved decision-by-decision with the owner on 2026-08-09 and then verified against these exports.
Where prose and export conflict, this document wins; it records which parts of each export are adopted.

**Content caveat:** both mockups invented placeholder plane names (Stitch: Stuntman/Voyager/Ace/Stealth; Claude: Arrowhead/Hammerhead/Albatross/Comet) and step counts.
The canonical catalog is PRD.md section 5; mockup names and counts are visual filler.

## Synthesis rules (resolved decisions)

1. **Tutorial screen: follows the Claude Design mockup entirely**, plus one import (the tip bar, rule 5).
2. **Preflight screen: Stitch visual presentation + Claude Design information hierarchy.**
3. **Hangar: Stitch layout**, with live-3D floating planes on hover and selection.
4. **Wings certificate: keep as mocked, including the red/blue airmail striping** (the owner reconsidered and kept it).
5. **The Stitch bottom tip bar joins the tutorial screen** as its single Stitch import.
6. **Headline font is Archivo Narrow** (owner-identified from the Stitch theme).

## Screen 1: The Hangar (home / catalog)

- Grid of six plane cards in the Stitch mockup's arrangement (`the_hangar_catalog`): FLIGHT SCHOOL wordmark, THE HANGAR / MY LOGBOOK nav with dark-mode toggle, oversized THE HANGAR headline over a full-width rule, two rows of three cards.
- Each card (Stitch treatment): plane name in Archivo Narrow caps, tier chip top-right (BEGINNER navy-filled, PILOT outlined, ACE red-filled), plane render area, STEPS count in mono, SPEED and DISTANCE gauge bars. Completed planes get the diagonal "WINGS EARNED" stamp across the render, as mocked.
- Worth adopting from Claude Design's hangar (1a) at build time: the ALL / BEGINNER / PILOT / ACE filter chips and the wings counter in the nav; its denser card data (descriptions, dot-matrix ratings) stays out - Stitch's calmer card won.
- Footer: mono academy fiction line ("© CADET FLIGHT MANIFEST - LICENSE #0815-FA" style).
- **Card liveness:** default state shows a pre-rendered image of the finished plane. On hover (desktop) or selection (all devices), the card wakes a live 3D scene: the plane floats with a slow bob and gentle rotation. At most two live scenes at once; the least-recently-used scene sleeps back to its static render. Touch devices are selection-only.
- Non-live cards keep the 2-4px paper hover-lift from DESIGN.md.

## Screen 2: Preflight (plane detail)

Stitch visual presentation carrying Claude Design's information set. Verified inventory:

- **Frame and visual (from Stitch `preflight_the_glider`):** split screen with a dominant left orbit viewer (DRAG TO ORBIT hint, "FIG 1.1 - PROTOTYPE" specimen tag), right rail with license chip, plane name, and the big red START FOLDING button with offset-shadow 3D card treatment; the mono-italic tip strip sits directly beneath it.
- **Information set (from Claude Design 1c):** the fuller data - "PREFLIGHT: GET YOUR PAPER" spec table (Paper / Weight / Folds / Time), all four ratings (Speed, Distance, Airtime, Ease - Stitch showed only two), the THROW TIP callout card, and the social-proof mono line ("FOLDED 4,318 TIMES THIS MONTH" style). The "Watch flight" secondary action is deferred unless V1 builds a flight preview.
- Primary action: Start folding (or Resume at Step N when localStorage has progress).

## Screen 3: Tutorial (the core screen)

Follows the Claude Design mockup's composition exactly (screen 1b of the export). Verified inventory:

- **Top bar:** back link (← THE HANGAR), plane name, license chip; right side holds the linear 04/12 progress bar and EXIT.
- **Stage:** graph-paper grid backdrop; the 3D paper mid-fold with a red mono annotation naming the fold ("VALLEY FOLD - TO THE CENTER LINE") and a dashed target crease line; corner metadata (VIEW: 3/4 - DRAG TO ORBIT top-left, camera presets FRONT / 3/4 / TOP top-right, PLAYING FOLD 04 chip bottom-left, paper spec "A4 - 210 x 297 MM" bottom-right).
- **Transport bar (separate bar below the stage):** prev / play-pause / next, STEP 04 / 12 in mono, a segmented per-step progress strip (green done, red current, gray remaining), elapsed/total time with playback speed, and REPLAY.
- **Right rail (current-step info, not a step list):** red mono STEP 04 / 12 label, step title in Archivo Narrow caps, kid-clear instruction paragraph, a WHY callout box, a FOLD TERMS glossary with crease-pattern icons, a "My paper looks like this" self-check checkbox, Back and red "Next fold" buttons, and a mono "8 FOLDS TO YOUR WINGS" footer. On mobile the rail stacks beneath the transport bar.
- **Explicitly not adopted:** Stitch's left-hand TUTORIAL STEPS list (its tutorial screen `tutorial_cockpit_step_04` shows the alternative); the all-Claude decision drops it. The 04/12 progress bar in the top bar covers orientation.
- **Tip bar (Stitch import):** a small anchored tip strip at the bottom of the screen in mono italic, matching the treatment under Stitch's START FOLDING button ("Keep your creases sharp for maximum airtime."); per-step when a step declares one, per-plane otherwise.

## Screen 4: Wings earned (completion)

- The certificate moment as mocked in Stitch (`wings_earned`): a certificate card with **red/navy airmail striping borders top and bottom** (kept by explicit decision), left panel showing the dashed flight-arc with the green CERTIFIED stamp, right panel with red MISSION COMPLETE eyebrow, "YOU HAVE EARNED YOUR WINGS." in Archivo Narrow, cadet-voiced congratulation copy, and a REWARD ISSUED / BEGINNER WINGS badge card.
- Actions: LOG YOUR FLIGHT (navy, primary) and RETURN TO HANGAR (outlined) as mocked. Claude Design's completion (1d) adds fold-time / replays / wings stats and a "fold the next plane" pointer to the next tier - adopt those as secondary content below the certificate.
- The rubber-stamp CERTIFIED slam from DESIGN.md is the entrance animation for the stamp; the wings badge then appears on the plane's hangar card.

## Night Flight (dark mode)

- Claude Design screens 1e/1f are the working reference for Night Flight: deep navy surfaces, cream text, cards keeping their structure while the stage backdrop darkens. Follow DESIGN.md's dark-mode rules where the export doesn't show a surface.

## Open items

- None. All screens are verified against in-repo exports.
