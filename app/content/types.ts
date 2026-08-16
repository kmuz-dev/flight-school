/**
 * Content-as-code schemas (SPEC.md §3/§4.2). Structure only - never prose.
 * All human-readable text lives in app/i18n dictionaries keyed by stable ids.
 */
import type { FoldStep, PaperFormat } from "@/engine/core/types";
import type { SequenceFormat } from "@/engine/core/paper";

export type PlaneId =
  | "dart"
  | "bulldog"
  | "harrier"
  | "sea-glider"
  | "hammer"
  | "square-cruiser";

export type Tier = "easy" | "medium" | "advanced";

/** 1-5 gauge value. */
export type Rating = 1 | 2 | 3 | 4 | 5;

/** The shared vocabulary for the estimated flight profile. */
export type RatingKey = "speed" | "distance" | "airtime" | "ease";

export const RATING_KEYS: readonly RatingKey[] = ["speed", "distance", "airtime", "ease"];

export type PlaneStructure = {
  readonly id: PlaneId;
  readonly tier: Tier;
  readonly paper: {
    /**
     * The format the fold sequence itself starts from. Authored planes use
     * "letter-a4" or "square"; a sequence composed with its paper prep in front
     * carries the concrete source sheet instead.
     */
    readonly format: SequenceFormat;
    /**
     * Prep sequences per source paper the user actually has.
     * An empty array means pass-through (no conversion needed).
     * Content validation requires every source paper to be present.
     */
    readonly prep: Readonly<Record<PaperFormat, readonly FoldStep[]>>;
  };
  readonly ratings: Readonly<Record<RatingKey, Rating>>;
  readonly steps: readonly FoldStep[];
  /** Per-plane accent (hangar card, stage details) - must come from DESIGN.md palette. */
  readonly accent: string;
};
