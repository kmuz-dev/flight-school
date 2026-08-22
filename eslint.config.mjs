import next from "eslint-config-next";

// eslint-config-next 16 ships a flat config array; its TS rules already cover
// unused vars, so no local rule overrides are needed.
const config = [
  {
    ignores: [
      "node_modules/**",
      ".claude/**",
      ".next/**",
      ".vercel/**",
      ".wrangler/**",
      "coverage/**",
      "out/**",
      "playwright-report/**",
      "test-results/**",
      "docs/**",
    ],
  },
  ...next,
];

export default config;
