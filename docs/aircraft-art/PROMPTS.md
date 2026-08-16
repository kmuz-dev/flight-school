# Selected production aircraft prompts

The Dart was not regenerated in the release pass.
The owner-approved transparent source was promoted directly to production and ships byte-for-byte unchanged.

The five prompts below are the exact prompts used for the selected built-in image generation results.
For each, Image 1 was the corresponding geometry-faithful first-pass chroma image and Image 2 was the approved premium Dart.
Both input sets were deleted at release; the equivalent construction reference is `references/<id>-canonical.png`, which is rendered from the plane's own final `FoldState` and is reproducible at any time from `scripts/audit-aircraft-art.ts --write-references`.

## What shipped, and what these prompts produced

Three of the five aircraft below - Harrier, Sea Glider, Square Cruiser - ship exactly what these prompts produced.

**The Bulldog and the Hammer do not.**
Both were regenerated once more in a later nose-correction pass, because the images these prompts produced still read the Bulldog's folded-back nose as two wide rails and the Hammer's as a solid block rather than a paper-built stack.
That pass's prompt text was not retained, and it is not reconstructed here: a plausible-looking prompt that did not produce the shipped image would be worse than an honest gap, and this release spent most of its effort removing exactly that kind of invented record.

What pins those two instead is measurement rather than provenance.
Both are held to a silhouette IoU against their own canonical geometry, an aspect-drift cap, coverage and padding bounds, a chroma-fringe ceiling, and legibility floors on both grounds - all in `tests/content/presentation.test.ts`, all reproducible, and all failing loudly if a future export drifts.
The Bulldog and Hammer prompts below are kept as the closest recorded starting point, and anyone regenerating either should expect to iterate on the nose from here.

## Bulldog

```text
Use case: style-transfer
Asset type: premium transparent Bulldog beauty artwork for Hangar and Preflight
Input images: Image 1 is the exact Bulldog aircraft to refine and the geometry invariant. Image 2 is the approved material, depth, edge, lighting, and premium realism target.
Primary request: Restyle Image 1 into a convincing editorial studio photograph of a real hand-folded white paper Bulldog. CHANGE ONLY the physical paper realism, lighting, and local fold depth. Preserve Image 1's exact compact silhouette, small short flat blunt nose at lower left, wing planform, layered center keel, perspective, orientation, proportions, and padding. The folded-back nose must read as a small heavy stack at the front of an otherwise simple airplane, not as two wide rectangular rails. Apply Image 2's strong facet separation, visible sheet thickness, crease compression, warm highlights, cool fold occlusion, and tactile paper fiber.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background.
Style/medium: premium physically based product photograph of real warm-white 90gsm uncoated paper.
Lighting/mood: stronger warm grazing key from upper left, cool soft fill, rich but clean ambient occlusion in overlaps, subtle rim, dimensional and sculptural.
Constraints: keep Image 1's geometry and silhouette unchanged; one complete plane; generous padding; crisp isolated edges; no external cast or contact shadow; background uniform #00ff00 with no gradient or floor; no text, props, labels, watermark, or green in the subject.
Avoid: washed-out facets, flat vector shading, large rectangular front, twin fuselage rails, box craft, long pointed nose, invented folds, fins, plastic, metal, card stock, outline drawing.
```

## Harrier

```text
Use case: style-transfer
Asset type: premium transparent Harrier beauty artwork for Hangar and Preflight
Input images: Image 1 is the exact Harrier fold construction and planform invariant. Image 2 is the approved paper material, edge, lighting, and premium realism target.
Primary request: Rephotograph Image 1 as a convincing real hand-folded white paper Harrier glider. Preserve its simple broad folded-sheet construction: short blunt nose, very broad wings, mild dihedral, slim center keel, and the two small nested upturned folds at the OUTER WINGTIPS. Raise the camera to a more elevated three-quarter angle so the broad planform and both tip fins are immediately readable and the center keel appears thin and secondary. Do not reproduce Image 1's pale vector shading or line art. Apply Image 2's tactile material, strong facet separation, compressed folds, visible sheet thickness, warm highlights, and cool occlusion.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background.
Style/medium: premium physically based product photograph of real warm-white 90gsm uncoated paper.
Composition/framing: elevated three-quarter view, blunt nose toward lower left, broad wings fully visible, both tip fins visible, generous padding, no crop.
Lighting/mood: warm grazing upper-left key, cool soft fill, rich but clean ambient occlusion in overlaps, subtle rim, dimensional and sculptural.
Constraints: preserve Image 1's folded-sheet topology and broad silhouette; one complete plane; center keel low and narrow; exactly two small fins formed from wingtip folds; crisp separated edges; no external cast/contact shadow; background uniform #00ff00 with no gradient or floor; no text, props, labels, watermark, or green in subject.
Avoid: dominant vertical center slab, fantasy fuselage, box craft, stealth bomber, jet, cockpit, tailplane, detached winglets, extra fins, pointed Dart nose, washed-out facets, vector trace, plastic, metal, card stock.
```

## Sea Glider

```text
Use case: style-transfer
Asset type: premium transparent Sea Glider beauty artwork for Hangar and Preflight
Input images: Image 1 is the exact Sea Glider fold construction and geometry invariant. Image 2 is the approved tactile paper, lighting, edge, and premium realism target.
Primary request: Rephotograph Image 1 as a convincing real hand-folded white paper Sea Glider. Preserve its wide slow-glider planform, compact pointed nose, visibly layered hemmed leading edge, broad wings, slim keel, mild dihedral, orientation, and proportions. Do not reproduce the pale vector shading or trace its pixels. Apply Image 2's tactile material, compressed crease ridges, visible sheet thickness, strong facet separation, warm highlights, cool overlap shadows, and physical presence.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background.
Style/medium: premium editorial product photograph or physically based studio render of real warm-white 90gsm uncoated paper.
Composition/framing: elevated three-quarter view, nose lower left and tail upper right, full broad planform visible, generous padding, no crop.
Lighting/mood: warm grazing upper-left key, restrained cool fill, rich clean ambient occlusion in the hem and keel, subtle rim, dimensional and sculptural.
Constraints: preserve Image 1's construction and silhouette; one complete plane; crisp isolated edges; no external cast/contact shadow; uniform #00ff00 with no gradient, floor, reflection, or lighting variation; no text, props, labels, watermark, or green in subject.
Avoid: washed-out facets, flat vector shading, box craft, blunt rectangular fuselage, tail fins, fantasy jet, plastic, metal, card stock, wireframe outlines.
```

## Hammer

```text
Use case: style-transfer
Asset type: premium transparent Hammer beauty artwork for Hangar and Preflight
Input images: Image 1 is the exact Hammer fold construction and geometry invariant. Image 2 is the approved tactile paper, lighting, edge, and premium realism target.
Primary request: Rephotograph Image 1 as a convincing real hand-folded white paper Hammer distance plane. Preserve its compact weighted pointed nose, visibly compressed multi-layer rolled paper bar, broad swept wings, layered center keel, mild dihedral, orientation, and proportions. Do not copy Image 1's pale vector shading or trace its pixels. Apply Image 2's tactile paper fiber, clear sheet thickness, crisp crease compression, strong facet separation, warm highlights, cool deep occlusion through the dense layered nose, and physical presence.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background.
Style/medium: premium editorial product photograph or physically based studio render of real warm-white 90gsm uncoated paper.
Composition/framing: elevated three-quarter view, weighted nose lower left and tail upper right, full plane visible, generous padding, no crop.
Lighting/mood: warm grazing upper-left key, restrained cool fill, deep but clean ambient occlusion through layered nose and keel, subtle rim, dimensional and sculptural.
Constraints: preserve Image 1's construction and silhouette; nose must remain paper-built rather than solid; one complete plane; crisp isolated edges; no external cast/contact shadow; uniform #00ff00 with no gradient, floor, reflection, or variation; no text, props, labels, watermark, or green in subject.
Avoid: washed-out facets, flat vector shading, hammer tool, box craft, blunt rectangular body, tail fins, fantasy jet, plastic, metal, cardboard, wireframe outlines.
```

## Square Cruiser

```text
Use case: style-transfer
Asset type: premium transparent Square Cruiser beauty artwork for Hangar and Preflight
Input images: Image 1 is the exact Square Cruiser fold construction and geometry invariant. Image 2 is the approved tactile paper, lighting, edge, and premium realism target.
Primary request: Rephotograph Image 1 as a convincing real hand-folded white paper Square Cruiser. Preserve its broad stubby square-paper proportions, compact layered pointed nose, wide triangular wings, short tail, center keel, mild dihedral, orientation, and silhouette. Do not copy Image 1's pale vector shading or trace its pixels. Apply Image 2's tactile paper fiber, clear sheet thickness, crisp crease compression, strong facet separation, warm highlights, cool overlap occlusion, and physical presence.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background.
Style/medium: premium editorial product photograph or physically based studio render of real warm-white 90gsm uncoated paper.
Composition/framing: elevated three-quarter view, compact nose lower left and tail upper right, broad stubby proportions readable, generous padding, no crop.
Lighting/mood: warm grazing upper-left key, restrained cool fill, rich clean ambient occlusion around the locked nose and keel, subtle rim, dimensional and sculptural.
Constraints: preserve Image 1's construction and silhouette; one complete plane; crisp isolated edges; no external cast/contact shadow; uniform #00ff00 with no gradient, floor, reflection, or variation; no text, props, labels, watermark, or green in subject.
Avoid: washed-out facets, flat vector shading, long Dart nose, box craft, rectangular fuselage, tail fins, fantasy jet, plastic, metal, card stock, wireframe outlines.
```

## Rejected iteration notes

- The first Bulldog regeneration was rejected because the front became two broad rectangular rails instead of a small folded-back blunt nose. The prompt above is the corrected one; the image it produced still read as rails, which is why the Bulldog went through the later nose pass described at the top of this file.
- The first Harrier regeneration was rejected because its camera made the center fold read too much like a fantasy central slab.
- The washed-out first release set was deleted at release. It was kept for rollback, and nothing ever rolled back to it: the regression floors in `tests/content/presentation.test.ts` are what a bad export is now caught by, and they do not need a copy of the bad export to compare against.
