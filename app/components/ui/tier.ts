/**
 * How a licence tier is drawn, in one place.
 *
 * SCREENS.md §1: "tier chip top-right (BEGINNER navy-filled, PILOT outlined,
 * ACE red-filled)". The catalog card, the filter chips and the preflight rail
 * all read from here so a tier never changes colour between screens.
 */
import type { Tier } from "@/content/types";
import type { ChipVariant } from "./Chip";

export const TIERS: readonly Tier[] = ["easy", "medium", "advanced"];

export const TIER_CHIP: Readonly<Record<Tier, ChipVariant>> = {
  easy: "ink",
  medium: "outline",
  advanced: "red",
};
