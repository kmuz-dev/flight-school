/**
 * The tutorial screen's contract with stored progress.
 *
 * Both behaviours here were broken at integration and are cheap to break again:
 * the screen used to persist step 0 on mount, over the very position it was
 * meant to resume to, and it wrote through `writeStored` so the hangar's cached
 * snapshot never learned about it.
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TutorialScreen } from "@/components/tutorial/TutorialScreen";
import { buildTutorialSteps } from "@/components/tutorial/viewModel";
import { tutorialUiFromDictionary } from "@/components/tutorial/uiStrings";
import { __resetProgressCache, planeProgress, recordStep } from "@/lib/progress";
import { readStored } from "@/lib/storage";
import { dart } from "@/content/planes/dart";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { createFakeEngineFactory } from "./fakeEngine";

const strings = planesDict.planes.dart!;
const tutorialUi = tutorialUiFromDictionary(ui);
const steps = buildTutorialSteps(dart, strings, planesDict.glossary);

function renderScreen() {
  const { factory, log } = createFakeEngineFactory();
  const utils = render(
    <TutorialScreen
      ui={tutorialUi}
      structure={dart}
      steps={steps}
      planeName={strings.name}
      tier={dart.tier}
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
      expect(screen.getAllByText("07 / 12").length).toBeGreaterThan(0);
    });
  });

  it("does not overwrite the stored step while resuming to it", async () => {
    recordStep("dart", 6);
    renderScreen();
    await waitFor(() => expect(screen.getAllByText("07 / 12").length).toBeGreaterThan(0));
    expect(readStored().progress.dart?.step).toBe(6);
  });

  it("starts at the first fold when nothing is stored", async () => {
    renderScreen();
    await waitFor(() => expect(screen.getAllByText("01 / 12").length).toBeGreaterThan(0));
  });

  it("ignores a stored step beyond the end of the sequence", async () => {
    recordStep("dart", 99);
    renderScreen();
    await waitFor(() => expect(screen.getAllByText("12 / 12").length).toBeGreaterThan(0));
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
