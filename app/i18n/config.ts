export const LOCALES = [
  "en",
  "es",
  "fr",
  "de",
  "pt",
  "ru",
  "hi",
  "id",
  "ja",
  "ko",
  "zh",
  "ar",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(["ar"]);

/**
 * Each language named in itself, because the picker is the one control a cadet
 * uses precisely when they cannot read the current language. These live here
 * rather than in the dictionaries: a locale list translated per locale is 144
 * strings to keep in sync for no gain, and "Deutsch" is what a German speaker
 * looks for whichever language the page happens to be in.
 */
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  ar: "العربية",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
