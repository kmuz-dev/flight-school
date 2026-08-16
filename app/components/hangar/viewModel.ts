/**
 * Hangar view-model. Runs at build time inside the server component: it walks
 * the plane registry generically (never a hard-coded id), pairs each structure
 * with its prose, and renders the finished aircraft through the fold engine's
 * SVG projection so every route ships a real engine render in its HTML.
 *
 * A plane whose dictionary entry has not landed yet is left out rather than
 * rendered nameless; `tests/content` fails loudly on that gap, so the fleet
 * degrades quietly while the build still tells the truth about it.
 */
import { computeFoldState, renderStateToSvg } from "@/engine";
import { preflightHref } from "@/lib/paths";
import type { PlaneStructure } from "@/content/types";
import type { PlaneId } from "@/content/types";
import type { PlanesDictionary } from "@/i18n/types";
import { getAircraftPresentation } from "@/content/presentation";
import type { HangarPlaneView } from "./types";

/** Default render area, in the SVG's own units; the viewBox scales it to fit. */
const DEFAULT_RENDER = { width: 420, height: 280 } as const;

export function finishedPlaneSvg(
  structure: PlaneStructure,
  size: { width: number; height: number } = DEFAULT_RENDER,
): string {
  const presentation = getAircraftPresentation(structure.id);
  const finished = computeFoldState(structure, structure.steps.length - 1);
  // `display` because this is an aircraft, not a step of a fold: it stands up
  // instead of lying on its side with half of it below the table, it is lit
  // rather than flat-filled, and it floats over its own contact shadow at the
  // same height the live stage floats it. That last part is why the shadow
  // belongs in the SVG and not in the surrounding CSS - a fixed ellipse behind
  // the picture cannot know where a particular aircraft's keel actually is, and
  // on the Dart it sat well aft of the nose that was nearest the ground.
  // One edit covers the hangar bay's fallback, the preflight hero and the
  // wings-earned panel.
  return renderStateToSvg(finished, {
    ...size,
    showCreaseMarks: false,
    display: true,
    displayView: presentation.displayView,
  });
}

export function buildHangarPlanes(
  locale: string,
  planes: Readonly<Record<string, PlaneStructure>>,
  dict: PlanesDictionary,
): HangarPlaneView[] {
  return Object.values(planes).flatMap((structure) => {
    const strings = dict.planes[structure.id as PlaneId];
    if (!strings) return [];
    return [
      {
        id: structure.id,
        name: strings.name,
        tier: structure.tier,
        stepCount: structure.steps.length,
        svg: finishedPlaneSvg(structure),
        presentation: getAircraftPresentation(structure.id),
        href: preflightHref(locale, structure.id),
        structure,
      },
    ];
  });
}
