# Flight School - Product Spec (V1)

Technical companion to [PRD.md](PRD.md).
This spec constrains architecture and interfaces; implementation detail beyond it is the builder's call.
Where this spec references the anatomy repo, it means [thebuggeddev/anatomy](https://github.com/thebuggeddev/anatomy), the architectural reference.

## 1. Stack

- **Framework**: Next.js 16, App Router, TypeScript (strict), `output: 'export'` full static export.
- **Styling**: Tailwind CSS 4.
- **3D**: Three.js (plain, no react-three-fiber requirement; the anatomy repo drives Three.js imperatively from a React shell and that pattern is proven for this shape of app).
- **Animation**: GSAP for fold timelines and UI transitions.
- **State**: React state + localStorage. No global state library.
- **Backend**: none. No API routes, no database, no auth. The static export must contain the entire product.

## 2. Deployment

- **Primary**: Vercel, free tier. `npm run build` writes the static export to `out/` and Vercel serves it; there is no server component. Live at `https://flight-school-chi.vercel.app`.
- **Also live**: a Cloudflare Workers Builds git integration remains connected and builds the repo on push, serving the same export as Workers static assets at `https://flight-school.kudakw-mutasa.workers.dev/`. `wrangler.jsonc` is load-bearing for that build alone: without it `wrangler` detects "Next.js", assumes a server-rendered app and reaches for a `.next/standalone` bundle that `output: "export"` never produces. Delete the file only after disconnecting the integration.
- **Fallback**: GitHub Pages via Actions. Must work with a `basePath` when served from a project subpath; keep all asset references basePath-safe from day one.
- **CI**: GitHub Actions runs typecheck, lint, unit and component tests, content validation, the translation audit in `--strict` mode, the build, and the full Playwright suite against the export on every push and PR. `.github/workflows/deploy.yml` builds and ships to Vercel on a push to `main`, then smokes the deployed site with the same specs, and stays inert until the repository carries a `VERCEL_TOKEN` secret.

## 3. Architecture overview

The anatomy repo's shape, carried over:

```
app/
  [locale]/
    page.tsx                 ← catalog (home)
    plane/[planeId]/
      page.tsx               ← Preflight
      fold/page.tsx          ← Tutorial
      wings/page.tsx         ← Wings earned
  components/                ← React shell + UI
  engine/                    ← the fold engine (pure TS + Three.js, no React)
  content/                   ← content-as-code: plane structures + fold sequences
  i18n/                      ← dictionaries: ui/ + planes/ per locale
  lib/                       ← storage, utils
scripts/
  i18n-audit.mjs             ← every key present in every locale
tests/
```

Two hard boundaries:

1. **Engine is React-free.** `app/engine/` is pure TypeScript + Three.js with a small imperative API; React components own DOM and call into it. This mirrors the anatomy repo's `lib/three/` split and keeps the hardest code testable headlessly.
2. **Structure and prose never mix.** Geometry, ids, ratings, paper specs live in `app/content/` (locale-independent). All human-readable text lives in `app/i18n/` dictionaries keyed by stable ids. The translation audit enforces the split.

## 4. The fold engine

The fold engine is the authoritative renderer for tutorial steps, explicit finished-plane inspection, and canonical SVG fallback.
Generated beauty artwork is a separate presentation layer used only in the Hangar, Preflight, and Wings earned screens.

### 4.1 Model

- Paper is a planar polygon in 2D paper coordinates (millimeters), subdivided progressively by creases into a set of **facets** (convex polygons).
- The engine maintains a **fold state**: for each facet, a 3D transform and a layer index.
- A **flat fold** rotates the facets on one side of a crease line 180 degrees about that line, updating layer indices (folded facets stack above or below per fold direction).
- A **partial fold** (wings, elevons) rotates by an arbitrary angle and leaves the region non-planar; state after a partial fold still supports further folds on unaffected regions.
- Layers get a small z-offset (paper thickness) to prevent z-fighting and to give the model a realistic layered look at the nose.

### 4.2 Step data (declarative)

Fold sequences are data, not code. Indicative shape (builder may refine, ids and separations are binding):

```ts
type FoldStep = {
  id: string;                       // stable, used as i18n key: "dart.step-04"
  action:
    | { type: "fold"; crease: [Vec2, Vec2]; side: "left" | "right"; angle: number; direction: "valley" | "mountain" }
    | { type: "unfold"; toStep: string }      // crease-and-unfold reference marks
    | { type: "flip" }                        // turn the model over
    | { type: "rotate"; degrees: number }     // reorient on the table
    | { type: "cut"; line: [Vec2, Vec2] };    // Paper Prep only
  camera?: CameraHint;              // optional per-step framing
};

type PlaneStructure = {
  id: PlaneId;
  tier: "easy" | "medium" | "advanced";
  paper: { format: "letter-a4" | "square"; prep: Record<SourcePaper, FoldStep[]> };
  ratings: { speed: 1|2|3|4|5; distance: 1|2|3|4|5; airtime: 1|2|3|4|5; ease: 1|2|3|4|5 };
  steps: FoldStep[];
  accent: string;                   // per-plane accent color, anatomy-style
};

type DisplayView = {
  azimuthDeg: number;
  elevationDeg: number;
};

type AircraftPresentation = {
  artwork: StaticImageData;   // one beauty render, shared by every surface
  objectPosition: string;
  hangarScale: number;        // optical correction in the photographed bay
  heroScale: number;          // optical correction in the Preflight art well
  displayView: DisplayView;
};
```

All instruction text, optional explanations, flight descriptions, and throw tips live in `i18n/planes/<locale>.ts` keyed by step and plane ids.
The `AircraftPresentation` manifest is keyed by `PlaneId` and must contain all six planes.
It does not alter `PlaneStructure`, fold state, or geometry-derived rest orientation.

### 4.3 Animation and interaction

- Each step's fold animates via a GSAP timeline driving the rotation about the crease axis.
- Fold 1, resumed steps, revisited steps, and directly selected steps open paused.
- Deliberately advancing with Next auto-plays each later fold once.
- Playback controls are Play or Pause, scrub, Replay, and time.
- Step navigation is Back and Next or Finish, with a native step selector for direct access.
- The stage retains orbit, zoom, Front, Three-quarter, and Top camera controls.
- Stepping backward restores the previous fold state exactly; fold state at any step index must be deterministically computable from the sequence (pure function of steps 0..n), which is also what makes resume trivial.
- Hangar, Preflight, and Wings earned use approved beauty artwork by default and do not download the WebGL renderer until inspection is explicitly requested.
- Beauty artwork remains visible while an explicit inspection loads and successful WebGL replaces it.
- WebGL failure or unavailability replaces the inspection region with a labeled canonical SVG fallback.
- Beauty-image failure outside inspection also replaces the image with the canonical SVG.
- The tutorial uses a canonical per-step SVG when WebGL is unavailable and remains completable.
- No more than two explicitly opened Hangar WebGL scenes may exist at once; least-recently-used disposal enforces the limit.

### 4.4 Authoring tooling (internal, ships hidden)

Hand-writing crease coordinates blind is impractical.
Build a dev-only route (excluded from production nav, e.g. `/dev/fold-editor` gated to development builds) that renders a fold sequence live from data with: step scrubbing, crease-line overlay in 2D paper coordinates, facet/layer inspection, and hot reload of content files.
This tool is how all 6 planes' sequences get authored and verified; budget it as real scope, not an afterthought.

## 5. i18n

- Anatomy-repo pattern: `i18n/ui/<locale>.ts` (chrome, buttons, labels) and `i18n/planes/<locale>.ts` (instructional prose), merged over English so missing keys fall back rather than crash, plus an audit script that fails CI listing missing keys per locale.
- 12 locales: en, es, fr, de, pt, ru, hi, id, ja, ko, zh, ar. `ar` requires RTL layout (`dir="rtl"`), and fold-direction words (left/right) must be handled in prose, not mirrored geometry; the 3D model is never mirrored.
- Locale routing: `/[locale]/...` static-generated for all locales; root redirects using browser language with `en` fallback (client-side redirect, since the export is static).

## 6. Client state

```ts
// localStorage key: "flightschool.v1"
type Stored = {
  progress: Partial<Record<PlaneId, { step: number; updatedAt: string }>>;
  completed: Partial<Record<PlaneId, { at: string }>>;
  locale?: string;
  paperChoice?: Partial<Record<PlaneId, SourcePaper>>;
};
```

Versioned single key; unknown or corrupt data is discarded silently.
All reads guarded for SSR/export (no `window` at module scope).

## 7. Testing

- **Fold math unit tests** (highest value): reflection of points across crease lines, facet splitting, layer ordering, and determinism of state at step n. Pure TS, no WebGL needed.
- **Content validation test**: every plane's sequence type-checks, every step id has instruction text in English, every explanation names a real step, and every prep table covers all three source papers or declares pass-through.
- **i18n audit** in CI (anatomy repo has this exact script shape).
- **Build test**: static export succeeds and key routes exist for every locale (anatomy's rendered-html test pattern).
- **Playwright against the exported build**, which supersedes this section's original "no browser-automation suite required for V1". The owner asked for end-to-end checks to gate every phase, so the suite is in from Phase 0: every plane folded start to finish, resume and badges, the paper-prep cut flow, RTL and CJK locales, a no-WebGL run, keyboard completion, axe-core over four screens, layout stability, and a console-error sweep. The same specs run against the deployed URL by setting `E2E_BASE_URL`.
- The PRD's physical acceptance bar (fold every plane from the site with real paper) remains a manual gate that no suite replaces.

## 8. Build order (milestones)

1. **M1 - Vertical slice**: engine core + step UI + The Dart end-to-end in English. Proves ADR 0001 before anything fans out. Exit: a person folds a flying Dart from the site.
2. **M2 - Catalog fan-out**: remaining 5 planes authored via the fold editor; catalog page, flight profiles, Paper Prep including the Square Cruiser cutting flow, localStorage resume/completion.
3. **M3 - Locales and hardening**: 11 translated dictionaries, RTL pass, WebGL fallback, aircraft presentation pipeline, CI, Cloudflare deploy.

M1 is the risk gate: if the engine proves unworkable at full quality, fall back to static SVG step diagrams behind the same step UI and data model (the `FoldStep` schema still drives diagram generation), without renegotiating the rest of the product.
