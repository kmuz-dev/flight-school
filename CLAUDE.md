# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Flight School is a paper airplane folding tutorial website: a static Next.js site where every fold step is rendered as an animated 3D fold by a shared Three.js fold engine.
The build is specified before the code: read [docs/PRD.md](docs/PRD.md) (product requirements), [docs/SPEC.md](docs/SPEC.md) (technical spec), and [CONTEXT.md](CONTEXT.md) (domain glossary and resolved decisions) before making product or architecture changes.
[docs/adr/](docs/adr/) holds architecture decision records; ADR 0001 (the fold engine) is the load-bearing one.
The active approved follow-on brief is [docs/plans/hyperreal-paper-tutorial.md](docs/plans/hyperreal-paper-tutorial.md).

## Ground rules from the spec

- No backend of any kind: static export only, localStorage for user state.
- The fold engine (`app/engine/` once it exists) stays React-free; React calls into it.
- Structure and prose never mix: geometry/ids/ratings in content files, all human-readable text in i18n dictionaries.
- Generated photographic assets may be used only when the user explicitly approves them and their provenance is documented.
- The procedural fold engine remains authoritative for Tutorial geometry and interactive 3D inspection.
- Deploys to Cloudflare free tier as Workers static assets (`wrangler.jsonc`, no Worker script), not Pages; keep all asset paths basePath-safe for the GitHub Pages fallback.

## Design System

Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Commands

```
npm run dev              # Next dev server on :3000
npm run build            # static export into out/
npm run typecheck        # tsc --noEmit
npm run lint             # eslint
npm run test             # vitest, both projects (unit = node, components = jsdom)
npm run test:e2e         # Playwright against the export; run `npm run build` first
npm run validate:content # content rules only
npm run i18n:audit -- --strict   # key parity across all 12 locales; --strict is what CI runs
npx wrangler deploy      # ships out/ to Cloudflare; needs `wrangler login` or CLOUDFLARE_API_TOKEN
```

Single test: `npx vitest run tests/engine/fold.test.ts -t "name of the case"`.
Single E2E: `npx playwright test --project=chromium tests/e2e/journey.spec.ts -g "bulldog"`.
Against the deployed site: `E2E_BASE_URL=https://flight-school.kudakw-mutasa.workers.dev npx playwright test tests/e2e`.

E2E specs are `*.spec.ts` under `tests/`; vitest owns `*.test.ts`. Playwright's
default match would otherwise pull the vitest files in and fail on Vitest's
internal state.

## Authoring a fold sequence

`/dev/fold-editor` is the instrument: it shows the 3D stage, the SVG the
geometry tests compare against, and a true-scale table-space plan with the
crease drawn on it, plus a facet/layer inspector and the validation panel.

Two rules that are easy to get wrong and expensive to find later:

- **Never round a crease endpoint to a tidy number.** Derive it from the
  condition the fold satisfies. A crease authored 0.008 mm off its true
  bisector leaves a sub-millimetre wedge on every layer it crosses, each one
  claiming a layer of its own. See `SLOPE_EDGE_Y` in `app/content/planes/dart.ts`.
- **A wing pair needs the `layers` selector.** After a plane is folded in half
  both wings sit on the same side of the wing crease, so one step tilts them
  together instead of opening a V. Use two steps: same crease, same side,
  opposite `direction`, `layers: "top"` then `"bottom"`. The fold angle is per
  wing measured from closed, so the two finish about twice it apart - 82 gives
  a shallow dihedral, 25 gives a plane with its wings shut.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
