import next from "eslint-config-next";

// eslint-config-next 16 ships a flat config array; its TS rules already cover
// unused vars, so no local rule overrides are needed.
export default [
  {
    ignores: [
      "node_modules/**",
      ".claude/**",
      ".next/**",
      "out/**",
      "playwright-report/**",
      "test-results/**",
      "docs/**",
    ],
  },
  ...next,
];
