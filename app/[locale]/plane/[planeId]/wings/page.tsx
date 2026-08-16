import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { PLANES, PLANE_IDS, getPlane } from "@/content";
import { getPlanes, getUi } from "@/i18n/dictionary";
import { hangarHref, preflightHref, tutorialHref } from "@/lib/paths";
import { finishedPlaneSvg } from "@/components/hangar/viewModel";
import { CompletionScreen } from "@/components/completion/CompletionScreen";
import { buildFleet, completionUiFromDictionary } from "@/components/completion/types";
import { getAircraftPresentation } from "@/content/presentation";
import type { PlaneId } from "@/content/types";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PLANE_IDS.map((planeId) => ({ locale, planeId })));
}

/** Wings earned (SCREENS.md §4). */
export default async function WingsPage({
  params,
}: {
  params: Promise<{ locale: string; planeId: string }>;
}) {
  const { locale, planeId } = await params;
  const structure = getPlane(planeId);
  if (!isLocale(locale) || !structure) notFound();

  const planesDict = getPlanes(locale);
  const strings = planesDict.planes[structure.id as PlaneId];
  if (!strings) notFound();

  return (
    <CompletionScreen
      ui={completionUiFromDictionary(getUi(locale))}
      view={{
        id: structure.id,
        name: strings.name,
        tier: structure.tier,
        stepCount: structure.steps.length,
        svg: finishedPlaneSvg(structure, { width: 520, height: 400 }),
        presentation: getAircraftPresentation(structure.id),
        fleet: buildFleet(PLANES, planesDict, (id) => preflightHref(locale, id)),
      }}
      locale={locale}
      hangarHref={hangarHref(locale)}
      tutorialHref={tutorialHref(locale, planeId)}
    />
  );
}
