import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { PLANES, PLANE_IDS, getPlane } from "@/content";
import ui from "@/i18n/ui/en";
import planesDict from "@/i18n/planes/en";
import { hangarHref, preflightHref, tutorialHref } from "@/lib/paths";
import { finishedPlaneSvg } from "@/components/hangar/viewModel";
import { CompletionScreen } from "@/components/completion/CompletionScreen";
import { buildFleet, completionUiFromDictionary } from "@/components/completion/types";
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

  // Only English exists so far; Phase 3 adds the other eleven dictionaries and
  // the merge-over-English fallback.
  const strings = planesDict.planes[structure.id as PlaneId];
  if (!strings) notFound();

  return (
    <CompletionScreen
      ui={completionUiFromDictionary(ui)}
      view={{
        id: structure.id,
        name: strings.name,
        tier: structure.tier,
        stepCount: structure.steps.length,
        svg: finishedPlaneSvg(structure, { width: 520, height: 400 }),
        fleet: buildFleet(PLANES, planesDict, (id) => preflightHref(locale, id)),
      }}
      locale={locale}
      hangarHref={hangarHref(locale)}
      tutorialHref={tutorialHref(locale, planeId)}
    />
  );
}
