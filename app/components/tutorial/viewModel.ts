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

export function creaseIconVariant(termKey: string): CreaseIconVariant {
  if (termKey.includes("mountain")) return "mountain";
  if (termKey.includes("valley")) return "valley";
  return "line";
}

export function buildTutorialSteps(
  structure: PlaneStructure,
  strings: PlaneStrings,
  glossary: Readonly<Record<string, GlossaryEntry>>,
): readonly TutorialStepView[] {
  return structure.steps.map((step, index) => {
    const title = strings.titles[step.id];
    const instruction = strings.steps[step.id];
    if (!title || !instruction) {
      throw new Error(`Missing tutorial prose for ${step.id}`);
    }
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

    const explanation = strings.explanations?.[step.id];
    const tip = strings.tips[step.id];

    const view: TutorialStepView = {
      id: step.id,
      index,
      title,
      instruction,
      ...(explanation === undefined ? {} : { explanation }),
      ...(tip === undefined ? {} : { tip }),
      ...(annotationLabel === undefined ? {} : { annotationLabel }),
      glossary: glossaryItems,
    };
    return view;
  });
}
