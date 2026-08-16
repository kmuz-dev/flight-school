"use client";

/**
 * The client seam for the tutorial route.
 *
 * Two things the server cannot decide: where the cadet's completion beat goes
 * (the wings certificate), and which sheet they are folding from. The sheet
 * lives in localStorage, so the route prerenders a variant per usable sheet and
 * this picks one - a variant whose paper needs converting simply carries the
 * prep folds in front of the plane's own.
 */
import { useRouter } from "next/navigation";
import type { PaperFormat } from "@/engine/core/types";
import type { PlaneId, PlaneStructure } from "@/content/types";
import type { TutorialStepView, TutorialUiStrings } from "@/components/tutorial/types";
import { TutorialScreen } from "@/components/tutorial/TutorialScreen";
import { usePaperChoice } from "@/lib/progress";

export type FoldVariant = {
  readonly structure: PlaneStructure;
  readonly steps: readonly TutorialStepView[];
  readonly paperFormat: PaperFormat;
};

export type FoldRouteProps = {
  readonly ui: TutorialUiStrings;
  readonly variants: Readonly<Record<string, FoldVariant>>;
  readonly defaultPaper: PaperFormat;
  readonly planeId: PlaneId;
  readonly planeName: string;
  readonly hangarHref: string;
  readonly completionHref: string;
};

export function FoldRoute({
  ui,
  variants,
  defaultPaper,
  planeId,
  planeName,
  hangarHref,
  completionHref,
}: FoldRouteProps) {
  const router = useRouter();
  const chosen = usePaperChoice(planeId);
  // An unusable choice falls back rather than dead-ending: the sheet may have
  // been chosen for this plane before the catalog changed under it.
  const variant = (chosen ? variants[chosen] : undefined) ?? variants[defaultPaper];
  if (!variant) return null;

  return (
    <TutorialScreen
      ui={ui}
      structure={variant.structure}
      steps={variant.steps}
      planeName={planeName}
      paperFormat={variant.paperFormat}
      hangarHref={hangarHref}
      onComplete={() => router.push(completionHref)}
    />
  );
}
