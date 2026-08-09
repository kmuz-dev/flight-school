/**
 * Content validation: structure and prose must agree, and prose must clear the
 * project's writing rules. These run on every commit (SPEC.md §7).
 */
import { describe, expect, it } from "vitest";
import { PLANES } from "@/content";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import type { PlaneId } from "@/content/types";

const EM_DASH = "—";
const PALETTE = ["#D64541", "#7FA8C9", "#4A7C59", "#1A2B4A", "#C98A2C"];

describe("every registered plane has English prose", () => {
  it.each(Object.keys(PLANES))("%s", (id) => {
    const strings = planesDict.planes[id as PlaneId];
    expect(strings, `no dictionary entry for ${id}`).toBeDefined();
    expect(strings!.name.length).toBeGreaterThan(0);
    expect(strings!.description.length).toBeGreaterThan(0);
    expect(strings!.throwTip.length).toBeGreaterThan(0);
  });
});

describe.each(Object.entries(PLANES))("%s: structure and prose agree", (id, plane) => {
  const strings = planesDict.planes[id as PlaneId]!;

  it("has an instruction and a title for every step", () => {
    for (const step of plane.steps) {
      expect(strings.steps[step.id], `missing instruction for ${step.id}`).toBeTruthy();
      expect(strings.titles[step.id], `missing title for ${step.id}`).toBeTruthy();
    }
  });

  it("has a why-line exactly where hasWhy is set", () => {
    for (const step of plane.steps) {
      const why = strings.why[step.id];
      if (step.hasWhy) expect(why, `${step.id} declares hasWhy but has no why-line`).toBeTruthy();
      else expect(why, `${step.id} has a why-line but hasWhy is false`).toBeUndefined();
    }
  });

  it("resolves every taught glossary key", () => {
    for (const step of plane.steps) {
      for (const key of step.teaches ?? []) {
        expect(planesDict.glossary[key], `unknown glossary key ${key}`).toBeDefined();
      }
    }
  });

  it("points every unfold at an earlier step", () => {
    const seen = new Set<string>();
    for (const step of plane.steps) {
      if (step.action.type === "unfold") {
        expect(seen.has(step.action.toStep), `${step.id} unfolds to a later or unknown step`).toBe(
          true,
        );
      }
      seen.add(step.id);
    }
  });

  it("covers every paper format in the prep table", () => {
    for (const format of ["letter", "a4", "square", "index-4x6"] as const) {
      expect(plane.paper.prep[format], `missing prep for ${format}`).toBeDefined();
    }
  });

  it("uses ratings in range and an accent from the palette", () => {
    for (const value of Object.values(plane.ratings)) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(5);
    }
    expect(PALETTE).toContain(plane.accent);
  });

  it("has a default tip for the tip bar", () => {
    expect(strings.tips.default).toBeTruthy();
  });
});

describe("writing rules", () => {
  const allProse = [
    ...Object.values(ui),
    ...Object.values(planesDict.planes).flatMap((p) =>
      p
        ? [
            p.name,
            p.description,
            p.throwTip,
            ...Object.values(p.titles),
            ...Object.values(p.steps),
            ...Object.values(p.why),
            ...Object.values(p.tips),
          ]
        : [],
    ),
    ...Object.values(planesDict.glossary).flatMap((g) => [g.term, g.definition]),
  ];

  it("contains no em dashes (project voice rule)", () => {
    const offenders = allProse.filter((s) => s.includes(EM_DASH));
    expect(offenders).toEqual([]);
  });

  it("contains no empty strings", () => {
    expect(allProse.filter((s) => s.trim().length === 0)).toEqual([]);
  });

  it("keeps instructions short enough for a 10-year-old to follow", () => {
    for (const [id, plane] of Object.entries(PLANES)) {
      const strings = planesDict.planes[id as PlaneId]!;
      for (const step of plane.steps) {
        const text = strings.steps[step.id] ?? "";
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        for (const sentence of sentences) {
          const words = sentence.trim().split(/\s+/).length;
          expect(words, `${step.id}: "${sentence.trim()}" is too long`).toBeLessThanOrEqual(30);
        }
      }
    }
  });
});
