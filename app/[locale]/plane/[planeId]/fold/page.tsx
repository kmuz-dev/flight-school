import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { PLANE_IDS, getPlane } from "@/content";
import { getPlanes, getUi } from "@/i18n/dictionary";
import { tutorialUiFromDictionary } from "@/components/tutorial/uiStrings";
import { buildTutorialSteps } from "@/components/tutorial/viewModel";
import { formatForPlane } from "@/engine/core/paper";
import { PAPER_CHOICES, paperIsUsable, sequenceForPaper } from "@/content/sequence";
import type { PaperFormat } from "@/engine/core/types";
import type { FoldVariant } from "./FoldRoute";
import { completionHref, hangarHref } from "@/lib/paths";
import type { PlaneId } from "@/content/types";
import { FoldRoute } from "./FoldRoute";

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

  const planesDict = getPlanes(locale);
  const strings = planesDict.planes[structure.id as PlaneId];
  if (!strings) notFound();
  const tutorialUi = tutorialUiFromDictionary(getUi(locale));

  /**
   * One variant per sheet a cadet might have. Paper prep is folds and a cut
   * like any other, so a sheet that needs converting simply gets a longer
   * sequence with that conversion in front - same screen, same engine, same
   * progress counter. Which sheet they have lives in localStorage, so every
   * variant is built here and the client picks; there are at most four, and
   * the common case returns the plane's own structure unchanged.
   */
  const variants: Record<string, FoldVariant> = {};
  for (const paper of PAPER_CHOICES) {
    if (!paperIsUsable(structure, paper)) continue;
    const composed = sequenceForPaper(structure, paper);
    variants[paper] = {
      structure: composed,
      steps: buildTutorialSteps(composed, strings, planesDict.glossary),
      paperFormat: paper,
    };
  }
  const nativePaper = formatForPlane(structure.paper.format);

  return (
    <FoldRoute
      ui={tutorialUi}
      variants={variants}
      defaultPaper={nativePaper as PaperFormat}
      planeId={structure.id}
      planeName={strings.name}
      tier={structure.tier}
      hangarHref={hangarHref(locale)}
      completionHref={completionHref(locale, planeId)}
    />
  );
}
