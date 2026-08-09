# Flight School - Screen Synthesis Spec (V1)

This document merges two approved mockup explorations into the single screen-level design for the build.
It extends [DESIGN.md](../DESIGN.md) (tokens, type, color, motion) with per-screen composition decisions.

## Reference mockups

- **Stitch mockup:** https://stitch.withgoogle.com/projects/14318462981884802277 (private to the owner's Google account)
- **Claude Design mockup:** https://claude.ai/design/p/365cb68f-d8e4-46e4-b05b-c277c2336ab8?file=Flight+School.dc.html

**Provenance warning for builders:** these links require the owner's logins; automated agents cannot open them.
This spec was authored from the owner's approved verbal synthesis of both mockups, resolved decision-by-decision in a grilling session on 2026-08-09.
Where this spec conflicts with a memory of either mockup, this spec wins.
Exported screenshots should be added to `docs/design-refs/` when available; until then, this document is the ground truth.

## Synthesis rules (resolved decisions)

1. **Tutorial screen: follows the Claude Design mockup entirely**, plus one import (the tip bar, rule 5).
2. **Preflight screen: Stitch visual presentation + Claude Design information hierarchy.**
3. **Hangar: Stitch layout**, with live-3D floating planes on hover and selection.
4. **Wings certificate: keep as mocked, including the red/blue airmail striping** (the owner reconsidered and kept it).
5. **The Stitch bottom tip bar joins the tutorial screen** as its single Stitch import.
6. **Headline font is Archivo Narrow** (owner-identified from the Stitch theme).

## Screen 1: The Hangar (home / catalog)

- Grid of six plane cards in the Stitch mockup's multi-card arrangement, grouped by license tier.
- Each card: plane render, name placard (Archivo Narrow caps), license tier, step count, flight ratings in IBM Plex Mono, wings badge when completed.
- **Card liveness:** default state shows a pre-rendered image of the finished plane. On hover (desktop) or selection (all devices), the card wakes a live 3D scene: the plane floats with a slow bob and gentle rotation. At most two live scenes at once; the least-recently-used scene sleeps back to its static render. Touch devices are selection-only.
- Non-live cards keep the 2-4px paper hover-lift from DESIGN.md.

## Screen 2: Preflight (plane detail)

- **Visual layer (from Stitch):** the glider presentation the owner praised - large plane displayed with dimension/3D feel - and the "Start folding" card treatment: a card that reads as 3D, carrying the plane render and display type together.
- **Information layer (from Claude Design):** the clearer information hierarchy - flight profile ratings, flight description, throw tip, paper requirement - arranged with Claude Design's cleaner grouping and clarity.
- Primary action: Start folding (or Resume at Step N when localStorage has progress).

## Screen 3: Tutorial (the core screen)

Follows the Claude Design mockup's composition:

- **Stage card:** the 3D fold viewer in its own clearly bounded card; the fold animation is the slick, paper-folding motion the owner approved.
- **Step counter:** its own separate bar at the bottom of the stage (STEP 04 / 12 in IBM Plex Mono).
- **View controls:** a separate bar in its own right (orbit/zoom/replay/scrub), distinct from the step counter bar.
- **Step list:** the sequence of steps listed in a rail on the right; current step highlighted; completed steps checkable at a glance. On mobile the rail collapses beneath the stage.
- **Tip bar (Stitch import):** a small anchored tip strip at the bottom of the screen with contextual folding tips ("crease with your fingernail for a sharper edge"); per-step when a step declares one, per-plane otherwise.

## Screen 4: Wings earned (completion)

- The certificate/badge moment as mocked in Stitch: wings badge and certificate presentation, **including the red/blue airmail striping**.
- The rubber-stamp CERTIFIED slam from DESIGN.md fires here; the wings badge then appears on the plane's hangar card.

## Open items

- Export screenshots of both mockups into `docs/design-refs/` (owner action; agents cannot access the links).
- Night Flight dark-mode variants of screens 1-3 were not part of this synthesis round and follow DESIGN.md's dark-mode rules.
