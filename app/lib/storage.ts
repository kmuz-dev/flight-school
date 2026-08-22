/**
 * localStorage schema (SPEC.md §6). Versioned single key; unknown or corrupt
 * data is discarded silently. All reads are SSR/export-safe.
 *
 * The key is deliberately unchanged across the Night Flight retirement. A blob
 * written by an older build carries a `theme` field this schema no longer names,
 * and the field-by-field read below simply does not copy it forward - so a cadet
 * who chose Night Flight keeps every wing they earned under it, and the dead
 * value is dropped the next time anything is written. Bumping the version to
 * v2 would have been the same work plus the loss of everyone's progress.
 */
import type { PlaneId } from "@/content/types";
import type { PaperFormat } from "@/engine/core/types";
import type { FlightRecord } from "@/engine/flight/types";

const KEY = "flightschool.v1";

export type Stored = {
  progress: Partial<Record<PlaneId, { step: number; updatedAt: string }>>;
  completed: Partial<Record<PlaneId, { at: string }>>;
  locale?: string;
  paperChoice?: Partial<Record<PlaneId, PaperFormat>>;
  flights?: Partial<Record<PlaneId, FlightRecord>>;
};

const EMPTY: Stored = { progress: {}, completed: {} };

export function readStored(): Stored {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const p = parsed as Partial<Stored>;
    return {
      progress: typeof p.progress === "object" && p.progress !== null ? p.progress : {},
      completed: typeof p.completed === "object" && p.completed !== null ? p.completed : {},
      locale: typeof p.locale === "string" ? p.locale : undefined,
      paperChoice:
        typeof p.paperChoice === "object" && p.paperChoice !== null ? p.paperChoice : undefined,
      flights: readFlights(p.flights),
    };
  } catch {
    return EMPTY;
  }
}

function readFlights(value: unknown): Stored["flights"] {
  if (typeof value !== "object" || value === null) return undefined;
  const records: Partial<Record<PlaneId, FlightRecord>> = {};
  for (const [id, candidate] of Object.entries(value)) {
    if (typeof candidate !== "object" || candidate === null) continue;
    const record = candidate as Partial<FlightRecord>;
    if (
      !Number.isFinite(record.bestTimeMs) ||
      record.bestTimeMs! <= 0 ||
      !Number.isInteger(record.bestClosePasses) ||
      record.bestClosePasses! < 0 ||
      !Number.isInteger(record.bestChain) ||
      record.bestChain! < 0 ||
      typeof record.updatedAt !== "string"
    ) continue;
    records[id as PlaneId] = record as FlightRecord;
  }
  return Object.keys(records).length > 0 ? records : undefined;
}


export function writeStored(update: (prev: Stored) => Stored): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(update(readStored())));
  } catch {
    // Quota/private-mode failures degrade to stateless; never throw into UI.
  }
}
