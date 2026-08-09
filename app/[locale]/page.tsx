import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { PLANES } from "@/content";
import ui from "@/i18n/ui/en";
import planesDict from "@/i18n/planes/en";
import { Hangar } from "@/components/hangar/Hangar";
import { hangarUiFromDictionary } from "@/components/hangar/types";
import { buildHangarPlanes } from "@/components/hangar/viewModel";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * The Hangar (SCREENS.md §1). Every card's finished-plane render is produced
 * here, at build time, by the fold engine, so the catalog is meaningful before
 * a single byte of JavaScript runs.
 */
export default async function HangarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Only English exists so far; Phase 3 adds the other eleven dictionaries and
  // the merge-over-English fallback.
  const planes = buildHangarPlanes(locale, PLANES, planesDict);

  return <Hangar ui={hangarUiFromDictionary(ui)} planes={planes} locale={locale} />;
}
