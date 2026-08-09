# Integration tests (orchestrator-owned)

These tests span track boundaries and are written by the integrator, not by any
single track agent. They are the Gate 1+ acceptance checks.

- `geometry.test.ts` - runs each plane's authored fold sequence through the real
  engine and asserts the result is a plausible plane: no validation issues, area
  conserved, the final silhouette within expected bounds, layer counts sane.
  This is what replaces the physical fold test at Gates 1-3 (the owner deferred
  physical validation to launch).
- Track agents must not add files here.
