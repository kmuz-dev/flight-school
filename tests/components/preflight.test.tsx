import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PLANES, PLANE_IDS, getPlane } from "@/content";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { PreflightScreen } from "@/components/preflight/PreflightScreen";
import { buildPreflightView, preflightUiFromDictionary } from "@/components/preflight/types";
import { finishedPlaneSvg } from "@/components/hangar/viewModel";
import { __resetProgressCache } from "@/lib/progress";
import { createFakeEngineFactory } from "./fakeEngine";

const strings = preflightUiFromDictionary(ui);
const firstId = Object.keys(PLANES)[0]!;
const structure = getPlane(firstId)!;
const view = buildPreflightView(structure, planesDict, PLANE_IDS, finishedPlaneSvg(structure))!;

function seedProgress(planeId: string, step: number): void {
  window.localStorage.setItem(
    "flightschool.v1",
    JSON.stringify({
      progress: { [planeId]: { step, updatedAt: "2026-08-09T10:00:00.000Z" } },
      completed: {},
    }),
  );
  __resetProgressCache();
}

function renderPreflight() {
  const { factory, log } = createFakeEngineFactory();
  const utils = render(
    <PreflightScreen
      ui={strings}
      view={view}
      hangarHref="/en/"
      tutorialHref={`/en/plane/${view.id}/fold/`}
      createEngine={factory}
    />,
  );
  return { ...utils, log };
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  __resetProgressCache();
});

describe("Preflight", () => {
  it("offers Start folding when the cadet has never opened the tutorial", () => {
    renderPreflight();
    expect(screen.getByTestId("preflight-primary")).toHaveTextContent(strings.startFolding);
  });

  it("offers a resume, in 1-based step numbers, once there is progress", () => {
    seedProgress(view.id, 4);
    renderPreflight();
    expect(screen.getByTestId("preflight-primary")).toHaveTextContent("Resume at step 5");
  });

  it("treats step zero as no progress at all", () => {
    seedProgress(view.id, 0);
    renderPreflight();
    expect(screen.getByTestId("preflight-primary")).toHaveTextContent(strings.startFolding);
  });

  it("sends the cadet to the fold route", () => {
    renderPreflight();
    expect(screen.getByTestId("preflight-primary")).toHaveAttribute(
      "href",
      `/en/plane/${view.id}/fold/`,
    );
  });

  it("shows the finished plane, not the flat sheet", () => {
    const { log } = renderPreflight();
    expect(log.steps).toEqual([view.stepCount - 1]);
  });

  it("derives the spec table from the fold sequence", () => {
    renderPreflight();
    expect(screen.getByText(`${view.stepCount} folds`)).toBeInTheDocument();
    expect(screen.getByText(strings.paperValue[view.paperFormat])).toBeInTheDocument();
  });

  it("states a truthful manifest line instead of the mockup's invented count", () => {
    renderPreflight();
    expect(
      screen.getByText(`Aircraft ${view.index} of ${view.total} on the hangar floor`),
    ).toBeInTheDocument();
  });

  it("gives every rating a spoken value", () => {
    renderPreflight();
    for (const key of ["speed", "distance", "airtime", "ease"] as const) {
      expect(
        screen.getByLabelText(`${strings.rating[key]}: ${view.ratings[key]} out of 5`),
      ).toBeInTheDocument();
    }
  });
});
