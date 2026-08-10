# Known issues

Defects found and confirmed, with the evidence gathered, so the next session starts from what is known rather than from the symptom.
Fixed issues are removed from this file; the commit that fixes one says so.

## The finished plane reaches below the table

**Where:** every plane's settled geometry, so the preflight hero, the hangar cards and the last tutorial steps.
**Status:** measured, not yet judged. Nothing depends on it in V1 beyond the look of a shadow.

Measured from the pure core on the finished Dart (`computeFoldState` composed with `posesForState`, no renderer involved), the model occupies x[-25, 32], y[-148, 162], z[-36, 36] - 57 x 310 x 72mm.
The z range is symmetric about the table because the wing pair opens by rotating one layer up and the other down about the same crease, which is what the `layers: "top"` / `"bottom"` selector is for, and nothing then rests the finished plane on the table.
Paper below the table is not a thing.

Whether that is a defect or just an unmodelled convention should be settled before the physical fold test at Gate 4.
The stakes rise in V2: [ADR 0002](adr/0002-flight-simulation-walled-exception.md) derives planform area and span from the final pose projected onto the ground plane and dihedral from the bend angle on the wing facets, precisely so that no plane carries a hand-tuned coefficient.
An aircraft half of which is under the table would feed that model a silhouette it does not have, and the check ADR 0002 is proudest of - simulated flight ranking the fleet consistently with its authored ratings - would be measuring the defect rather than the content.
