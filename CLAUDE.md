# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Flight School is a paper airplane folding tutorial website: a static Next.js site where every fold step is rendered as an animated 3D fold by a shared Three.js fold engine.
The build is specified before the code: read [docs/PRD.md](docs/PRD.md) (product requirements), [docs/SPEC.md](docs/SPEC.md) (technical spec), and [CONTEXT.md](CONTEXT.md) (domain glossary and resolved decisions) before making product or architecture changes.
[docs/adr/](docs/adr/) holds architecture decision records; ADR 0001 (the fold engine) is the load-bearing one.

## Ground rules from the spec

- No backend of any kind: static export only, localStorage for user state.
- The fold engine (`app/engine/` once it exists) stays React-free; React calls into it.
- Structure and prose never mix: geometry/ids/ratings in content files, all human-readable text in i18n dictionaries.
- No AI image generation assets; every visual is an engine render.
- Deploys to Cloudflare Pages free tier; keep all asset paths basePath-safe for the GitHub Pages fallback.

## Design System

Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Commands

No build tooling exists yet.
When the app is scaffolded, record build, lint, test, and single-test commands here.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
