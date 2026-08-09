"use client";

import { useEffect } from "react";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { readStored } from "@/lib/storage";

/**
 * Static export has no server redirects; the root page picks a locale
 * client-side (stored choice, then browser language, then en).
 */
export default function RootRedirect() {
  useEffect(() => {
    const stored = readStored().locale;
    const browser = navigator.language.split("-")[0] ?? "";
    const locale =
      stored && isLocale(stored) ? stored : isLocale(browser) ? browser : DEFAULT_LOCALE;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    window.location.replace(`${base}/${locale}/`);
  }, []);
  return null;
}
