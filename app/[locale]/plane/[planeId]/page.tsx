import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { PLANE_IDS, getPlane } from "@/content";
import ui from "@/i18n/ui/en";
import planesDict from "@/i18n/planes/en";
import { tutorialUiFromDictionary } from "@/components/tutorial/uiStrings";
import { buildTutorialSteps } from "@/components/tutorial/viewModel";
import { TutorialScreen } from "@/components/tutorial/TutorialScreen";
import { formatForPlane } from "@/engine/core/paper";
import type { PlaneId } from "@/content/types";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PLANE_IDS.map((planeId) => ({ locale, planeId })));
}

export default async function TutorialPage({
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
  const tutorialUi = tutorialUiFromDictionary(ui);
  const steps = buildTutorialSteps(structure, strings, planesDict.glossary);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <TutorialScreen
      ui={tutorialUi}
      structure={structure}
      steps={steps}
      planeName={strings.name}
      tier={structure.tier}
      paperFormat={formatForPlane(structure.paper.format)}
      hangarHref={`${basePath}/${locale}/`}
    />
  );
}
