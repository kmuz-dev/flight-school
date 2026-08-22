/**
 * The tutorial screen's contract with stored progress.
 *
 * Both behaviours here were broken at integration and are cheap to break again:
 * the screen used to persist step 0 on mount, over the very position it was
 * meant to resume to, and it wrote through `writeStored` so the hangar's cached
 * snapshot never learned about it.
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TutorialScreen } from "@/components/tutorial/TutorialScreen";
import type { FoldEngineFactory } from "@/engine";
import { buildTutorialSteps } from "@/components/tutorial/viewModel";
import { tutorialUiFromDictionary } from "@/components/tutorial/uiStrings";
import { __resetProgressCache, planeProgress, recordStep } from "@/lib/progress";
import { readStored } from "@/lib/storage";
import { dart } from "@/content/planes/dart";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { formatTime } from "@/components/tutorial/types";
import { createFakeEngineFactory } from "./fakeEngine";
import { stubIntersectionObserver } from "./intersection";

const strings = planesDict.planes.dart!;
const tutorialUi = tutorialUiFromDictionary(ui);
const steps = buildTutorialSteps(dart, strings, planesDict.glossary);

function renderScreen(renderMode: "webgl" | "svg" = "webgl", durations: readonly number[] = []) {
  const { factory, log } = createFakeEngineFactory(renderMode, true, durations);
  const utils = render(
    <TutorialScreen
      ui={tutorialUi}
      structure={dart}
      steps={steps}
      planeName={strings.name}
      paperFormat="a4"
      hangarHref="/en/"
      createEngine={factory}
    />,
  );
  return { ...utils, log };
}

beforeEach(() => {
  window.localStorage.clear();
  __resetProgressCache();
});

afterEach(() => {
  // Unmounting is handled centrally in tests/setup.components.ts.
  window.localStorage.clear();
  __resetProgressCache();
});

describe("resuming a tutorial", () => {
  it("opens at the stored step rather than the first fold", async () => {
    recordStep("dart", 6);
    renderScreen();
    await waitFor(() => {
      expect(screen.getAllByText(/07 \/ 12/).length).toBeGreaterThan(0);
    });
  });

  it("does not overwrite the stored step while resuming to it", async () => {
    recordStep("dart", 6);
    renderScreen();
    await waitFor(() => expect(screen.getAllByText(/07 \/ 12/).length).toBeGreaterThan(0));
    expect(readStored().progress.dart?.step).toBe(6);
  });

  it("starts at the first fold when nothing is stored", async () => {
    renderScreen();
    await waitFor(() => expect(screen.getAllByText(/01 \/ 12/).length).toBeGreaterThan(0));
  });

  it("ignores a stored step beyond the end of the sequence", async () => {
    recordStep("dart", 99);
    renderScreen();
    await waitFor(() => expect(screen.getAllByText(/12 \/ 12/).length).toBeGreaterThan(0));
  });
});

describe("recording progress", () => {
  it("publishes each step through the store, so the hangar sees it", async () => {
    renderScreen();
    await waitFor(() => expect(readStored().progress.dart?.step).toBe(0));

    const next = screen.getByRole("button", { name: tutorialUi.nextFold });
    await act(async () => {
      next.click();
    });

    // Read through the store's cache, not around it: writing via writeStored
    // left this stale and the hangar stamp lagged a whole navigation behind.
    await waitFor(() => {
      expect(planeProgress(readStored(), "dart").resumeStep).toBe(1);
    });
  });
});

describe("guided playback", () => {
  it("opens fold one paused, then auto-plays only after deliberate Next", async () => {
    const { log } = renderScreen();
    await waitFor(() => expect(log.paused).toBeGreaterThan(0));
    expect(screen.getByTestId("stage-status")).toHaveTextContent(tutorialUi.pausedFold);

    fireEvent.click(screen.getByRole("button", { name: tutorialUi.nextFold }));
    await waitFor(() =>
      expect(screen.getByTestId("stage-status")).toHaveTextContent(tutorialUi.playingFold),
    );
    expect(log.steps.at(-1)).toBe(1);
    expect(log.stepAnimations.at(-1)).toBe(true);
  });

  it("preserves deliberate Next autoplay while the renderer chunk is still loading", async () => {
    const { factory, log } = createFakeEngineFactory();
    let release: ((factory: FoldEngineFactory) => void) | null = null;
    const pendingFactory = new Promise<FoldEngineFactory>((resolve) => {
      release = resolve;
    });
    render(
      <TutorialScreen
        ui={tutorialUi}
        structure={dart}
        steps={steps}
        planeName={strings.name}
        paperFormat="a4"
        hangarHref="/en/"
        loadEngine={() => pendingFactory}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: tutorialUi.nextFold }));
    expect(screen.getByRole("combobox", { name: tutorialUi.stepSelectLabel })).toHaveValue("1");
    await act(async () => release?.(factory));

    await waitFor(() => expect(log.steps.at(-1)).toBe(1));
    expect(screen.getByTestId("stage-status")).toHaveTextContent(tutorialUi.playingFold);
  });

  it("withholds playback from a hidden stage until its paper material is ready", async () => {
    const { factory, log } = createFakeEngineFactory("webgl", false);
    render(
      <TutorialScreen
        ui={tutorialUi}
        structure={dart}
        steps={steps}
        planeName={strings.name}
        paperFormat="a4"
        hangarHref="/en/"
        createEngine={factory}
      />,
    );

    expect(screen.getByRole("button", { name: tutorialUi.play })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: tutorialUi.nextFold }));
    expect(log.steps).toEqual([]);

    act(() => log.ready());
    await waitFor(() => expect(log.steps.at(-1)).toBe(1));
    expect(log.stepAnimations.at(-1)).toBe(true);
  });

  it("replaces a live renderer failure with the canonical static tutorial", async () => {
    const { log } = renderScreen();
    await waitFor(() => expect(log.steps.length).toBeGreaterThan(0));

    act(() => log.emit("rendererFailed"));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(tutorialUi.staticFallback));
    expect(screen.getByTestId("engine-mount").querySelector("svg")).not.toBeNull();
    expect(screen.getByRole("button", { name: tutorialUi.play })).toBeDisabled();
  });

  it("opens Back and directly selected folds paused", async () => {
    const { log } = renderScreen();
    await waitFor(() => expect(log.steps.length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: tutorialUi.nextFold }));
    fireEvent.click(screen.getByRole("button", { name: tutorialUi.back }));
    await waitFor(() =>
      expect(screen.getByTestId("stage-status")).toHaveTextContent(tutorialUi.pausedFold),
    );

    fireEvent.change(screen.getByRole("combobox", { name: tutorialUi.stepSelectLabel }), {
      target: { value: "4" },
    });
    await waitFor(() => expect(log.steps.at(-1)).toBe(4));
    expect(screen.getByTestId("stage-status")).toHaveTextContent(tutorialUi.pausedFold);
  });

  it("keeps playback controls separate from step navigation", async () => {
    const { log } = renderScreen();
    await waitFor(() => expect(log.steps.length).toBeGreaterThan(0));
    const transport = screen.getByRole("region", { name: tutorialUi.transportLabel });
    expect(transport).not.toHaveTextContent(tutorialUi.nextFold);
    expect(screen.queryByText("My paper looks like this")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: tutorialUi.replay }));
    expect(log.replayed).toBe(1);
  });

  it("visibly identifies static fallback and disables controls that cannot animate", async () => {
    const { log } = renderScreen("svg");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(tutorialUi.staticFallback));

    expect(screen.getByRole("button", { name: tutorialUi.play })).toBeDisabled();
    expect(screen.getByRole("slider", { name: tutorialUi.scrubLabel })).toBeDisabled();
    expect(screen.getByRole("button", { name: tutorialUi.replay })).toBeDisabled();
    expect(screen.getByTestId("stage-status")).not.toHaveTextContent(tutorialUi.playingFold);
    expect(screen.queryByRole("group", { name: tutorialUi.cameraGroupLabel })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: tutorialUi.nextFold }));
    await waitFor(() => expect(log.steps.at(-1)).toBe(1));
    expect(screen.getByRole("combobox", { name: tutorialUi.stepSelectLabel })).toHaveValue("1");
    expect(screen.getByRole("status")).toHaveTextContent(tutorialUi.staticFallback);
  });

  it("shows the explanation inline, keeps Fold terms native, and announces steps", async () => {
    renderScreen();
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: tutorialUi.stepSelectLabel })).toBeVisible(),
    );
    expect(screen.getAllByRole("link", { name: tutorialUi.backToHangar })).toHaveLength(1);
    expect(screen.getByText(strings.explanations?.["dart.step-01"] ?? "missing explanation")).toBeVisible();
    expect(screen.getByText(tutorialUi.foldTerms).closest("details")).not.toBeNull();
    expect(document.querySelectorAll("details")).toHaveLength(1);
    expect(screen.queryByText("Why", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 12:/)).toHaveAttribute("aria-live", "polite");
  });

  it("suspends drawing while the document is hidden without pausing playback", async () => {
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    const { log } = renderScreen();
    await waitFor(() => expect(log.renderActive).toContain(false));
    await waitFor(() => expect(log.paused).toBeGreaterThan(0));
    const pausesBeforeVisibility = log.paused;

    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    await waitFor(() => expect(log.renderActive.at(-1)).toBe(true));
    expect(log.paused).toBe(pausesBeforeVisibility);
    hidden.mockRestore();
  });

  it("suspends and resumes drawing from IntersectionObserver without pausing playback", async () => {
    const observer = stubIntersectionObserver(
      (target) => target.getAttribute("aria-label") === tutorialUi.stageLabel,
    );

    const { log } = renderScreen();
    await waitFor(() => expect(log.paused).toBeGreaterThan(0));
    const pausesBeforeIntersection = log.paused;
    expect(observer.observing()).toBe(true);

    act(() => observer.notify(false));
    await waitFor(() => expect(log.renderActive.at(-1)).toBe(false));
    expect(log.paused).toBe(pausesBeforeIntersection);

    act(() => observer.notify(true));
    await waitFor(() => expect(log.renderActive.at(-1)).toBe(true));
    expect(log.paused).toBe(pausesBeforeIntersection);
    observer.restore();
  });
});

describe("the transport readout", () => {
  /**
   * The engine builds a fresh timeline per step and its length scales with how
   * far the paper travels, so the readout has to be re-read on every step. It
   * used to be read once, from the handle, the first time an engine existed:
   * the whole tutorial then quoted fold one's length, and the elapsed figure
   * beside it - elapsed = total x progress - was wrong by the same ratio.
   */
  it("quotes the current fold's length, not the first one's", async () => {
    renderScreen("webgl", [1.1, 4.2]);
    const transport = () => screen.getByRole("region", { name: tutorialUi.transportLabel });
    await waitFor(() => expect(transport()).toHaveTextContent("0:01.1"));

    fireEvent.click(screen.getByRole("button", { name: tutorialUi.nextFold }));
    await waitFor(() => expect(transport()).toHaveTextContent("0:04.2"));
  });

  /**
   * Every fold in the product runs between 0.8s and 1.5s, so a whole-second
   * clock has two states and spends most of each fold in the first of them.
   */
  it("resolves a sub-second fold to tenths rather than to 0:00", () => {
    expect(formatTime(0.8)).toBe("0:00.8");
    expect(formatTime(1.5)).toBe("0:01.5");
    // Truncated, so a playhead short of the end never reads as the end.
    expect(formatTime(0.99)).toBe("0:00.9");
    expect(formatTime(0)).toBe("0:00.0");
    expect(formatTime(Number.NaN)).toBe("0:00.0");
    expect(formatTime(-3)).toBe("0:00.0");
    expect(formatTime(61.4)).toBe("1:01.4");
  });
});

describe("tutorial tips", () => {
  it("shows only explicit step-specific tips, never the plane default on every fold", () => {
    const explicitTipIds = new Set(Object.keys(strings.tips).filter((key) => key !== "default"));
    for (const tutorialStep of steps) {
      expect(tutorialStep.tip !== undefined, tutorialStep.id).toBe(explicitTipIds.has(tutorialStep.id));
    }
  });

  it("removes the footer when a selected fold has no explicit tip", async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText(strings.tips["dart.step-01"]!)).toBeVisible());
    fireEvent.change(screen.getByRole("combobox", { name: tutorialUi.stepSelectLabel }), {
      target: { value: "1" },
    });
    await waitFor(() => expect(screen.queryByText(strings.tips.default!)).not.toBeInTheDocument());
    expect(screen.queryByText(strings.tips["dart.step-01"]!)).not.toBeInTheDocument();
  });
});
