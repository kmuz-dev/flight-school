# Photographic Hangar mass-integration plan

Status: approved for implementation on 2026-08-16.

This is the decision-complete handoff for integrating the approved photographic Hangar and the pending Flight School release work into `main`.

## Handoff state

The working tree was deliberately cleaned before this plan was committed.
No application implementation from the interrupted execution remains applied.

Four renderer commits remain on local `main`, ahead of `origin/main`:

- `e3d2a1d` Give a white aircraft a ground it can be seen against
- `1db6e6f` Give the sheet its thickness, so a crease has a radius
- `1ccd4b3` Spend the depth buffer on the model, not on the air in front of it
- `3f12896` Light a finished plane like an object, not like a diagram

The original uncommitted release work is preserved in Git stash commit:

```text
12deef6415d22d8b44045458e8e1f8d5c4ec649b
```

Apply it on a fresh integration branch without dropping the recovery point:

```bash
git switch -c integration/photographic-hangar-release main
git stash apply 12deef6415d22d8b44045458e8e1f8d5c4ec649b
```

Do not use `git stash pop` until the release is complete.

The byte-for-byte pre-execution safety inventory is retained at:

```text
/private/tmp/flight-school-photographic-hangar-safety-20260816T115132/
```

The approved standalone Hangar mockup and final generated assets are at:

```text
/private/tmp/claude-501/-Users-kuda-Desktop-Builders-Station-Flight-School/3edffe05-59a5-4852-9a0a-873c87ee81cc/scratchpad/bay/
```

Important asset paths inside that directory:

- `hangar-interior.jpg`
- `aircraft-photoreal-v2/`
- `nose-audit-v3/bulldog-v3.webp`
- `nose-audit-v3/hammer-v3.webp`
- `hangar-bay.html`

The Dart embedded in the mockup is byte-for-byte identical to the current approved `app/assets/aircraft/dart-hero.webp`.

## Approved product decisions

- Keep all pending product work: renderer, Preflight, Tutorial, engine resilience, localization, deployment, and truthful completion.
- Replace the card catalog with the full photographic Hangar mockup.
- Retire the old catalog and tier filters rather than moving them to another route.
- Use the new high-fidelity aircraft on every beauty-art surface: Hangar, Preflight, and Wings earned.
- Keep the procedural engine authoritative for Tutorial, explicit 3D inspection, and SVG fallback.
- The Hangar primary action opens Preflight.
- Hangar 3D inspection is available through a short drag and an explicit accessible button.
- Horizontal swipes continue to change aircraft.
- Remove Night Flight completely, including stored preference, UI, renderer theme, translations, and tests.
- Select the first unfinished aircraft when the Hangar hydrates.
- Only Tutorial Finish awards completion.
- Direct completion-route visits never award a wing.
- Use focused atomic commits and preserve the four existing renderer commits.
- Push `main` normally after all local checks pass.
- Do not force-push and do not rewrite the four existing commits.
- Do not wait for or babysit the live deployment after pushing.
- Keep only lean aircraft evidence in Git.
- Delete the explicitly excluded bulky or obsolete artifacts after their required final assets have been integrated.

## Implementation plan

### 1. Restore and branch safely

- Create `integration/photographic-hangar-release` from current local `main`.
- Apply stash commit `12deef6415d22d8b44045458e8e1f8d5c4ec649b` without dropping it.
- Confirm the restored tree matches the safety inventory before editing.
- Preserve unrelated user changes and never use `git reset --hard` or broad cleanup commands.

### 2. Retain the engine and Tutorial release work

- Keep renderer-chunk failure recovery that resolves to the static SVG engine without memoising a failed import.
- Keep `FoldEngineHandle.renderMode`, `FoldEngineHandle.setRenderActive()`, and `EngineOptions.displayView`.
- Keep per-aircraft display cameras and congruent WebGL/SVG display framing.
- Keep offscreen and hidden-document render suspension without changing playback state or creating duplicate animation loops.
- Keep the stable one-viewport Tutorial shell, simplified transport, direct native fold selector, fixed instruction rail, and Back/Next navigation.
- Ensure only deliberate Next autoplays a new fold.
- Initial entry, resume, Back, direct selection, and same-step selection must remain paused.
- Ensure mobile still exposes usable camera controls or an equivalent accessible inspection control.
- Keep Tutorial Finish as the only completion write.
- Add observability for unexpected renderer import or constructor errors before falling back, while expected WebGL capability failure remains a normal SVG fallback.

### 3. Consolidate aircraft presentation

- Keep the approved Dart asset byte-for-byte unchanged.
- Replace Bulldog, Harrier, Sea Glider, Hammer, and Square Cruiser with the final mockup assets.
- Use `nose-audit-v3/bulldog-v3.webp` and `nose-audit-v3/hammer-v3.webp` for the corrected noses.
- Use one hero beauty asset per aircraft across Hangar, Preflight, and Wings earned.
- Remove duplicate `*-card.webp` assets and card-only presentation fields.
- Simplify `AircraftPresentation` to one beauty asset, Hangar scale, hero scale, object position, and canonical display view.
- Preserve canonical SVG fallback data independently from generated beauty art.
- Re-run silhouette, alpha, luminance, and byte-budget audits against the accepted final assets.
- Set regression floors just below measured accepted values, without weakening geometry assertions.

### 4. Keep and finish Preflight

- Retain the beauty-art hero and explicit 3D opt-in.
- Retain native paper radio controls and the warning that changing paper clears incompatible resume progress.
- Retain the estimated flight profile and sticky mobile primary action.
- Do not request the Three.js renderer on initial Preflight load.
- Keep beauty art visible while inspection loads.
- On WebGL failure, show and label the canonical SVG fallback.
- Remove all Night Flight hooks and pass Paper presentation directly.

### 5. Replace the Hangar

- Port the approved `hangar-bay.html`, `bay.css`, and `bay.js` behavior into production React components rather than embedding the standalone HTML.
- Store the generated hangar photograph as a production asset.
- Preserve the full-screen photographic composition, typography, placard, arrows, dots, contact shadow, desktop layout, and verified mobile stacking.
- Preserve the 680ms aircraft handoff, 4-second bob, 6.5-second sway, phase hashing, shared flight route, and shadow response.
- Disable float and decorative transition motion when reduced motion is requested.
- Use actual localized plane names, tier names, step counts, progress state, links, and wings count.
- Select the first unfinished aircraft after storage hydration.
- New users begin with the Dart.
- Users who have completed all six also begin with the Dart.
- Make arrows, dots, Left/Right keys, and horizontal swipe all select aircraft.
- Mark the current dot with `aria-current` and announce selection changes through a polite live region.
- Make the primary CTA open the selected aircraft's Preflight route.
- Remove the six-card grid, tier filters, `PlaneCard`, card-hover behavior, and obsolete filter strings and tests.
- Do not mount WebGL on initial load, hover, or focus.
- A short drag or explicit Inspect in 3D button loads the selected aircraft's real renderer in place.
- A horizontal swipe over 90px changes aircraft.
- Changing aircraft disposes the active scene and returns the newly selected aircraft to beauty-art mode.
- Never keep more than one Hangar renderer alive.
- Keep beauty art visible while WebGL loads.
- If WebGL fails, replace the inspection surface with the labeled canonical SVG fallback.

### 6. Make Wings earned truthful

- Remove the route-arrival `recordCompletion` effect.
- Add an explicit progress-hydration signal shared by the Hangar and completion route.
- Render neither earned nor unearned completion content until hydration finishes.
- Earned state uses the selected aircraft's beauty art, genuine earned date, tier wing, and real progress totals.
- Direct unearned visits explain that the wing has not been earned and offer Start or Resume tutorial.
- Visiting the route directly must never modify completion state.
- Offer the next unfinished aircraft as the primary earned-state action.
- If all six are complete, make Return to Hangar the primary action.
- Fold it again clears resume progress, returns to Step 1, and preserves the earned wing.
- Remove certificate, Certified, licence, manifest, and fabricated credential language from UI, translations, documentation, and tests.
- If beauty art fails, show the canonical SVG fallback.

### 7. Retire Night Flight

- Delete the theme toggle and theme client module.
- Remove the first-paint theme bootstrap script from the root layout.
- Remove the stored `theme` field from the active storage schema.
- Continue reading existing progress, completion, locale, and paper-choice data from `flightschool.v1` while ignoring legacy theme values.
- Remove `.night` CSS tokens and alternate page styles.
- Collapse Three.js stage themes and engine options to the Paper presentation.
- Remove theme labels from all 12 locale dictionaries.
- Remove theme-specific component, contrast, renderer, presentation, accessibility, and E2E tests.
- Keep the photographic Hangar intentionally dark.
- Keep instructional screens on the cream Paper system.

### 8. Keep the hardened deployment workflow

- Retain the pending Cloudflare workflow hardening.
- Deploy only successful push runs from this repository's `main`.
- Keep deployment credentials read-only and avoid persisting checkout credentials.
- Prevent stale successful runs from overwriting newer releases.
- Keep one production deployment at a time.
- Keep live smoke execution conditional on deployment credentials and the current `main` tip.

### 9. Keep lean evidence and delete excluded artifacts

Keep:

- Production hero assets and generated hangar background.
- Canonical SVG and PNG aircraft references.
- Final selected image-generation prompts, including the corrected Bulldog and Hammer nose prompts.
- The deterministic aircraft audit script.
- Concise aircraft-art and release documentation.
- The `sharp` development dependency required by the audit.

After extracting the retained files, delete these exact untracked artifacts:

- `DESIGN-IS-2026-08-10/`
- `docs/ui-iterations/`
- `docs/aircraft-art/history/`
- `docs/aircraft-art/sources/`
- `docs/aircraft-art/contact-sheet.png`
- `docs/aircraft-art/contact-sheet-night.png`
- `app/dev/aircraft-export/`
- obsolete `app/assets/aircraft/*-card.webp`

Do not delete the external temporary Hangar scratchpad until the production integration and asset checks are complete.

### 10. Align documentation

- Update `CONTEXT.md`, `DESIGN.md`, PRD, screen specification, technical specification, and release specification.
- Make the photographic carousel the authoritative Hangar design.
- Remove the old aviation-photo ban, 1/2/3-card grid contract, filter requirements, Night Flight requirements, and certificate language.
- Document explicit Hangar 3D activation, one-scene limit, fallback behavior, first-unfinished selection, and truthful completion.
- Update aircraft-art documentation so it references only retained production evidence.

## Required tests

### Hangar

- New user selects Dart.
- Completed Dart selects Bulldog after hydration.
- All-complete state selects Dart.
- Arrows, dots, keyboard, and swipe change the selected aircraft.
- Dot state exposes current and earned status accessibly.
- Primary CTA reaches the selected aircraft's Preflight route.
- Initial load, hover, and focus do not fetch or mount the renderer.
- Short drag and explicit button request inspection.
- Only one scene exists and it is disposed when selection changes.
- WebGL failure produces a labeled canonical SVG.
- Reduced motion removes decorative flight and float behavior.
- No old filters or card grid remain.

### Preflight and completion

- Initial Preflight uses beauty art without requesting Three.js.
- Explicit inspection loads WebGL or truthful SVG fallback.
- Native paper selection and progress-reset messaging remain correct.
- Tutorial Finish records completion exactly once.
- Direct unearned completion visits do not write completion.
- Hydration does not flash an incorrect earned or unearned state.
- Earned state chooses the next unfinished aircraft.
- All-complete state makes Return to Hangar primary.
- Fold it again clears resume position and preserves the wing.
- Beauty-image failure uses canonical SVG.

### Tutorial and engine

- Renderer import failure resolves to SVG and a later attempt retries WebGL.
- Unexpected import or constructor faults remain observable.
- `renderMode`, `setRenderActive()`, and `displayView` remain truthful.
- Offscreen suspension produces no duplicate RAF chain.
- Only deliberate Next autoplays.
- Resume, Back, direct selection, and same-step selection remain paused.
- Mobile camera or inspection controls remain available and non-overlapping.

### Theme retirement and localization

- No theme toggle, `.night` class, theme bootstrap, or theme storage writes remain.
- Legacy stored theme values do not affect the application or corrupt other stored fields.
- All 12 locale dictionaries have exact key and placeholder parity.
- Arabic RTL preserves correct carousel navigation, control order, and instructional aircraft orientation.

### Responsive and performance

- Verify 320, 360, 375, 390, 412, 1280, and 1440px widths.
- Verify 200% text zoom without clipped copy, inaccessible controls, or horizontal page scrolling.
- Verify the approved visual composition at 1440x900, 390x844, and 360x640.
- Confirm aircraft remain contained and the generated background crop remains intentional.
- Confirm initial Hangar and Preflight bundles do not include the Three.js renderer chunk.

## Verification commands

Run against a fresh production build:

```bash
npm run typecheck
npm run lint
npm test
npm run i18n:audit -- --strict
npm run build
npm run test:e2e
npx tsx scripts/audit-aircraft-art.ts
```

Playwright serves the existing `out/` directory, so always run `npm run build` before E2E verification.

The restored pre-integration baseline previously had:

- 699 passing unit/component tests.
- Successful standalone typecheck.
- Successful production build across 234 static pages.
- One lint error in `app/dev/aircraft-export/`, which is scheduled for deletion.

## Commit and release strategy

Preserve the four existing renderer commits, then add focused commits in this order:

1. Engine resilience and Tutorial behavior.
2. Shared aircraft presentation, Preflight, and truthful completion.
3. Photographic Hangar carousel.
4. Night Flight retirement.
5. Deployment hardening.
6. Documentation and artifact cleanup.

After every commit, run the relevant focused verification before advancing.
Before publishing, run the complete verification command set above.

Fetch before pushing.
If `origin/main` advanced, rebase the integration branch onto it, rerun every check, and only then fast-forward local `main`.

Push normally:

```bash
git switch main
git merge --ff-only integration/photographic-hangar-release
git push origin main
```

Never force-push.
