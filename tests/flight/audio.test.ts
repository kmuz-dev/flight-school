import { afterEach, describe, expect, it } from "vitest";
import { HallwayFlightAudio } from "@/engine/flight/audio";

const originalWindow = globalThis.window;

afterEach(() => {
  if (originalWindow === undefined) Reflect.deleteProperty(globalThis, "window");
  else Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
});

describe("hallway audio fallback", () => {
  it("resolves startup when Web Audio is unavailable", async () => {
    const audio = new HallwayFlightAudio();
    await expect(audio.start()).resolves.toBeUndefined();
    audio.dispose();
  });

  it("contains an AudioContext constructor failure", async () => {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { AudioContext: class { constructor() { throw new Error("unavailable"); } } } });
    const audio = new HallwayFlightAudio();
    await expect(audio.start()).resolves.toBeUndefined();
    expect(() => audio.setFlight(1)).not.toThrow();
    audio.dispose();
  });

  it("keeps feedback calls safe before audio is unlocked", () => {
    const audio = new HallwayFlightAudio();
    expect(() => {
      audio.setMuted(true);
      audio.setPaused(true);
      audio.setFlight(Number.NaN);
      audio.gust();
      audio.closePass(Number.NaN);
      audio.collision();
      audio.finish();
      audio.dispose();
    }).not.toThrow();
  });
});
