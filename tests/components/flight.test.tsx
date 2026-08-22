import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getPlane } from "@/content";
import planes from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { FlightScreen } from "@/components/flight/FlightScreen";
import { flightUiFromDictionary } from "@/components/flight/types";
import { __resetProgressCache } from "@/lib/progress";
import { readStored } from "@/lib/storage";
import type { HallwayFlightGameFactory, HallwayFlightGameOptions } from "@/engine/flight/client";
import type { FlightEvent, FlightSnapshot } from "@/engine/flight";

const structure = getPlane("dart")!;
const strings = flightUiFromDictionary(ui);
const planeName = planes.planes.dart!.name;

function seed(earned: boolean): void {
  window.localStorage.setItem("flightschool.v1", JSON.stringify({
    progress: {},
    completed: earned ? { dart: { at: "2026-08-22T10:00:00.000Z" } } : {},
  }));
  __resetProgressCache();
}

function fakeGame() {
  let options: HallwayFlightGameOptions | null = null;
  const log = { created: 0, launched: 0, restarted: 0, disposed: 0, paused: 0 };
  let snapshot: FlightSnapshot = {
    phase: "ready", elapsedMs: 0, remainingMs: 90_000, closePasses: 0,
    currentChain: 0, bestChain: 0, speed: 0, era: "1950s", progress: 0,
    muted: false, reducedMotion: false, tiltEnabled: false,
  };
  const factory: HallwayFlightGameFactory = (next) => {
    options = next;
    log.created += 1;
    next.onSnapshot?.(snapshot);
    return {
      launch: () => { log.launched += 1; },
      setInput: () => {},
      pause: () => { log.paused += 1; },
      resume: () => {},
      restart: () => { log.restarted += 1; },
      setMuted: () => {},
      setReducedMotion: () => {},
      setTiltEnabled: () => {},
      snapshot: () => snapshot,
      diagnostics: () => ({
        profile: { planeId: "dart", spanMm: 200, lengthMm: 280, heightMm: 20, projectedAreaMm2: 20_000, cruiseSpeed: 22, maxSpeed: 30, turnResponse: 1, pitchResponse: 1, stability: 1, glideRetention: 1, gustResponse: 1 },
        input: { turn: 0, pitch: 0 }, position: { x: 0, y: 4, z: 0 }, yaw: 0, pitch: 0, roll: 0, frameMs: 8, section: "1950s",
        pixelRatio: 2, renderWidth: 2880, renderHeight: 1800,
      }),
      dispose: () => { log.disposed += 1; },
    };
  };
  return {
    factory,
    log,
    emit(nextSnapshot: FlightSnapshot, event?: FlightEvent): void {
      snapshot = nextSnapshot;
      (options as HallwayFlightGameOptions | null)?.onSnapshot?.(snapshot);
      if (event) (options as HallwayFlightGameOptions | null)?.onEvent?.(event);
    },
  };
}

function renderFlight(factory: HallwayFlightGameFactory) {
  return render(<FlightScreen ui={strings} structure={structure} planeName={planeName} hangarHref="/en/" tutorialHref="/en/plane/dart/fold/" createGame={factory} />);
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  __resetProgressCache();
});

describe("hallway flight route", () => {
  it("does not create a game for an unearned direct visit", async () => {
    const game = fakeGame();
    seed(false);
    renderFlight(game.factory);
    expect(await screen.findByTestId("flight-locked")).toBeInTheDocument();
    expect(game.log.created).toBe(0);
    expect(screen.getByRole("link", { name: strings.startFolding })).toHaveAttribute("href", "/en/plane/dart/fold/");
  });

  it("creates one game only after earned progress hydrates and disposes it", async () => {
    const game = fakeGame();
    seed(true);
    const view = renderFlight(game.factory);
    await waitFor(() => expect(game.log.created).toBe(1));
    expect(screen.getByTestId("flight-canvas")).toBeInTheDocument();
    view.unmount();
    expect(game.log.disposed).toBe(1);
  });

  it("launches from the keyboard charge gesture", async () => {
    const game = fakeGame();
    seed(true);
    renderFlight(game.factory);
    await waitFor(() => expect(game.log.created).toBe(1));
    fireEvent.keyDown(window, { code: "Space" });
    fireEvent.keyUp(window, { code: "Space" });
    expect(game.log.launched).toBe(1);
  });

  it("records personal bests only when a run finishes", async () => {
    const game = fakeGame();
    seed(true);
    renderFlight(game.factory);
    await waitFor(() => expect(game.log.created).toBe(1));
    const crashed = { ...gameSnapshot(), phase: "crashed" as const, elapsedMs: 12_000, remainingMs: 78_000 };
    act(() => game.emit(crashed, { type: "collision", hazardId: "person", kind: "person" }));
    expect(readStored().flights?.dart).toBeUndefined();
    const result = { elapsedMs: 61_200, closePasses: 5, bestChain: 3 };
    act(() => game.emit({ ...gameSnapshot(), ...result, phase: "finished", remainingMs: 28_800 }, { type: "finish", result }));
    expect(readStored().flights?.dart).toMatchObject({ bestTimeMs: 61_200, bestClosePasses: 5, bestChain: 3 });
  });

  it("offers immediate restart after a harmless collision", async () => {
    const game = fakeGame();
    seed(true);
    renderFlight(game.factory);
    await waitFor(() => expect(game.log.created).toBe(1));
    act(() => game.emit({ ...gameSnapshot(), phase: "crashed" }, { type: "collision", hazardId: "student", kind: "person" }));
    fireEvent.click(screen.getByRole("button", { name: strings.restart }));
    expect(game.log.restarted).toBe(1);
  });

  it("shows the safe fallback when the renderer cannot start", async () => {
    seed(true);
    const factory = vi.fn(() => { throw new Error("webgl"); }) as unknown as HallwayFlightGameFactory;
    renderFlight(factory);
    expect(await screen.findByText(strings.unavailableTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: strings.returnToHangar })).toHaveAttribute("href", "/en/");
  });
});

function gameSnapshot(): FlightSnapshot {
  return { phase: "flying", elapsedMs: 0, remainingMs: 90_000, closePasses: 0, currentChain: 0, bestChain: 0, speed: 22, era: "1950s", progress: 0, muted: false, reducedMotion: false, tiltEnabled: false };
}
