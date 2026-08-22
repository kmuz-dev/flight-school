/**
 * Locale -> dictionary resolution (SPEC.md §5).
 *
 * Two decisions worth stating, because both were made against an obvious
 * alternative:
 *
 * A static registry, not `await import(\`./ui/${locale}\`)`. The dynamic form
 * makes webpack build a context module out of the whole directory and gives
 * the type checker nothing to check, in exchange for saving twelve import
 * lines. These modules are only ever read while rendering server components at
 * build time, so nothing here reaches a browser: a page ships the strings it
 * actually rendered, not the dictionary they came from.
 *
 * Missing keys fall back to English rather than rendering blank or raw. A
 * whole absent locale is then not a separate case at all - it is the fully
 * fallen-back one - which is why the registry is Partial and there is no
 * "locale not found" branch to get wrong. What stops a locale quietly
 * shipping as English is `scripts/i18n-audit.ts --strict` in CI, where a gap
 * is cheap to see and cheap to fix; at runtime the same gap must never be a
 * blank placard in front of a ten-year-old mid-fold.
 */
import { DEFAULT_LOCALE, type Locale } from "./config";
import type { GlossaryEntry, PlaneStrings, PlanesDictionary, UiDictionary } from "./types";
import type { PlaneId } from "@/content/types";

import enUi from "./ui/en";
import esUi from "./ui/es";
import frUi from "./ui/fr";
import deUi from "./ui/de";
import ptUi from "./ui/pt";
import ruUi from "./ui/ru";
import hiUi from "./ui/hi";
import idUi from "./ui/id";
import jaUi from "./ui/ja";
import koUi from "./ui/ko";
import zhUi from "./ui/zh";
import arUi from "./ui/ar";

import enPlanes from "./planes/en";
import esPlanes from "./planes/es";
import frPlanes from "./planes/fr";
import dePlanes from "./planes/de";
import ptPlanes from "./planes/pt";
import ruPlanes from "./planes/ru";
import hiPlanes from "./planes/hi";
import idPlanes from "./planes/id";
import jaPlanes from "./planes/ja";
import koPlanes from "./planes/ko";
import zhPlanes from "./planes/zh";
import arPlanes from "./planes/ar";

const UI: Partial<Record<Locale, UiDictionary>> = {
  en: enUi,
  es: esUi,
  fr: frUi,
  de: deUi,
  pt: ptUi,
  ru: ruUi,
  hi: hiUi,
  id: idUi,
  ja: jaUi,
  ko: koUi,
  zh: zhUi,
  ar: arUi,
};

const PLANES: Partial<Record<Locale, PlanesDictionary>> = {
  en: enPlanes,
  es: esPlanes,
  fr: frPlanes,
  de: dePlanes,
  pt: ptPlanes,
  ru: ruPlanes,
  hi: hiPlanes,
  id: idPlanes,
  ja: jaPlanes,
  ko: koPlanes,
  zh: zhPlanes,
  ar: arPlanes,
};

/** Site chrome for `locale`, with any untranslated key filled from English. */
export function getUi(locale: Locale): UiDictionary {
  if (locale === DEFAULT_LOCALE) return enUi;
  return { ...enUi, ...UI[locale] };
}

/** Plane prose for `locale`, with any untranslated string filled from English. */
export function getPlanes(locale: Locale): PlanesDictionary {
  if (locale === DEFAULT_LOCALE) return enPlanes;
  const translated = PLANES[locale];
  if (!translated) return enPlanes;
  return {
    planes: mergePlanes(enPlanes.planes, translated.planes),
    glossary: mergeRecords(enPlanes.glossary, translated.glossary),
  };
}

/**
 * The merge is written out against the real shape rather than done generically.
 * A generic deep merge would also happily merge two step-id maps that disagree
 * about which steps exist, and the shape here is nine fields that change about
 * once a phase.
 */
function mergePlanes(
  base: PlanesDictionary["planes"],
  over: PlanesDictionary["planes"],
): PlanesDictionary["planes"] {
  const out: Record<string, PlaneStrings> = {};
  for (const [id, strings] of Object.entries(base)) {
    const t = over[id as PlaneId];
    out[id] = t
      ? {
          name: t.name || strings.name,
          description: t.description || strings.description,
          throwTip: t.throwTip || strings.throwTip,
          titles: mergeRecords(strings.titles, t.titles),
          steps: mergeRecords(strings.steps, t.steps),
          explanations: mergeRecords(strings.explanations ?? {}, t.explanations),
          tips: mergeRecords(strings.tips, t.tips),
        }
      : strings;
  }
  return out as PlanesDictionary["planes"];
}

function mergeRecords<T extends string | GlossaryEntry>(
  base: Readonly<Record<string, T>>,
  over: Readonly<Record<string, T>> | undefined,
): Readonly<Record<string, T>> {
  if (!over) return base;
  const out: Record<string, T> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v !== undefined && v !== "") out[k] = v;
  }
  return out;
}
