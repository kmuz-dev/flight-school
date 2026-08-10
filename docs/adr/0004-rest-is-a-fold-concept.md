# ADR 0004: Rest is a fold-engine concept, not a flight one

## Status

Accepted (2026-08-10), shipped in V1.
Constrained by [ADR 0002](0002-flight-simulation-walled-exception.md), which walls flight out of the fold engine, and by [ADR 0001](0001-procedural-3d-fold-engine.md), which owns the pose composition this sits outside of.

## Context

Every plane in the catalog was being displayed lying on its side, cut in half by the stage floor.

Measured from the pure core, with no renderer involved: the finished Dart occupied `z[-35.7, +35.9]`, the Harrier `z[-79.6, +81.2]`, the Sea Glider `z[-84.3, +84.6]`.
The wingspan axis ran vertically and the model straddled the table plane, so roughly half of each aircraft sat below an opaque floor mesh on every display surface - the Preflight hero, the live Hangar cards, the build-time SVG behind each card, and the Wings certificate.

This is not a bug in any one of those surfaces.
It is a consequence of the authoring frame being the only frame the engine had.
A fold sequence is authored in TABLE space: the sheet lies in the plane `z = 0` and every crease is a line in that plane, which is exactly right for describing folds and says nothing at all about how the finished object sits afterwards.
A wing pair is a partial fold, so both wings carry a bend of about 85 degrees about the wing crease; the keel between them is what the aircraft actually rests on, and nothing in the engine had ever been asked to work that out.

The temptation is to call this "flight attitude" and reach for the flight model.
That is the wrong frame and ADR 0002 forbids it, for good reason: the fold engine must stay a fold engine, and a `dihedral`/`angle of attack`/`trim` vocabulary inside `app/engine/core/` would be the first crack in that wall.

There is also a second-order reason to fix it in the core rather than per surface.
ADR 0002's own planform derivation reads span and area from "the final pose projected onto the ground plane".
With the wingspan running up the z axis, that projection returns the *fuselage*, not the planform.
The V2 flight model would have been fed a silhouette the aircraft does not have, and the check that ADR 0002 is proudest of - simulated flight ranking the fleet consistently with its authored ratings - would have been measuring this defect rather than the content.

## Decision

### The concept is *rest*, not attitude

Paper does not go below the table it is resting on.
That is a statement about folded paper, in the same register as "paper is conserved" and "a fold is an isometry", and it needs no aerodynamics to justify.
`app/engine/core/rest.ts` computes the rigid motion that takes a settled state from its authoring frame to the frame it would rest in on a table.
It contains no flight vocabulary and no tuned constants.

### The core exposes the transform; it never applies it

`restFrame(state)` and `restTransform(state)` are pure functions of a `FoldState`.
Callers left-multiply the result onto a pose.

The core cannot apply it itself.
`poseAtProgress(delta, t)` interpolates between two *different* states, and the rest transform of the state a step starts in is not the rest transform of the state it ends in - a step that opens a wing changes the roll.
Applying rest inside the interpolation would mean the model reoriented itself continuously through every fold, and would break the contract stated in `app/engine/render/coreApi.ts` that `poseAtProgress(delta, 1)` equals `posesForState(after)`.

### It is applied strictly outside the pose composition

`app/engine/core/pose.ts` documents the composition law:

```
pose = bendRotations · translateZ(layer · thickness) · lift3D(flatMap)
```

Rest is not a term in it and must never become one.
`delta.axis` is a TABLE-space line and `poseAtProgress` left-multiplies its rotation onto `poseForFacet(...)`; a rest transform composed *inward* would leave each facet in rest space while its fold axis stayed in table space, and every fold would then turn about the wrong line.

The enforcement point is `SceneModel.root.matrix`, a group matrix with `matrixAutoUpdate = false`.
A whole-model transform on a group is outside the per-facet composition by construction rather than by discipline, so this cannot be got wrong by a later edit that only reads `pose.ts`.
The flat SVG projection applies it the same way, as `multiply(restTransform(state), pose)`, one level out from `poseForFacet`.

### The derivation is data, not a table of angles

Per state:

1. **Hinge** - group facets by the axis of their *last* bend and pick the axis carrying the most **area**. Area rather than facet count, so a wing that a later crease happened to subdivide does not lose the vote. The Harrier bends its fins before its wings, so its wing facets carry `bend = [fin, wing]` and only the last entry identifies the hinge.
2. **Bisector** - the area-weighted mean of the bent facets' posed centroids, taken perpendicular to the hinge. Area-weighted rather than vertex-averaged, so re-siting one crease endpoint cannot move the whole aircraft's roll.
3. **Roll** - the signed rotation about the hinge carrying that bisector onto the perpendicular component of `+Z`.
4. **Seat** - a translation putting the lowest posed vertex at `z = 0`.

No plane carries a rest angle.
Measured across the catalog the derivation returns 84.6 to 88.3 degrees, and afterwards every plane is longer than it is wide and wider than it is tall - which is the axis assignment ADR 0002 will read, now true rather than assumed.

### Two properties that are the point of the design

- **Exactly the identity for any state with no bends.** No bends means no hinge, and `poseForFacet` gives `z = layer · thickness ≥ 0` with layer 0 always present after `renormalizeLayers`. All 69 flat states across the catalog verify as bit-identical. This is what lets the tutorial turn rest on from step 1: the sheet stays exactly where it was authored, and the model rights itself at the moment it becomes a plane, which is also the moment a person would pick it up.
- **Roll about a hinge plus a translation in z. No yaw, no pitch.** Nothing moves in y, so every claim the content tests make about noses and tails in table space survives verbatim.

## Consequences

The fold engine gains one concept and one file, and no flight vocabulary.

`ADR 0002`'s planform derivation now has the projection it assumed.
When V2 lands, `restTransform` is the function it composes with before projecting, and the span it measures is the span.

The 60-to-120-degree roll assertion in `tests/engine/rest.test.ts` is a guard against a future plane whose fins carry more area than its wings; it fails per plane and names the plane.
That is the known failure mode of the area vote, and it is loud rather than silent.

`docs/KNOWN-ISSUES.md` loses its only entry.
