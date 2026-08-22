import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { getPlane, PLANE_IDS } from "@/content";
import { getPlanes, getUi } from "@/i18n/dictionary";
import { hangarHref, tutorialHref } from "@/lib/paths";
import { FlightScreen } from "@/components/flight/FlightScreen";
import { flightUiFromDictionary } from "@/components/flight/types";
import type { PlaneId } from "@/content/types";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PLANE_IDS.map((planeId) => ({ locale, planeId })));
}

export default async function FlightPage({ params }: { params: Promise<{ locale: string; planeId: string }> }) {
  const { locale, planeId } = await params;
  const structure = getPlane(planeId);
  if (!isLocale(locale) || !structure) notFound();
  const strings = getPlanes(locale).planes[structure.id as PlaneId];
  if (!strings) notFound();

  return (
    <FlightScreen
      ui={flightUiFromDictionary(getUi(locale))}
      structure={structure}
      planeName={strings.name}
      hangarHref={hangarHref(locale)}
      tutorialHref={tutorialHref(locale, planeId)}
    />
  );
}
