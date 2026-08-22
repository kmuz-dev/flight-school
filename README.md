<p align="center">
  <img src="app/assets/brand/flight-school-looping-glider.webp" width="180" alt="Flight School looping paper glider logo">
</p>

# Flight School

[![CI](https://github.com/kmuz-dev/flight-school/actions/workflows/ci.yml/badge.svg)](https://github.com/kmuz-dev/flight-school/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-1a2b4a.svg)](LICENSE)

Flight School is an interactive academy for paper aircraft.
Fold six planes with a procedural 3D engine, earn their wings, then fly the finished geometry through a cinematic school hallway.

**[Play Flight School](https://flight-school-chi.vercel.app)**

The application is a static Next.js export with no accounts, analytics, backend, or server-side state.
Progress and personal flight records stay in the browser through `localStorage`.

## What is here

- Six authored paper aircraft with deterministic, reversible fold sequences.
- A Three.js and GSAP folding renderer with an SVG fallback when WebGL is unavailable.
- A fixed-step arcade flight engine with keyboard, pointer, touch, and optional device-tilt controls.
- A continuously changing hallway course spanning the 1950s, 1980s, and today.
- Twelve locales, including Arabic right-to-left presentation.
- Accessibility, reduced-motion, layout, resilience, performance, and visual-regression coverage.
- A fully static deployment that can run on Vercel, Cloudflare Workers, or another static host.

## Getting started

Flight School requires Node.js 22 or newer.

```bash
git clone https://github.com/kmuz-dev/flight-school.git
cd flight-school
npm ci
npm run dev
```

Open [http://localhost:3000/en/](http://localhost:3000/en/).

The 3D stages use WebGL, but WebGL is not required to complete the folding experience.
When it is unavailable, every tutorial falls back to flat SVG drawings built from the same fold states.

## Commands

```bash
npm run dev                      # Next.js development server
npm run build                    # Static export into out/
npm start                        # Serve the exported site
npm run typecheck                # Generate route types and run TypeScript
npm run lint                     # ESLint
npm test                         # Vitest unit and component suites
npm run test:watch               # Vitest in watch mode
npm run validate:content         # Plane and content rules
npm run i18n:audit -- --strict   # Locale key parity
npm run test:e2e                 # Playwright against out/
```

Build the static export before running Playwright locally:

```bash
npm run build
npm run test:e2e
```

Run one unit test with `npx vitest run tests/engine/fold.test.ts -t "case name"`.
Run one browser test with `npx playwright test --project=chromium tests/e2e/journey.spec.ts -g "bulldog"`.

## Architecture map

```text
plane data + locale copy
          |
          v
  fold engine core  --->  Three.js / SVG presentation
          |
          v
 finished geometry  --->  flight profile + flight runtime
                                  |
                                  v
                         hallway course + results
```

- `app/engine/core/` contains pure TypeScript fold mathematics with no React, DOM, or Three.js dependency.
- `app/engine/render/` owns the lazy Three.js stage, GSAP timelines, paper presentation, and flat-SVG fallback.
- `app/engine/flight/` is a walled flight module containing fixed-step simulation, controls, course data, camera behavior, audio, autopilot diagnostics, and result comparison.
- `app/content/planes/` stores each aircraft as geometry and fold instructions, without presentation prose.
- `app/i18n/` contains every user-facing string across all twelve locales.
- `app/components/` composes the Hangar, Preflight, Tutorial, Wings earned, and Flight experiences.
- `app/assets/flight/` contains the Cinematic Schoolbook environment, character, prop, and material artwork.
- `/dev/fold-editor` is the built-in authoring and geometry-inspection instrument.

Two boundaries carry most of the design:

1. The fold engine never imports React.
2. The fold engine may provide finished geometry to flight, but it never imports flight code.

A plane is geometry in a content module and language in a locale dictionary.
That separation keeps new aircraft, rendering changes, and translations independently testable.

## Suggested learning paths

- Start with [the fold-engine ADR](docs/adr/0001-procedural-3d-fold-engine.md) and `app/engine/core/` to understand the paper model.
- Read [the hallway flight plan](docs/plans/hallway-flight.md) and `app/engine/flight/` to follow the real-time simulation.
- Read [DESIGN.md](DESIGN.md) before changing visual language or interaction patterns.
- Use `tests/e2e/resilience.spec.ts` to see how WebGL failure, keyboard operation, and reduced motion are exercised.
- Use `tests/e2e/paper-visual.spec.ts` to understand the approved visual baselines.

## Testing

| Layer | Tool |
| --- | --- |
| Fold mathematics and golden sequences | Vitest |
| Plane content and geometry rules | Vitest |
| Components and browser storage | Vitest and Testing Library |
| Locale parity | `scripts/i18n-audit.ts --strict` |
| Accessibility, journeys, layout, resilience, and visual stability | Playwright |

CI runs type checking, linting, all Vitest projects, the strict locale audit, the static build, and the Playwright suite on every push and pull request.

## Contributing

Contributions, bug reports, and learning-focused questions are welcome.
Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, architecture boundaries, and the pull-request checklist.
Please follow the [Code of Conduct](CODE_OF_CONDUCT.md) and report security concerns through the process in [SECURITY.md](SECURITY.md).

## Deployment

The primary deployment is [Vercel](https://flight-school-chi.vercel.app).
The same export is also served through [Cloudflare Workers](https://flight-school.kudakw-mutasa.workers.dev).

```bash
npx vercel pull --yes --environment=production
npx vercel build --prod
npx vercel deploy --prebuilt --prod --archive=tgz
```

The compressed upload is important because the localized static export contains more than 5,000 files.
Automated deployment also requires a `VERCEL_TOKEN` that can access the configured Vercel team and project.
GitHub Pages is also supported by setting `BASE_PATH` to the repository subpath before building.

## Project documents

- [Product requirements](docs/PRD.md)
- [Technical specification](docs/SPEC.md)
- [Design system](DESIGN.md)
- [Screen specifications](docs/SCREENS.md)
- [Domain context](CONTEXT.md)
- [Architecture decisions](docs/adr/)
- [Known issues](docs/KNOWN-ISSUES.md)

## License

Flight School is available under the [MIT License](LICENSE).
