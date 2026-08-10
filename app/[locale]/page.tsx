import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { PLANES } from "@/content";
import { getPlanes, getUi } from "@/i18n/dictionary";
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

  const ui = getUi(locale);
  const planes = buildHangarPlanes(locale, PLANES, getPlanes(locale));

  return <Hangar ui={hangarUiFromDictionary(ui)} planes={planes} locale={locale} />;
}
