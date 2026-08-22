# Flight School

A flight academy for paper.
Six paper airplanes, each taught as an animated 3D fold: the sheet on screen is folded by the same engine that decides where every crease lands, so a step is never a drawing of a fold, it is the fold.

Live at **https://flight-school.kudakw-mutasa.workers.dev/**

Twelve languages, progress that survives a reload, and a pair of wings at the end that you can only get by folding the plane.
No backend, no accounts, no tracking: the whole product is a static export and a little localStorage.

## Getting started

```
npm ci
npm run dev            # http://localhost:3000
```

Node 22 or newer.
The 3D stage needs WebGL, but the site does not: with WebGL unavailable every tutorial falls back to flat SVG drawings of the same fold states and stays completable, which `tests/e2e/resilience.spec.ts` proves by walking a plane end to end in a browser where `getContext("webgl")` returns null.

## Commands

```
npm run dev                      # Next dev server on :3000
npm run build                    # static export into out/
npm start                        # serve the export on :3000
npm run typecheck                # tsc --noEmit
npm run lint                     # eslint
npm run test                     # vitest: unit (node) and component (jsdom)
npm run test:watch               # the same, watching
npm run validate:content         # content rules only
npm run i18n:audit -- --strict   # key parity across all 12 locales, as CI runs it
npm run test:e2e                 # Playwright against out/; run `npm run build` first
```

A single unit test: `npx vitest run tests/engine/fold.test.ts -t "name of the case"`.
A single E2E test: `npx playwright test --project=chromium tests/e2e/journey.spec.ts -g "bulldog"`.
The same suite against the deployed site: `E2E_BASE_URL=https://flight-school.kudakw-mutasa.workers.dev npx playwright test tests/e2e`.

E2E specs are `*.spec.ts`, vitest owns `*.test.ts`; Playwright's default match would otherwise pull the vitest files in and fail on Vitest's internal state.

## How it is put together

- `app/engine/core/` - the fold mathematics, pure TypeScript with no Three.js and no DOM. Paper is a list of convex facets in original-sheet coordinates, and the state at step *n* is a replay of steps 0..*n* from a fresh sheet rather than an accumulation, which is what makes scrubbing, stepping back and resuming exactly agree.
- `app/engine/render/` - the Three.js stage, the GSAP timeline, and the flat-SVG fallback. Reached only through `loadFoldEngine()`, so the renderer is fetched when something needs to draw rather than shipped in the first paint of every page.
- `app/content/planes/` - each plane's fold sequence as data: creases, sides, layers, camera hints. No prose.
- `app/i18n/` - every human-readable string, in twelve dictionaries. No geometry.
- `app/components/` - the five screens: hangar, preflight, tutorial, wings earned, and the error boundary.
- `/dev/fold-editor` - the authoring instrument: the 3D stage, the SVG the geometry tests compare against, a true-scale table-space plan with the crease drawn on it, a facet and layer inspector, and the validation panel.

The two boundaries that hold the design together: the engine never imports React, and structure never mixes with prose.
A plane is geometry in a content file and words in a dictionary, which is why a new language is a dictionary and nothing else.

## Testing

| Layer | Tool |
|---|---|
| Fold mathematics, golden sequences | vitest |
| Content rules, geometry per plane | vitest |
| Components | vitest + testing-library |
| Palette contrast against DESIGN.md | vitest, reading `app/globals.css` |
| Key parity across 12 locales | `scripts/i18n-audit.ts --strict` |
| User journeys, locales, resilience, accessibility, layout stability | Playwright against the export |

CI runs all of it on every push, plus the build.

## Deploying

The site is a static export served by Vercel, live at `https://flight-school-chi.vercel.app`. A Cloudflare Workers Builds git integration also still builds the repo on push and serves it at `https://flight-school.kudakw-mutasa.workers.dev`; `wrangler.jsonc` is what keeps that build serving `out/` as static assets rather than trying to run a Next server.

```
npm run build
npx vercel deploy --prod
```

`vercel deploy` needs credentials - either `vercel login` once, or a `VERCEL_TOKEN` in the environment.
`.github/workflows/deploy.yml` does the same thing on a push to `main` and stays inert until the repository carries that token as a secret.

GitHub Pages is the documented fallback for the same output; set `BASE_PATH` to the project subpath and every asset reference follows it.

## The documents

The build was specified before it was written, and the specifications are still the source of truth.

- [docs/PRD.md](docs/PRD.md) - what the product is and what "done" means.
- [docs/SPEC.md](docs/SPEC.md) - the technical spec: stack, boundaries, milestones.
- [DESIGN.md](DESIGN.md) - the design system, and the decisions log behind it. Read before changing anything visual.
- [docs/SCREENS.md](docs/SCREENS.md) - each screen, resolved against the mockups.
- [CONTEXT.md](CONTEXT.md) - the domain glossary and the decisions already settled.
- [docs/adr/](docs/adr/) - architecture decision records. 0001, the fold engine, is the load-bearing one.
- [docs/KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) - open defects with their evidence.
