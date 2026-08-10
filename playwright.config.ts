import { defineConfig, devices } from "@playwright/test";

// E2E runs against the static export (out/), matching production exactly.
// `npm run build` must run before `npm run test:e2e`.
//
// Set E2E_BASE_URL to point the same suite at a deployed site instead - the
// live smoke Gate 4 asks for. It is the same specs against the same build, so
// a pass on the deployed URL means the thing CI proved is the thing that
// shipped, rather than a separate hand-written smoke test that could drift.
const LIVE_URL = process.env.E2E_BASE_URL;
const LOCAL_URL = "http://127.0.0.1:4173";

export default defineConfig({
  // Specs live beside the code they cover (tests/e2e, tests/dev), so the dir is
  // wide and the match is narrow. Playwright's default match also picks up
  // *.test.ts, which would drag the vitest suites in and fail on Vitest's
  // internal state; ".spec.ts" is the line between the two runners.
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  // Every screen under test drives a real WebGL stage, and the full-fold walks
  // click through a dozen animated steps. Playwright's 30s default is fine for
  // one spec alone but starves those tests once several workers share a GPU,
  // which showed up as flaky "waiting for Next fold" timeouts rather than as
  // any product defect.
  timeout: 90_000,
  /*
    Every worker here rasterises WebGL in software - headless Chromium has no
    GPU on a laptop or on a runner - so workers do not scale the way they do
    for a DOM suite: they compete for the same cores that are drawing the
    folds, and past a handful they slow each other down faster than they add
    throughput. Left at the default, the long walks (the square-cruiser cut
    flow is 31s of folding on its own) drifted into the timeout on a machine
    that runs every one of them serially in a couple of minutes.

    So the cap is deliberate and the failures it prevents are not product
    defects; tests/e2e/hangar-perf.spec.ts documents the same lesson from the
    other direction, where a wall-clock budget turned CI red on unrelated
    commits. CI runners are smaller than a laptop, hence the tighter number.
  */
  workers: process.env.CI ? 2 : 3,
  // The same starvation, one level down. Raising `timeout` above covers a whole
  // test but NOT a single assertion, which keeps Playwright's own 5s budget -
  // so a `toBeVisible` or an `expect.poll` waiting on the engine to boot still
  // failed at 5 seconds inside a test that had 60. Measured on this machine:
  // the twelve-fold walk takes 8s with one worker and 57s with two sharing
  // SwiftShader, a factor of seven, and 5 seconds does not survive that.
  // A real hang is still caught by the test timeout above.
  expect: { timeout: 20_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: LIVE_URL ?? LOCAL_URL,
    trace: "on-first-retry",
  },
  // Against a deployed URL there is nothing to start, and starting the local
  // server anyway would silently hold the wrong build open on port 4173.
  ...(LIVE_URL
    ? {}
    : {
        webServer: {
          command: "npx serve out -l 4173",
          url: LOCAL_URL,
          reuseExistingServer: !process.env.CI,
        },
      }),
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
