import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { PLANE_IDS, getPlane } from "@/content";
import ui from "@/i18n/ui/en";
import planesDict from "@/i18n/planes/en";
import { hangarHref, tutorialHref } from "@/lib/paths";
import { finishedPlaneSvg } from "@/components/hangar/viewModel";
import { PreflightScreen } from "@/components/preflight/PreflightScreen";
import { buildPreflightView, preflightUiFromDictionary } from "@/components/preflight/types";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PLANE_IDS.map((planeId) => ({ locale, planeId })));
}

/** Preflight, the plane detail page (SCREENS.md §2). The tutorial lives one
 * segment deeper, at `/plane/[planeId]/fold/`. */
export default async function PreflightPage({
  params,
}: {
  params: Promise<{ locale: string; planeId: string }>;
}) {
  const { locale, planeId } = await params;
  const structure = getPlane(planeId);
  if (!isLocale(locale) || !structure) notFound();

  // Only English exists so far; Phase 3 adds the other eleven dictionaries and
  // the merge-over-English fallback.
  const view = buildPreflightView(
    structure,
    planesDict,
    PLANE_IDS,
    finishedPlaneSvg(structure, { width: 760, height: 520 }),
  );
  if (!view) notFound();

  return (
    <PreflightScreen
      ui={preflightUiFromDictionary(ui)}
      view={view}
      hangarHref={hangarHref(locale)}
      tutorialHref={tutorialHref(locale, planeId)}
    />
  );
}
