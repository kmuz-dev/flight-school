# Aircraft art

What the release keeps of the beauty-art work, and what each retained file is for.

The rejected v1 pass, the intermediate chroma sources, the transparent masters, and the day and night review sheets were deleted at release: they were about 20 MB of history in a repository whose whole point is that every visual is either an engine render or one 50 KB WebP, and none of them is needed to reproduce or to check the result.
What remains is the canonical geometry each aircraft was matched against, the prompts, and the audit that measures the match.

## Source of truth

- `references/<id>-canonical.svg` is rendered directly from each production plane's final `FoldState` at its exact `AIRCRAFT_DISPLAY_VIEWS` angle, with geometry-derived rest and no contact shadow.
- `references/<id>-canonical.png` is the raster construction reference used during generation.
- `references/canonical-contact-sheet.png` shows the six together.
- `../../app/assets/aircraft/<id>-hero.webp` is the one 1280 x 1024 beauty render per aircraft, shared by the Hangar, Preflight and Wings earned.
- `../../app/assets/hangar/hangar-interior.jpg` is the generated photograph the Hangar bay is set in.

The procedural fold model remains authoritative for instruction.
The canonical renders were used as construction blueprints rather than visual styling targets.
The approved Dart defined the required photographed-paper material, lighting, dimensionality, and edge treatment, and shipped byte-for-byte unchanged through the whole release.

## One asset per aircraft

The catalogue used to ship a 640 x 512 card beside the 1280 x 1024 hero, plus a test asserting the two were the same picture at two sizes.
That is what a responsive `sizes` attribute already negotiates, so the second file bought nothing and cost a way for the pair to disagree.
`tests/content/presentation.test.ts` now asserts the asset directory contains exactly one file per aircraft and nothing else, so a stale second export cannot sit there unrendered and unchecked.

## Fidelity boundary

Beauty artwork is an approved presentation layer, not physical proof of a fold.
The procedural tutorial remains authoritative, and the real-paper launch review remains the final validation of the physical aircraft.

The automated silhouette score uses uniform contain scaling with transparent letterboxing, so it cannot improve a result by stretching either axis.
Each floor sits below the accepted release value by a meaningful regression margin:

| Aircraft | Accepted normalized IoU | Regression floor | Aspect-drift cap |
| --- | ---: | ---: | ---: |
| Dart | 0.502 | 0.48 | 10% |
| Bulldog | 0.921 | 0.90 | 5% |
| Harrier | 0.777 | 0.75 | 24% |
| Sea Glider | 0.961 | 0.93 | 5% |
| Hammer | 0.885 | 0.86 | 5% |
| Square Cruiser | 0.944 | 0.91 | 5% |

The Dart and the Harrier sit lowest on purpose.
The Dart is the owner-approved artwork the rest of the fleet was matched to, and its long needle nose reads as a much thinner silhouette than the geometry's.
The Harrier keeps an intentionally simplified high view, because that is where its broad planform and both folded wingtip fins are legible; it records 22.6% aspect drift and is capped at 24% so a later export cannot widen it further unnoticed.
Both are paired with structural geometry tests: the Dart must retain its needle nose and central spine, and the Harrier must retain its broad span and a raised fin on each wingtip.

The Bulldog and the Hammer sit below the 0.9 the geometry-led images once held, and that is the corrected-nose pass being honest rather than a regression - see the note in `PROMPTS.md`.

## Legibility

Two grounds, two checks, both in `tests/content/presentation.test.ts`.

Against the Preflight stage's cream gradient the accepted set runs 1.26 to 1.48, floored at 1.20.
White paper on cream is the hard case by construction, so this is a legibility floor rather than a WCAG text ratio.

Against the Hangar's photographed plate the set runs 10.1 to 11.5, floored at 5.
That one is measured by compositing each aircraft over the real `hangar-interior.jpg` rather than over two sampled hexes, so there is nothing to drift out of step with the CSS - and it is measured *ungraded*, which is the conservative direction: the shipped plate is darkened by `brightness(0.72)`, so the floor cannot be quietly satisfied by the CSS doing work the artwork should be doing.

## Regeneration

Camera calibration and canonical reference regeneration are deterministic:

```bash
npx tsx scripts/audit-aircraft-art.ts                    # search readable views per aircraft
npx tsx scripts/audit-aircraft-art.ts --write-references  # re-render the canonical SVG/PNG pairs
```

Regenerating an aircraft's artwork means the built-in image generation tool with the prompt in `PROMPTS.md`, generated on a flat `#00ff00` background and then chroma-keyed to transparency.
Whatever it produces has to clear the audits above before it can ship.

The 2026-08-16 shared-material audit retained every canonical fold and authored display view.
The search output found strong alternative silhouette-only angles, but the accepted views remained more legible as aircraft and preserved the existing Dart and Harrier presentation decisions documented above.
No display-only geometry was introduced.
