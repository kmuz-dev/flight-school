# Contributing to Flight School

Thank you for helping improve Flight School.
Bug fixes, accessibility improvements, translations, documentation, tests, and carefully scoped features are welcome.

## Before you start

- Search existing issues before opening a new one.
- Use an issue to discuss changes that alter architecture, aircraft geometry, physics, visual direction, or stored progress.
- Keep pull requests focused on one coherent change.
- Do not include credentials, `.env` files, generated build output, browser reports, or machine-local configuration.

## Local setup

Flight School requires Node.js 22 or newer.

```bash
git clone https://github.com/kmuz-dev/flight-school.git
cd flight-school
npm ci
npm run dev
```

## Architecture boundaries

- Keep `app/engine/core/` deterministic and independent of React, the DOM, and Three.js.
- Keep the fold engine independent of `app/engine/flight/`.
- Put aircraft structure in `app/content/planes/` and user-facing prose in `app/i18n/`.
- Treat authored course data as the shared source for rendering, collisions, reactions, progress, and autopilot diagnostics.
- Preserve static export compatibility.
- Preserve keyboard operation, reduced motion, right-to-left layout, and the SVG folding fallback.

Read [DESIGN.md](DESIGN.md), [docs/SPEC.md](docs/SPEC.md), and the relevant file in [docs/adr/](docs/adr/) before changing a load-bearing boundary.

## Validation

Run the checks that cover your change before opening a pull request.
For a broad change, run the full local gate:

```bash
npm run typecheck
npm run lint
npm test
npm run i18n:audit -- --strict
npm run build
npm run test:e2e
```

The browser suite expects a current static export in `out/`.

## Visual and content changes

- Explain the user-facing reason for the change.
- Include before-and-after screenshots when layout or art changes.
- Do not update golden screenshots merely to silence an unexplained visual difference.
- Add or update every locale key together.
- Use fictional, child-safe imagery without brands, identifiable real people, or generated instructional text.
- Include the source and licensing status of any contributed asset.

## Pull-request checklist

- [ ] The change is focused and documented.
- [ ] Relevant tests were added or updated.
- [ ] Type checking, lint, and affected tests pass.
- [ ] Accessibility, reduced motion, localization, and right-to-left behavior were considered.
- [ ] No secrets, private data, or generated local artifacts are included.
- [ ] New dependencies and assets have compatible licenses.
