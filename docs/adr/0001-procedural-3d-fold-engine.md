# ADR 0001: Procedural 3D fold engine as the step-visual medium

## Status

Accepted (2026-08-09)

## Context

Fold Steps need a visual medium.
Candidates: AI-generated static diagrams per step, pre-rendered video clips, or a real-time 3D fold engine.
ChatGPT image generation cannot hold a paper model geometrically consistent across a 12+ step sequence, so image-per-step pipelines fight permanent consistency drift.
Pre-rendered clips (Blender/Remotion) are controlled but produce a heavy per-plane asset pipeline (60-80 clips for the V1 catalog) with no interactivity.
Paper airplane folds are almost entirely flat folds: a region of a planar mesh rotating around a crease line, which is tractable to animate procedurally.

## Decision

Build a Three.js fold engine as the single renderer for all planes.
Paper is a polygon mesh; each Step is declarative data (crease line, affected region, rotation angle, timing).
Step visuals are animated, scrubbable, orbitable 3D folds computed from that data.
The finished-plane 360 viewer is the same mesh in its final folded state - no separate asset.
ChatGPT image generation is used for hero/beauty/catalog art only, never for step instruction visuals.

## Consequences

- Adding a plane means authoring fold data, not producing 12+ bespoke images or clips - the catalog scales cheaply after the engine exists.
- All planes automatically share one visual style; consistency is structural, not editorial.
- The engine is the single riskiest build item; it needs a vertical-slice proof (one plane end-to-end) before catalog fan-out.
- Fold data authoring needs tooling (a dev-mode previewer) since hand-writing crease coordinates blind is impractical.
- Non-flat details (curved wing tucks, pockets) must be approximated or simplified; designs that cannot be expressed as flat-fold sequences are out of catalog scope.
