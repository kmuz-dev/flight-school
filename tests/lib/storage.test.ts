import { beforeEach, describe, expect, it, vi } from "vitest";
import { readStored, writeStored } from "@/lib/storage";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
  });
});

describe("storage", () => {
  it("returns an empty shape when nothing is stored", () => {
    expect(readStored()).toEqual({ progress: {}, completed: {} });
  });

  it("round-trips progress and completion", () => {
    writeStored((prev) => ({
      ...prev,
      progress: { dart: { step: 4, updatedAt: "2026-01-01T00:00:00Z" } },
      completed: { dart: { at: "2026-01-01T00:05:00Z" } },
    }));
    const read = readStored();
    expect(read.progress.dart?.step).toBe(4);
    expect(read.completed.dart?.at).toBe("2026-01-01T00:05:00Z");
  });

  it("round-trips flight records without changing the storage version", () => {
    writeStored((prev) => ({
      ...prev,
      flights: {
        dart: {
          bestTimeMs: 61_200,
          bestClosePasses: 5,
          bestChain: 3,
          updatedAt: "2026-08-22T10:00:00Z",
        },
      },
    }));
    expect(readStored().flights?.dart?.bestTimeMs).toBe(61_200);
  });

  it("drops malformed flight records without disturbing folding progress", () => {
    store.set("flightschool.v1", JSON.stringify({
      progress: { dart: { step: 3, updatedAt: "2026-08-22T10:00:00.000Z" } },
      completed: {},
      flights: { dart: { bestTimeMs: "fast", bestClosePasses: -2, bestChain: 1, updatedAt: 4 } },
    }));
    expect(readStored().progress.dart?.step).toBe(3);
    expect(readStored().flights).toBeUndefined();
  });

  it("discards corrupt data instead of throwing", () => {
    store.set("flightschool.v1", "{not json");
    expect(readStored()).toEqual({ progress: {}, completed: {} });
  });

  it("ignores non-object payloads", () => {
    store.set("flightschool.v1", '"a string"');
    expect(readStored()).toEqual({ progress: {}, completed: {} });
  });

  /*
   * Night Flight is gone but the key it was written into is not, and a cadet
   * who chose it must not lose a single wing to that. The read is field by
   * field, so a retired name is dropped rather than carried, and everything
   * beside it survives - which is the whole reason the schema stayed at v1.
   */
  it("keeps everything else when a blob still carries a retired theme", () => {
    store.set(
      "flightschool.v1",
      JSON.stringify({
        progress: { dart: { step: 3, updatedAt: "2026-08-09T10:00:00.000Z" } },
        completed: { dart: { at: "2026-08-09T10:00:00.000Z" } },
        locale: "ja",
        theme: "night",
        paperChoice: { dart: "a4" },
      }),
    );

    const stored = readStored();
    expect(stored.progress.dart?.step).toBe(3);
    expect(stored.completed.dart).toBeDefined();
    expect(stored.locale).toBe("ja");
    expect(stored.paperChoice?.dart).toBe("a4");
    expect("theme" in stored).toBe(false);
  });
});
