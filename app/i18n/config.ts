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

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
