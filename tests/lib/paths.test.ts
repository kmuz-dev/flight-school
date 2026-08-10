/**
 * Link building. The rule these pin is that no href is ever assembled from a
 * leading slash, because the GitHub Pages fallback serves the site from
 * /flight-school and a hard-coded root path 404s there.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  completionHref,
  hangarHref,
  href,
  localeHref,
  preflightHref,
  tutorialHref,
} from "@/lib/paths";

describe("route builders", () => {
  it("keeps the trailing slash the static export resolves on", () => {
    expect(hangarHref("en")).toBe("/en/");
    expect(preflightHref("es", "dart")).toBe("/es/plane/dart/");
    expect(tutorialHref("ja", "hammer")).toBe("/ja/plane/hammer/fold/");
    expect(completionHref("ar", "sea-glider")).toBe("/ar/plane/sea-glider/wings/");
  });
});

describe("localeHref", () => {
  it("swaps the locale segment and keeps the cadet where they were", () => {
    expect(localeHref("/en/plane/dart/fold/", "fr")).toBe("/fr/plane/dart/fold/");
    expect(localeHref("/ja/plane/hammer/wings/", "ko")).toBe("/ko/plane/hammer/wings/");
  });

  it("lands on the hangar from the hangar and from the bare root", () => {
    expect(localeHref("/en/", "de")).toBe("/de/");
    expect(localeHref("/", "de")).toBe("/de/");
  });

  it("adds the trailing slash a hand-typed URL left off", () => {
    expect(localeHref("/en/plane/dart", "pt")).toBe("/pt/plane/dart/");
  });

  it("is a no-op for the locale already showing", () => {
    expect(localeHref("/es/plane/dart/", "es")).toBe("/es/plane/dart/");
  });
});

describe("under the GitHub Pages base path", () => {
  const original = process.env.NEXT_PUBLIC_BASE_PATH;
  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_PATH = original;
    vi.resetModules();
  });

  it("prefixes new links and does not double-prefix a swapped one", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/flight-school";
    vi.resetModules();
    const paths = await import("@/lib/paths");
    expect(paths.hangarHref("en")).toBe("/flight-school/en/");
    // The pathname the browser reports already carries the base path; stripping
    // it before the swap is the whole reason localeHref knows about BASE.
    expect(paths.localeHref("/flight-school/en/plane/dart/", "zh")).toBe(
      "/flight-school/zh/plane/dart/",
    );
  });

  it("leaves href alone when no base path is configured", () => {
    expect(href("/en/")).toBe("/en/");
  });
});
