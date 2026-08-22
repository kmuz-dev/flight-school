import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flight School",
    short_name: "Flight School",
    description: "A flight academy for paper. Fold a plane, earn its wings, and fly it.",
    start_url: ".",
    scope: ".",
    display: "standalone",
    background_color: "#f7f3e9",
    theme_color: "#1a2b4a",
    icons: [
      { src: "icon.png", sizes: "512x512", type: "image/png" },
      { src: "apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
