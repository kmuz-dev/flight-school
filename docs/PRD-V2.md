# Flight School - Product Requirements Document (V2)

Status: **proposed, not approved for build.** V1 ships first, unchanged.
Companion documents: [PRD.md](PRD.md) (V1, the product this extends), [ADR 0002](adr/0002-flight-simulation-walled-exception.md) (flight simulation as a walled exception), [ADR 0003](adr/0003-camera-hand-input.md) (camera hand tracking as an optional additive input).
A SPEC-V2 follows before build; this document defines product behavior, and the two ADRs define the architecture that keeps it away from V1.

## 1. Vision

V1 teaches a cadet to fold a plane and stops at the moment the plane exists.
V2 answers the question every cadet asks next, which is "does it fly?"

It adds one place where the plane you folded actually flies, and one way to look at the paper while your hands are full of it.
Both are optional, both are additive, and neither changes anything a V1 user can already do.

## 2. Relationship to V1

V1's non-goals list ruled out flight simulation and interactive throwing tutorials, and §9 parked the latter in later iterations.
V2 is that later iteration.

The two non-goals are handled differently, on purpose:

- **Flight simulation** is granted a scoped exception, walled into a module the fold engine cannot see and consumed by exactly one route ([ADR 0002](adr/0002-flight-simulation-walled-exception.md)). The non-goal still holds everywhere else.
- **Camera input** is admitted only as an addition that can be removed without consequence ([ADR 0003](adr/0003-camera-hand-input.md)). No surface may require it.

Everything in V1's §4 that is not named above stays a non-goal: still no backend, still no accounts, still no AI-generated imagery, still no user-generated content.

## 3. What V2 is

1. **The Test Flight Bay**: a place to throw a plane you have earned and watch it fly, on real derived aerodynamics.
2. **Hand orbit**: the option to turn the paper in the tutorial by turning your hand, instead of reaching for a mouse.

That is the whole scope.
Both features share one camera pipeline; neither requires a camera.

## 4. What V2 is not

- Not a game with scores, levels, or unlocks beyond what V1's wings already establish.
- Not gesture navigation. The camera never operates menus, buttons, links, or step advancement. Hand tracking is good at coarse expressive gestures and bad at precise sustained control, and pretending otherwise would degrade a product that currently works with a mouse.
- Not multiplayer, not shared, not networked. No plane leaves the device, in either sense.
- Not two-handed. One hand, one job, in both features.
- Not a replacement for any V1 input. Pointer, touch, and keyboard remain complete on every surface.
- Not a change to the fold engine, the fold data schema, the tutorial's step flow, or the i18n split.

## 5. The Test Flight Bay

### 5.1 What it is

A dedicated route, reachable from the Wings screen immediately after earning a plane and from the Hangar for any plane already earned.
It is a place in the academy fiction: the bay where a finished aircraft is taken out and flown for the first time.

Only planes the cadet has completed can be flown.
This is the second reason the Hangar exists after all six planes are folded, which is currently the point at which the product ends.

### 5.2 The throw

The cadet throws the plane and watches it fly.

Throwing works four ways, and the plane cannot tell which was used:

| Input | Availability | Notes |
|-------|--------------|-------|
| Pointer / touch flick | Always | The baseline. Drag and release; velocity comes from the pointer events. |
| Keyboard | Always | Angle and power set explicitly, then launch. Also the accessible path. |
| Camera hand throw | Opt-in | Throw with your hand in front of the webcam. |
| Device motion | Opt-in, mobile | Flick the handset itself. iOS requires an explicit permission gesture. |

The pointer throw is the product.
The camera throw is the delight, and it is built last ([ADR 0003](adr/0003-camera-hand-input.md)).

### 5.3 The flight

The plane flies on a real point-mass glider model whose parameters are derived from the plane's own fold geometry, not authored per plane ([ADR 0002](adr/0002-flight-simulation-walled-exception.md)).

This is a product requirement, not only a technical one.
A cadet who folds the wide-winged Harrier and the narrow Dart must be able to see, without being told, that one floats and one darts, because the simulation is reading the same difference their hands just made in the paper.
The three behaviours real paper planes show - a steady glide, the slow porpoising oscillation, and a loop from a hard nose-up throw - all emerge from the model rather than being scripted.

Flight is both accurate and satisfying, and those are kept separate rather than traded.
Accuracy belongs to the physics and may not be fudged.
Satisfaction belongs to the launch mapping, the camera work, the scale, and the framing of the result.
A plane that flies badly because it is a bad glider is showing the cadet something true, and the response is to look at the fold sequence, not to add a correction factor.

### 5.4 After the flight

The bay reports what happened in the academy's technical voice: distance, airtime, and the shape of the flight path.
Personal bests per plane persist in localStorage alongside existing progress, under the same versioned key.

Two planes can be compared side by side.
This is where V1's flight profile ratings stop being editorial claims and become measurable, which is also a content quality signal: if the Harrier does not out-glide the Dart, either the ratings or the fold data is wrong.

### 5.5 Kid-clear bar

The V1 acceptance bar carries over unchanged.
A sharp 10-year-old must be able to throw a plane, read what happened, and try again without help, using only on-screen instructions and no camera.

## 6. Hand orbit in the tutorial

### 6.1 The problem it solves

A cadet folding along with the tutorial has one hand on a half-folded plane and paper dust on the other.
Wanting to see the model from underneath, they currently have to put the plane down and find the mouse.
That is the moment this feature exists for.

It is not a novelty input for people who have a mouse free.
It is for the specific state of having your hands full of the thing the site is teaching you to make.

### 6.2 How it works

The cadet opts in once, per session, from the tutorial's instrument strip.
After that:

- **Open palm** engages, and the paper on screen turns as their hand turns.
- **Closed fist**, or lowering the hand, disengages and holds the current view, so they can reposition and re-engage to keep turning past where their wrist runs out.

Palm rather than pinch, because the cadet's fingers are already pinching real paper: an open palm can be raised with the free hand while the other still holds the model ([ADR 0003](adr/0003-camera-hand-input.md)).

Rotation only.
Zoom stays on the existing controls.

### 6.3 Rules this feature lives under

- It never advances, replays, scrubs, or navigates anything. It turns the model, and that is all it does.
- Mouse, touch, and keyboard orbit are unchanged and remain fully functional at all times, including while hand orbit is engaged.
- If the camera is denied, the hand leaves frame, tracking quality drops, or the frame rate falls below the usable floor, the feature disables itself, says plainly what happened, and leaves the existing controls exactly as they were. It never fails silently and it never leaves the model stuck.
- The tutorial loads no camera code, and downloads no camera assets, for any cadet who does not opt in.

### 6.4 Presentation

The camera feed is not shown as video.
[DESIGN.md](../DESIGN.md)'s kitsch guard bans aviation photography, and a live webcam pane is effectively that: a photograph dropped into a product built entirely from paper and ink, plus the mild discomfort of watching yourself while you learn.

The tracked hand is drawn as an instrument overlay in the academy's own language - ink navy on cream, the same visual register as the crease annotations - with the raw feed available only as a small, dimmed confidence monitor the cadet can call up if tracking is misbehaving.
It should read as an instrument panel, not a video call.

## 7. Privacy

Non-negotiable, because this site is used by children.

- The camera is never requested on page load. It is requested only after an explicit action whose label says what it is for.
- The prompt states in plain language, in every locale, that video stays on the device, is never uploaded, and is never recorded. This is true: all inference is on-device and there is no backend to upload to.
- A stop control is visible whenever the camera is live, and it genuinely releases the device.
- The download size is stated before it is incurred.
- `Permissions-Policy: camera=(self)` ships in the Pages `_headers`.

## 8. Acceptance criteria

V2 is done when:

1. Every completed plane can be thrown and flown in the Test Flight Bay using only pointer, touch, or keyboard, with no camera present.
2. The flight model reproduces published paper-plane reference figures within a few percent, from geometry-derived parameters only, verified in the node test project.
3. The six planes' simulated flights rank consistently with their authored flight profile ratings, or the discrepancy is filed as a content bug.
4. The tutorial's bundle size, step flow, and no-camera behaviour are provably unchanged from V1.
5. Hand orbit and the camera throw work end to end in a Playwright run against recorded webcam video, deterministically.
6. Denying camera permission, revoking it mid-session, or covering the lens degrades gracefully on every surface, with a message a 10-year-old understands.
7. Both features work at all 12 locales, RTL included, and hold their kid-clear bar.
8. Still a purely static build on the free tier, with no server component and no third-party origin.

## 9. Build order

The order is load-bearing and is the main risk control ([ADR 0003](adr/0003-camera-hand-input.md)).

1. **Flight physics alone.** The integrator and the geometry-derived aerodynamics, unit-tested against published figures. No camera, no throw UI, no route. This is where the product value is and it is entirely deterministic.
2. **The Test Flight Bay with a pointer throw.** Ships the whole feature to every cadet, on every device, with zero permissions and zero download. If it is not fun here, hand tracking will not save it.
3. **Camera input behind the existing seams.** The shared hand source, then the throw detector and the palm orbiter. Nothing downstream changes. Labelled as an experiment.
4. **Everything that makes it a bay rather than a demo.** Distance markers, target rings, personal bests, comparison, wind. Only if step 2 proved the core is fun.

Hand tracking is the exciting part and the least valuable part.
Built first, it becomes load-bearing, and every cadet without a good camera, good light, or a fast machine gets nothing.
Built third, behind a stable seam, it is an extra that a fraction of cadets will try and all of them will remember.

## 10. Deferred beyond V2

- Wind, thermals, and indoor versus outdoor conditions.
- Aiming at targets, courses, or anything resembling a level.
- The deep aerodynamics explainer V1 deferred, which the simulator would now be able to illustrate honestly.
- WebXR hand input for headset browsers, which the V2 seams are designed to accept without change.
- Fold-along mode with camera assist, still deferred, and a materially harder computer-vision problem than either V2 feature.
