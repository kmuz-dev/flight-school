import type { NextConfig } from "next";

// BASE_PATH supports the GitHub Pages fallback (served from /flight-school).
// Cloudflare Pages (primary) serves from the domain root, so it stays unset there.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
