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
    setupFiles: ["tests/setup.ts"],
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/components/**"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          include: ["tests/components/**/*.test.{ts,tsx}"],
          environment: "jsdom",
        },
      },
    ],
  },
});
