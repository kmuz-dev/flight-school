import { defineConfig, devices } from "@playwright/test";

// E2E runs against the static export (out/), matching production exactly.
// `npm run build` must run before `npm run test:e2e`.
export default defineConfig({
  // Specs live beside the code they cover (tests/e2e, tests/dev), so the dir is
  // wide and the match is narrow. Playwright's default match also picks up
  // *.test.ts, which would drag the vitest suites in and fail on Vitest's
  // internal state; ".spec.ts" is the line between the two runners.
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npx serve out -l 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
