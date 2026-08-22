# Flight School - Screen Contract

Status: approved release direction, 2026-08-10.

This document defines the release composition and behavior of the four cadet-facing screens.
It extends [DESIGN.md](../DESIGN.md) and [UI-RELEASE-SPEC.md](UI-RELEASE-SPEC.md).
Where an older mockup, export, brief, or decision log conflicts with this document, this document wins.

## Reference boundary

The Stitch and Claude Design exports referenced in this repository's history are historical explorations, not implementation specifications, and were deleted at release.
The approved paper finish - material, lighting, edge treatment, dimensionality - is defined by the shipped Dart at `app/assets/aircraft/dart-hero.webp`, which is the artwork every other aircraft was matched to.
Canonical silhouettes come from the fold engine, not from any mockup: `docs/aircraft-art/references/<id>-canonical.svg` is rendered from each plane's own final `FoldState` and is regenerable at any time.

Generated beauty artwork is permitted only in the Hangar, Preflight, and Wings earned screens.
The procedural fold engine is authoritative for tutorial instructions, explicit 3D inspection, and static SVG fallback.
Every beauty render must match the corresponding engine final state before it is approved.

Display fallback order is fixed.
Beauty artwork is the default and remains visible while an explicitly requested inspection loads.
A successful inspection replaces it with WebGL.
If WebGL is unavailable or fails, the surface keeps or restores the beauty artwork, announces that 3D is unavailable, and offers a retry.
The canonical SVG replaces beauty artwork only when the beauty image itself also fails.

## Shared frame

- Keep the Flight School wordmark, locale selector, and wings count where the screen needs them.
- Provide a visible skip link on every screen with a substantial main region.
- Use one red primary action per screen.
- Keep navigation native, named, keyboard accessible, locale preserving, and correct in RTL.
- Announce loading and fallback states in plain language.
- Do not use My Logbook, licence numbers, manifest fiction, social proof, fabricated statistics, or externally suggestive certification.

## Screen 1: The Hangar

The Hangar is one aircraft in a photographed room, not a grid and not a dashboard.

Composition:

- Fill the viewport with the generated hangar interior and float one aircraft in it.
- Offset the composition: the aircraft toward the top-right, the placard in the lower-left, which also runs with the aircraft because the artwork's nose points low-left.
- Mirror that composition under Arabic RTL, including the scrim; do not mirror the aircraft artwork, which is shared with instructional screens.
- Stack on a phone with the aircraft above and the placard below, arrows on the bay edges and the marker strip over the floor.
- Show plane name, difficulty tier, fold count, and a Wings earned mark when applicable, on a placard lifted off the photograph by a scrim rather than by a panel.
- Keep the total wings count in the nav.

Selection:

- Give the fleet one marker per aircraft, filled when its wings are earned, marked `aria-current` when selected, and named so assistive technology hears both facts.
- Change aircraft from the arrows, the markers, the Left and Right keys, and a horizontal swipe over 90px, with Left and Right following the reading direction.
- Announce every selection change through a polite live region carrying name, tier, and fold count.
- Select the first unfinished aircraft once stored progress has hydrated; a new cadet and a cadet who has folded all six both open on the first aircraft.
- Hold the Wings earned mark until hydration rather than flashing an unearned state.

3D:

- Do not fetch or mount WebGL on arrival, on hover, or on focus.
- Request it only from a named Inspect in 3D button or a short drag, which is deliberate where a passing pointer is not.
- Keep at most one live scene; changing aircraft disposes it and returns the bay to beauty artwork.
- Keep beauty artwork visible until the stage is actually drawing, and let the stage draw through to the photograph rather than painting its own ground.
- Let the learner orbit and zoom within safe limits, disable pan, and provide a localized Reset view control that restores the authored aircraft camera.
- On WebGL failure, retain the beauty artwork, announce that 3D is unavailable, and offer a retry.
- Use the canonical SVG only if the beauty artwork also fails.
- The static build must fail content validation rather than shipping an empty fleet caused by missing plane data.

The primary action is opening the selected aircraft's Preflight screen.
3D inspection is secondary and optional.

## Screen 2: Preflight

Preflight answers two questions in order: which aircraft am I making, and is my paper ready?

- Lead with approved hero artwork of the finished aircraft.
- Offer no 3D inspection and mount no renderer. Preflight is a decision - which aircraft, which paper, start - and a viewer on the hero was a second thing to do at the moment the screen exists to make one choice. Live inspection belongs to the Hangar, where browsing is the point.
- Use the canonical SVG only if the beauty artwork fails.
- Make paper selection the dominant information block using native radio inputs styled as cards.
- Explain inline when a paper choice adds preparation folds or resets saved step progress.
- Show Start folding or Resume as the single red primary action.
- Keep the primary action sticky at the bottom on mobile without obscuring content.
- Show Speed, Distance, Airtime, and Ease only here under the heading Estimated flight profile.
- Treat the flight description and throw tip as secondary reading.
- Remove prototype labels, fake measurements, social proof, and licence styling.

## Screen 3: Tutorial

The tutorial is a learning workspace with one dominant procedural stage and no duplicate navigation.

- The header contains one Hangar escape, the plane name, and one authoritative progress display.
- The stage keeps orbit, zoom, Front, Three-quarter, and Top camera controls.
- Every fold uses the same photographic warm-white paper maps as explicit 3D inspection, while canonical fold geometry remains authoritative.
- The transport contains only Play or Pause, scrub, Replay, and elapsed or total time.
- The instruction rail contains the title, kid-clear action, optional explanatory paragraph, first-use fold-term disclosures, and optional useful tip.
- Remove duplicate Exit, licence placard, transport Back or Next controls, segmented full-step strip, consequence-free self-check, and repeated progress labels.
- Keep Back and Next or Finish as the only primary step-navigation controls.
- Add a labeled native step selector for compact direct access.
- Fold 1 opens paused.
- A directly selected, resumed, or revisited step opens paused.
- Deliberately advancing with Next auto-plays each later fold once.
- Step changes are announced through a polite live region without moving focus.
- On mobile, place the rail below the stage and keep Back and Next visible without covering instructions.
- The screen is exactly one viewport tall and never scrolls. Only the rail's prose scrolls, inside itself, so the stage, the transport and Back/Next hold their positions on every fold. Built as `h-[100dvh]` on the tutorial `main`; the tip is part of the rail, not a page footer, because a footer that only some folds carry moves everything above it.
- Reduced motion removes decorative movement but never removes instructional controls.
- If WebGL is unavailable, label the static SVG fallback rather than implying that it is interactive 3D.

Completion is recorded only when Finish is activated from the final tutorial step.

## Screen 4: Wings earned

Wings earned is an honest celebration, not a credential or certificate.

### Earned state

- Lead with approved hero artwork and the heading Wings earned.
- Describe the result as a Flight School achievement.
- Show the earned difficulty-tier wing without a licence number or Certified stamp.
- Offer the next uncompleted aircraft as the primary action when one exists and keep Return to Hangar secondary.
- When all six aircraft are complete, make Return to Hangar the primary action.
- Offer Fold it again as an explicit restart action that clears resume position and returns to Step 1 while preserving the earned wing.
- Do not show fold time, replay totals, or other unrecorded statistics.

### Unearned state

- Wait for browser progress state to hydrate before rendering an earned or unearned decision.
- A direct unearned visit says, "This wing has not been earned yet."
- Resume or Start tutorial is the primary action.
- Return to Hangar is secondary.
- Visiting this route never writes completion state.

## Required states

Every applicable screen must define and verify:

- Default, hover, focus-visible, active, disabled, and loading states.
- Narrow mobile, large mobile, tablet, and desktop layouts.
- Left-to-right and Arabic right-to-left layout.
- Reduced motion and increased text zoom.
- Beauty-image loading or failure.
- WebGL loading, active, inactive, and unavailable fallback.
- Hangar selection: first aircraft, first unfinished aircraft, and an all-complete fleet.
- No progress, resumed progress, completed, and unearned completion states.
