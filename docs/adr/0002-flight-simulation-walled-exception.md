# ADR 0002: Flight simulation as a walled exception, not a reopened non-goal

## Status

Proposed (2026-08-10), targeting V2.
Supersedes nothing.
Scopes an explicit exception to [PRD.md](../PRD.md) §4: "No physics simulation of flight. The engine animates folding, not flying."

## Context

V2 introduces the Test Flight Bay: after a cadet earns their wings, they throw the plane they just folded and watch it fly.
That requires simulating flight, which V1 ruled out as a non-goal.

The non-goal was written to protect the fold engine.
Its purpose was to stop flight concerns leaking into a module whose job is hard enough already, and to keep the V1 catalog from acquiring an aerodynamics authoring burden per plane.
Both of those reasons still hold.
Neither of them is an argument against flight simulation existing somewhere else in the product.

There is a second question underneath: whether simulated flight should be physically accurate or merely satisfying.
These are usually traded against each other, and the trade is usually resolved by hand-tuning per-object coefficients until it feels good.
That resolution is unavailable here.
Flight School is an academy: a plane that flies badly on screen because it is a bad glider is teaching something true, and a plane fudged to fly well is teaching something false.

## Decision

The V1 non-goal stands, restated with its real boundary: **the fold engine never knows about flight**, and no V1 surface simulates it.

Flight simulation lives in a new sibling module, `app/engine/flight/`, that the fold engine does not import and does not know exists.
Exactly one route consumes it: the Test Flight Bay.
The tutorial, the Hangar, Preflight, and the Wings screen are unchanged.

The model is a point-mass longitudinal glider, four state variables (speed, flight path angle, range, altitude), integrated with RK4 at a fixed 1/240 s substep.
It is pure TypeScript with no Three.js and no DOM, so it unit-tests in the existing node vitest project exactly as the fold maths does.

**Aerodynamic parameters are derived from fold geometry, never authored.**
`computeFoldState(structure, steps.length)` already yields the finished plane in millimetres.
Mass is sheet area times paper weight; planform area and span come from the final pose projected onto the ground plane; aspect ratio, lift-curve slope and induced drag follow from those; wing dihedral is already present in the model, because a wing pair is a partial fold and the bend angle on the wing facets *is* the dihedral.
No plane carries a hand-tuned coefficient.

**Accuracy and satisfaction are separated rather than traded.**
Accuracy is owned by the physics, which derives from geometry and may not be fudged.
Satisfaction is owned by everything around the physics: the mapping from a throw to launch conditions, camera work, scale, trails, sound, and the framing of the result.
When a flight feels bad, the fix is in the presentation layer or in the fold data, never in a per-plane fudge factor.
If a plane genuinely flies badly, that is a finding about the fold sequence and should be treated as one.

## Consequences

- The `flightProfile` ratings in `app/content/` gain a check they never had: if the Harrier does not out-glide the Dart in simulation, either the ratings or the fold data is wrong. This is a feature, and it is the main reason to derive rather than author.
- Physics correctness is pinnable. The model reproduces the published figures for a 3 g, 0.017 m², AR 0.86 reference plane (best L/D 5.2, angle of attack 9.3 degrees, equilibrium speed 3.7 m/s, phugoid period 1.7 s) to within a few percent using only the derivations above, so those become regression tests rather than opinions.
- The three characteristic paper-plane behaviours - steady glide, phugoid porpoising, and a full loop from a hard nose-up throw - emerge from the same four equations. None of them is scripted, and none may be scripted.
- Adding a plane still costs only fold data. The aerodynamics arrive with it.
- The Test Flight Bay is deletable. Nothing outside it depends on `app/engine/flight/`, so the exception can be revoked without touching V1 code.
- Paper weight becomes a real product variable (80 gsm assumed). If Paper Prep ever offers card stock, mass changes and flight changes with it, correctly and for free.
- Cost: a second engine module to maintain, and a class of bug reports ("my plane flies wrong") whose root cause may be in fold data rather than in the simulator. The determinism of both halves is what makes that diagnosable.
