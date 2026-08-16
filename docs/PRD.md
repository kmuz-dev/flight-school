# Flight School - Product Requirements Document (V1)

Status: approved for release refinement.
Builder: GPT-5.6 (Codex).
Planning: Claude (Fable 5).
Companion documents: [SPEC.md](SPEC.md) (technical spec), [CONTEXT.md](../CONTEXT.md) (domain glossary and decisions), [ADR 0001](adr/0001-procedural-3d-fold-engine.md) (fold engine decision).
Visual behavior is defined by [SCREENS.md](SCREENS.md), [UI-RELEASE-SPEC.md](UI-RELEASE-SPEC.md), and [DESIGN.md](../DESIGN.md).

## 1. Vision

Flight School teaches anyone to fold great paper airplanes.
A user picks a plane from a catalog, and the site walks them from "what paper do I need" through every fold to a finished, flyable plane.
The procedural fold engine is the authoritative instructional representation, with replay, scrub, orbit, and an honest static fallback when WebGL is unavailable.
The reference point for quality is [thebuggeddev/anatomy](https://github.com/thebuggeddev/anatomy): a content-as-code interactive explorer where one polished 3D interaction pattern is reused across a curated catalog.

## 2. Audience

All ages, written kid-clear.
Every tutorial must be completable by a sharp 10-year-old working alone.
This is a hard acceptance bar, not a tone suggestion: no unexplained jargon, no ambiguous instructions, no step that assumes folding literacy.
Folding terms (valley fold, mountain fold, crease) are taught inline the first time they appear in a sequence.
Visual polish is adult-grade; kid-clear refers to clarity, not aesthetics.

## 3. What V1 is

A static tutorial website with:

1. A **catalog** of 6 planes in a difficulty ladder.
2. A **step-by-step tutorial** per plane, where every step is rendered by a shared procedural fold engine with interactive WebGL and a static SVG fallback.
3. **Paper Prep** as the start of every tutorial: the user says what paper they have, the site shows how to convert it.
4. A **light why-layer**: one-line explanations of what key folds accomplish, plus a flight profile per plane.
5. **Resume and completion** memory in the browser (localStorage).
6. **Multi-locale** launch using content-as-code dictionaries.

## 4. What V1 is not (explicit non-goals)

- No accounts, sign-in, or server-side state of any kind.
- No deep aerodynamics curriculum (lift/drag/CG diagrams are a later iteration).
- No dedicated throwing-technique tutorials (a short throw tip per plane is in scope; interactive throwing lessons are not).
- No generated imagery inside fold instructions or interactive 3D inspection.
- Generated beauty artwork is permitted only in the Hangar, Preflight, and Wings earned surfaces.
- Generated beauty artwork must be derived from and visually checked against the canonical final fold geometry; it may improve material, lighting, and presentation but may not redefine the aircraft.
- No user-generated content, comments, user-submitted ratings, or sharing infrastructure.
- No physics simulation of flight. The engine animates folding, not flying.

## 5. The catalog

Six planes across three difficulty tiers.
Difficulty is defined by step count and fold precision required, and every plane must be expressible as a flat-fold sequence (an engine constraint, see ADR 0001).

| Plane | Tier | Character | Paper |
|-------|------|-----------|-------|
| The Dart | Easy | The classic. Fast, straight, everyone's first plane. | Letter / A4 |
| The Bulldog Dart | Easy | Blunt-nosed and forgiving; flies well even when folded sloppily. | Letter / A4 |
| The Harrier | Medium | Wide-winged glider; slow, floaty, satisfying. | Letter / A4 |
| The Sea Glider | Medium | Long smooth glides; rewards crisp creases. | Letter / A4 |
| The Hammer | Advanced | Many-fold, nose-heavy distance plane. | Letter / A4 |
| The Square Cruiser | Advanced | Square-paper glider; exists partly to exercise the Paper Prep cutting flow. | Square (cut from Letter / A4 / 4x6) |

Exact fold sequences are content-authoring work during the build; the builder should source canonical, well-known folding sequences for the five named designs and design the sixth (Square Cruiser) as a straightforward square-paper glider.
Names may be adjusted during content authoring if a sourced design has a strongly established name; the tier structure and count are fixed.

### Flight profile

Every plane carries an estimated flight profile shown on its Preflight screen:

- Ratings, 1 to 5: **Speed**, **Distance**, **Airtime**, **Ease**.
- A one-paragraph flight description (how it behaves in the air, kid-clear).
- A one-or-two-sentence throw tip (grip and throw style, e.g. "throw hard and level" vs "release gently, slightly upward").

## 6. User journeys

### 6.1 Choose a plane

1. User lands on the Hangar (this is the home page): one aircraft, full-bleed, in a photographed hangar interior.
2. The placard beside it shows approved beauty artwork of the finished plane, name, difficulty tier, fold count, and a Wings earned mark if previously finished.
3. The bay opens on the first aircraft the user has not finished, once stored progress has hydrated.
4. Arrows, a marker strip, the Left and Right keys, and a horizontal swipe all change aircraft; the primary action opens the selected plane's Preflight screen.
5. An explicit secondary Inspect in 3D control, or a short drag, may mount the live final-state viewer; arriving, hovering and focusing never mount WebGL.
6. Preflight leads with larger approved beauty artwork, paper readiness, and a single primary action: Start folding or Resume.
7. Preflight offers explicit 3D inspection, an estimated flight profile, the flight description, and the throw tip as secondary information.

### 6.2 Paper Prep (Step 0)

1. The tutorial's first stage asks what paper the user actually has: Letter, A4, or 4x6 index card.
2. If the plane needs that paper as-is, prep confirms it and moves on.
3. If conversion is needed (e.g. Square Cruiser from Letter), the engine animates the convert sequence: fold the diagonal, mark, cut, showing cut lines on the paper mesh. Scissors-free tearing guidance is included where the fold-and-tear method works.
4. Prep steps are Steps like any other: same UI, same animation, same navigation.

### 6.3 Fold steps

1. Each Step shows: the procedural fold, the instruction text, one authoritative step counter (e.g. Step 4 of 12), and the optional one-line why.
2. The user can: replay the fold animation, scrub it with a timeline control, orbit and zoom the paper freely, and step forward or back.
3. First-use folding terms carry an inline explanation.
4. Fold 1 and directly selected or revisited steps open paused so the learner can orient; advancing deliberately to a later fold auto-plays it once.
5. The final Step presents the finished plane in a celebratory beat and records completion only when the learner finishes that step.

### 6.4 Resume and completion

1. Leaving mid-tutorial and returning to that plane offers Resume at the saved step (localStorage).
2. Completing a plane's final step stores completion; the catalog card gains a Wings earned mark.
3. Visiting the completion route directly never awards completion.
4. Fold it again clears resume position and returns to Step 1 without removing an earned wing.
5. Clearing browser storage resets everything; that is acceptable for V1.

## 7. Localization

- Launch locales match the anatomy repo's set: en, es, fr, de, pt, ru, hi, id, ja, ko, zh, ar (12 locales, ar is RTL).
- English is the source of truth. All other locales are translated dictionaries; a translation audit script verifies every key exists in every locale.
- Structure (step geometry, ratings, paper specs, ids) is locale-independent and lives outside dictionaries; only prose is translated. This mirrors the anatomy repo's structure/prose split.
- Locale is a URL segment (`/en/...`), selectable in the UI, defaulting from browser language.

## 8. Acceptance criteria

V1 is done when:

1. All 6 planes are foldable end-to-end from the site by a tester following only on-screen instructions with real paper, and the physical result flies.
2. Every step of every plane renders through the procedural fold engine with replay, scrub, and orbit working when WebGL is available, plus a clearly identified static SVG fallback.
3. Paper Prep produces correct paper from all three supported source formats wherever a conversion is defined.
4. Resume state and Wings earned marks survive a browser restart.
5. All 12 locales build, pass the translation audit, and render correctly including RTL Arabic.
6. The site deploys as a purely static build through Cloudflare Workers static assets on the free tier with no Worker script or server component.
7. Initial Hangar and Preflight visits do not download the 3D renderer until the user explicitly requests inspection.
8. The renderer pauses while its stage is offscreen or the document is hidden and resumes without creating duplicate animation loops.
9. Lighthouse performance is respectable on a mid-range phone; the 3D engine degrades gracefully to a clearly identified static render when WebGL is unavailable.

## 9. Later iterations (explicitly deferred)

- Deep flight science: per-plane aerodynamics explainers (thrust, lift, drag, weight, center of gravity) with diagrams.
- Interactive throwing tutorials.
- More planes; community-submitted designs.
- Fold-along mode with camera assist.
- Print-friendly fold diagrams generated from the same fold data.
