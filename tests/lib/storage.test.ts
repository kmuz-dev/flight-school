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

  it("discards corrupt data instead of throwing", () => {
    store.set("flightschool.v1", "{not json");
    expect(readStored()).toEqual({ progress: {}, completed: {} });
  });

  it("ignores non-object payloads", () => {
    store.set("flightschool.v1", '"a string"');
    expect(readStored()).toEqual({ progress: {}, completed: {} });
  });

  it("rejects an unknown theme value", () => {
    store.set("flightschool.v1", JSON.stringify({ progress: {}, completed: {}, theme: "neon" }));
    expect(readStored().theme).toBeUndefined();
  });
});
