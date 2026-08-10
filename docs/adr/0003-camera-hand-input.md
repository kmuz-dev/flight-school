# ADR 0003: Camera hand tracking as an optional additive input

## Status

Proposed (2026-08-10), targeting V2.
Companion to [ADR 0002](0002-flight-simulation-walled-exception.md), which covers the flight model the throw feeds.

## Context

V2 wants the webcam in two places, for two different jobs.

1. **Throwing**, in the Test Flight Bay: one discrete gesture producing one launch, then the user is a spectator.
2. **Orbiting the paper**, in the tutorial: a continuous gesture, sustained for as long as the cadet wants to look at the model from another angle, with their hands full of half-folded paper.

These look like the same feature and are not.
Throwing is open loop: the user commits, releases, and every millisecond of latency lands after the moment they stopped caring.
Orbiting is closed loop: the user is watching the result and steering against it, so latency is directly felt.
Published pointing studies put the threshold where lag begins measurably degrading performance at around 82 ms, and MacKenzie and Ware measured a 64% increase in movement time and a 214% increase in error rate at 225 ms.
A realistic browser hand-tracking budget is 50-80 ms motion-to-photon: comfortably fine for throwing, and directly on the line for orbiting.

The second asymmetry matters more.
The Test Flight Bay is a bonus surface that did not exist in V1.
The tutorial is the acceptance-critical path - [PRD.md](../PRD.md) §8.1 is a human folding all six planes from on-screen instructions - and putting a camera, a WASM runtime, a 7.6 MB model and a gesture state machine anywhere near it is the single largest regression risk in V2.

Browser hand tracking itself is settled.
`@mediapipe/tasks-vision` (Apache-2.0) runs the whole thing on-device: 21 landmarks per hand, roughly 12-17 ms per frame on mobile-class hardware, no frame ever leaving the machine.
That last property is what makes it admissible at all under the no-backend rule.

## Decision

### One source, two interpreters

`app/engine/hand/` owns the expensive, shared half exactly once: camera acquisition, the Web Worker, the tracker, One Euro filtering, and the tracking-quality signal.
It emits a stream of filtered landmarks and nothing else.
It has no opinion about planes, throws, or orbits.

Two thin interpreters sit on top and are the only things that do:

- `ThrowDetector` consumes the stream and emits a discrete `LaunchVector` per throw.
- `PalmOrbiter` consumes the stream and emits continuous orbit deltas.

Every input method produces the same types the existing code already accepts.
A `LaunchVector` from a pointer flick, a keyboard, or a phone's accelerometer is indistinguishable downstream from one produced by the camera; orbit deltas from a palm enter the same `ControlsLike` seam that mouse drag already uses.
The camera is therefore a swappable input to features that work fully without it, not a dependency those features are built around.

### The camera is strictly additive, everywhere, always

Every surface the camera touches must be completely operable without it, by pointer, touch, and keyboard.
Hand input is never the only way to do anything.
If permission is denied, tracking fails, the model does not load, the hand leaves frame, or the achieved frame rate falls below the floor, the existing input path continues working untouched and the user is told plainly what happened.

No route may statically import `app/engine/hand/`.
It is loaded by dynamic import, from a lazily mounted component, only after an explicit opt-in click.
A user who never opts in downloads zero bytes of it, and the tutorial's bundle is byte-for-byte what it is today.

### Assets are self-hosted

The runtime and model are served from `public/mediapipe/`, resolved through `href()` like every other asset, and cached in the Cache Storage API.
A CDN import would break the basePath discipline that `app/lib/paths.ts` exists to enforce and would introduce a third-party origin into a product that currently has none.
Both files sit under Cloudflare Pages' 25 MiB per-file limit.

### The tutorial gesture is palm tilt with a fist clutch

An open palm engages; the model's orientation follows the palm's normal, computed from wrist, index MCP, and pinky MCP - the most rigid triangle on the hand, and one that needs no finger-level detail, so it survives motion blur and poor light.
A closed fist, or the hand leaving frame, disengages and holds the current orbit, so the cadet can reposition and re-engage to ratchet past the wrist's roughly ±70 degrees of comfortable travel.
Azimuth and elevation are gained up from palm rotation; elevation clamps to the renderer's existing `MIN_ELEVATION_DEG` and `MAX_ELEVATION_DEG`.

Palm was chosen over pinch on two grounds.
Mid-air manipulation studies find palm gestures beat pinch on both movement time and error rate.
More decisively: during a tutorial the cadet's fingers are pinching real paper, so a pinch gesture asks them to put the plane down, while an open palm can be raised with the free hand while the other still holds the model.

Zoom stays on the existing controls in V2.
One hand, one job.

### Latency is a requirement, not an aspiration

Because orbit sits on the perceptual threshold, the 80 ms budget is binding, and the mitigations are specified rather than optional:

- Detection runs in a Worker with `OffscreenCanvas`; MediaPipe's detect call is synchronous and would otherwise stutter the fold stage.
- Capture is driven by `requestVideoFrameCallback` at `frameRate: {ideal: 60}`.
- One Euro filtering, tuned separately per interpreter: steadier for orbit, more responsive for throws.
- The renderer approaches the target orbit through a critically damped spring. Residual lag then reads as the weight of paper rather than as system delay, which is the difference between a feature that feels tactile and one that feels broken.

When the achieved rate falls below the floor, the feature disables itself and says so.
It does not degrade silently.

### Power

Continuous inference for the length of a tutorial step is a real battery and thermal cost, unlike a two-second throw.
With no hand detected for a few seconds, the tracker drops to a low-rate presence poll and resumes full rate when a hand returns.

## Consequences

- The tutorial gains an optional input and no required ones. Its bundle, its acceptance criteria, and its no-camera behaviour are unchanged, which is what makes this admissible next to PRD §8.1 at all.
- One shared module amortises across both features. Building the throw does not pay for the camera twice.
- The `LaunchVector` seam means the Test Flight Bay can ship complete with a pointer-flick throw before any camera code exists, and the camera can be added later without touching physics or rendering. This is the intended build order.
- WebXR hand input, or a phone's accelerometer, can be added later as further producers behind the same seams, with no change downstream.
- Privacy is a first-class product surface, not a compliance footnote: the prompt must state in plain language that frames never leave the device and nothing is recorded, a persistent stop control must call `track.stop()`, and `Permissions-Policy: camera=(self)` goes in the Pages `_headers`. This site is used by children.
- Camera features are end-to-end testable in Chromium despite appearances: `--use-fake-device-for-media-capture` with `--use-file-for-fake-video-capture` feeds a recorded throw or a recorded palm rotation in as the webcam, so the whole pipeline becomes a deterministic Playwright regression rather than a manual one.
- Cost: roughly 10 MB on first opt-in, a gesture state machine to tune against real users, and a Safari path that is reported to fall back from the GPU delegate to WASM. That report is unverified and is the first thing to measure on real hardware, before anything downstream is built.
- Risk accepted: mid-air gesture usability is genuinely underexplored, and palm-tilt orbit may prove worse than a mouse for most people. The additive-only rule is what makes that outcome survivable - the feature is removed, and nothing else changes.
