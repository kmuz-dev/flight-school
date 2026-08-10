import { defineConfig } from "vitest/config";
import path from "node:path";

// No @vitejs/plugin-react: vitest transforms JSX via esbuild, and adding the
// plugin pulls a second vite version into the type graph (rolldown vs rollup).
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "app"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/components/**"],
          environment: "node",
          // No jest-dom here: these are pure math and headless render tests,
          // and nothing outside tests/components uses a DOM matcher. Loading it
          // into all twenty-odd of them bought nothing and cost setup time in
          // the one place the suite is contended.
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          include: ["tests/components/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["tests/setup.ts", "tests/setup.components.ts"],
          /**
           * The default 5s is not a real budget here.
           *
           * The first render in a fresh jsdom costs about a second on its own -
           * React's first pass plus six cards each parsing a real engine SVG -
           * and the suite runs 26 files across 8 cores, so that second becomes
           * five under contention and the wall is hit by a test that is doing
           * nothing but reading the DOM. It failed on whichever file happened
           * to be scheduled worst, which is the signature of a timeout that is
           * measuring the runner rather than the code.
           *
           * A real hang still fails the run; it just takes 20 seconds to say so.
           */
          testTimeout: 20_000,
        },
      },
    ],
  },
});
