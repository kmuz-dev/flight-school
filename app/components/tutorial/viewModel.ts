/**
 * Builds the tutorial view-model from content structure + i18n prose.
 *
 * This is the single place where `PlaneStructure` (geometry, ids) meets
 * `PlaneStrings` / the glossary (prose). Components downstream see only the
 * view-model, so the structure/prose split from CLAUDE.md holds all the way to
 * the leaves.
 */
import type { PlaneStructure } from "@/content/types";
import type { GlossaryEntry, PlaneStrings } from "@/i18n/types";
import type { CreaseIconVariant, GlossaryItemView, TutorialStepView } from "./types";

/** `PlaneStrings.tips` key used when a step declares no tip of its own. */
export const PLANE_TIP_KEY = "default";

/**
 * `PlaneStrings` has no per-step titles yet (see the report to the integrator).
 * Accepting them as an optional extra keeps this additive: the day the content
 * schema grows a `titles` record, this starts reading it with no code change.
 */
export type PlaneStringsWithTitles = PlaneStrings & {
  readonly titles?: Readonly<Record<string, string>>;
};

export function creaseIconVariant(termKey: string): CreaseIconVariant {
  if (termKey.includes("mountain")) return "mountain";
  if (termKey.includes("valley")) return "valley";
  return "line";
}

export function buildTutorialSteps(
  structure: PlaneStructure,
  strings: PlaneStringsWithTitles,
  glossary: Readonly<Record<string, GlossaryEntry>>,
): readonly TutorialStepView[] {
  return structure.steps.map((step, index) => {
    const glossaryItems: GlossaryItemView[] = (step.teaches ?? []).flatMap((key) => {
      const entry = glossary[key];
      if (!entry) return [];
      return [
        {
          key,
          term: entry.term,
          definition: entry.definition,
          icon: creaseIconVariant(key),
        },
      ];
    });

    // The stage annotation names the fold being performed; the glossary already
    // holds that word in every locale, so no extra i18n key is needed.
    const annotationLabel =
      step.action.type === "fold"
        ? glossary[`${step.action.direction}-fold`]?.term
        : undefined;

    const why = step.hasWhy ? strings.why[step.id] : undefined;
    const tip = strings.tips[step.id] ?? strings.tips[PLANE_TIP_KEY];

    const view: TutorialStepView = {
      id: step.id,
      index,
      title: strings.titles?.[step.id] ?? "",
      instruction: strings.steps[step.id] ?? "",
      ...(why === undefined ? {} : { why }),
      ...(tip === undefined ? {} : { tip }),
      ...(annotationLabel === undefined ? {} : { annotationLabel }),
      glossary: glossaryItems,
    };
    return view;
  });
}
