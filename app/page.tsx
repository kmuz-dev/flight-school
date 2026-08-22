"use client";

import { useEffect } from "react";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { readStored } from "@/lib/storage";
import { BrandMark } from "@/components/ui/BrandMark";

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
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-lg text-ink">
      <div className="flex flex-col items-center gap-md">
        <BrandMark className="h-40 w-44" sizes="176px" priority />
        <p className="font-display text-h1 font-bold tracking-tight uppercase">Flight School</p>
      </div>
    </main>
  );
}
