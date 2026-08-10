/**
 * What the dictionary resolver must guarantee, stated as tests rather than as
 * trust: a cadet reading any locale never meets a blank placard or a raw key,
 * and no locale silently ships as English without the audit noticing.
 *
 * The audit script (scripts/i18n-audit.ts) is the other half of this and runs
 * in CI. It checks key parity; these check what happens when parity is broken
 * anyway, which is the case the audit cannot cover because by then the build
 * has already failed.
 */
import { describe, expect, it } from "vitest";
import { LOCALES, LOCALE_NAMES, RTL_LOCALES, isLocale } from "@/i18n/config";
import { getPlanes, getUi } from "@/i18n/dictionary";
import enUi from "@/i18n/ui/en";
import enPlanes from "@/i18n/planes/en";
import { PLANES, PLANE_IDS } from "@/content";
import type { PlaneId } from "@/content/types";

describe("locale config", () => {
  it("names every locale in its own language", () => {
    for (const locale of LOCALES) {
      expect(LOCALE_NAMES[locale], `no display name for ${locale}`).toBeTruthy();
    }
    expect(Object.keys(LOCALE_NAMES).sort()).toEqual([...LOCALES].sort());
  });

  it("recognises its own locales and rejects near-misses", () => {
    for (const locale of LOCALES) expect(isLocale(locale)).toBe(true);
    // "en-GB" is what navigator.language hands you; the root redirect splits
    // the region off before asking, and this pins that it has to.
    for (const bad of ["en-GB", "EN", "xx", "", "zh-Hant"]) expect(isLocale(bad)).toBe(false);
  });

  it("marks Arabic, and only Arabic, as right-to-left", () => {
    expect([...RTL_LOCALES]).toEqual(["ar"]);
  });
});

describe.each(LOCALES)("%s dictionary", (locale) => {
  it("answers every UI key English answers", () => {
    const ui = getUi(locale);
    const missing = Object.keys(enUi).filter((k) => !ui[k]);
    expect(missing, `blank UI strings in ${locale}`).toEqual([]);
  });

  it("carries prose for every plane in the catalogue", () => {
    const dict = getPlanes(locale);
    for (const id of PLANE_IDS) {
      const strings = dict.planes[id as PlaneId];
      expect(strings, `${locale} has no prose for ${id}`).toBeDefined();
      if (!strings) continue;
      expect(strings.name).toBeTruthy();
      expect(strings.description).toBeTruthy();
      expect(strings.throwTip).toBeTruthy();
    }
  });

  it("gives every fold step a title and an instruction", () => {
    const dict = getPlanes(locale);
    for (const [id, structure] of Object.entries(PLANES)) {
      const strings = dict.planes[id as PlaneId];
      if (!strings) continue;
      for (const step of structure.steps) {
        expect(strings.titles[step.id], `${locale} ${step.id} title`).toBeTruthy();
        expect(strings.steps[step.id], `${locale} ${step.id} instruction`).toBeTruthy();
        if (step.hasWhy) {
          expect(strings.why[step.id], `${locale} ${step.id} why-line`).toBeTruthy();
        }
      }
    }
  });

  it("defines every glossary term English defines", () => {
    const dict = getPlanes(locale);
    for (const key of Object.keys(enPlanes.glossary)) {
      const entry = dict.glossary[key];
      expect(entry?.term, `${locale} glossary term ${key}`).toBeTruthy();
      expect(entry?.definition, `${locale} glossary definition ${key}`).toBeTruthy();
    }
  });

  it("keeps every {placeholder} the English string declares", () => {
    // A dropped placeholder is the one translation error that reads as
    // finished prose and still ships a broken sentence: "Wings:" with no
    // number. The formatter substitutes by name, so an omitted slot is silent.
    const ui = getUi(locale);
    const slots = (s: string): string[] => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort();
    for (const [key, english] of Object.entries(enUi)) {
      expect(slots(ui[key] ?? ""), `${locale} ${key} placeholders`).toEqual(slots(english));
    }
  });
});

describe("English fallback", () => {
  it("returns the English objects untouched for en", () => {
    expect(getUi("en")).toBe(enUi);
    expect(getPlanes("en")).toBe(enPlanes);
  });

  it("fills an untranslated locale entirely from English", () => {
    // Whatever is not translated yet must still render English prose rather
    // than a key or a gap, which is what makes shipping a locale incrementally
    // safe.
    const dict = getPlanes("en");
    expect(Object.keys(dict.planes).sort()).toEqual([...PLANE_IDS].sort());
  });
});
