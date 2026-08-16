import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PLANES, getPlane } from "@/content";
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
const view = buildPreflightView(structure, planesDict, finishedPlaneSvg(structure))!;

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

function renderPreflight(renderMode: "webgl" | "svg" = "webgl") {
  const { factory, log } = createFakeEngineFactory(renderMode);
  const utils = render(
    <PreflightScreen
      ui={strings}
      view={view}
      locale="en"
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

  it("shows production artwork without requesting the renderer", () => {
    const { log } = renderPreflight();
    expect(screen.getByRole("img", { name: `Finished paper aircraft: ${view.name}` })).toBeInTheDocument();
    expect(log.created).toHaveLength(0);
    expect(log.steps).toHaveLength(0);
  });

  /**
   * The hero is a photograph of an aircraft, not a paused fold. None of this
   * is visible in the DOM, so nothing else would catch its removal until the
   * hero was showing a plane on its side, half under the ground.
   */
  it("dresses the hero as a display stage rather than a tutorial one", () => {
    const { log } = renderPreflight();
    fireEvent.click(screen.getByRole("button", { name: `Inspect ${view.name} in 3D` }));
    const opts = log.created[0]?.opts;
    // Floorless, backdropped, shadowed, lifted and breathing.
    expect(opts?.display).toBe(true);
    expect(opts?.displayView).toEqual(view.presentation.displayView);
    // Standing up, rather than lying in the frame its creases were authored in.
    expect(opts?.rest).toBe(true);
    // The hero angle rides on `display`. A preset here would be a fold step's
    // opinion about how a finished aircraft is photographed.
    expect(opts?.cameraPreset).toBeUndefined();
    // No constant spin: it holds the hero angle for about a second and then
    // parks at some other angle. The float in the engine is the motion now.
    expect(opts?.autoRotate).toBeUndefined();
    // Full tier, unlike a hangar card: this is the largest render on the site.
    expect(opts?.quality).toBeUndefined();
    expect(log.steps).toEqual([view.stepCount - 1]);
  });

  it("keeps beauty artwork visible when 3D falls back and offers a retry", async () => {
    const { log } = renderPreflight("svg");
    const artwork = screen.getByTestId("preflight-artwork");
    const image = screen.getByRole("img", { name: `Finished paper aircraft: ${view.name}` });

    fireEvent.click(screen.getByRole("button", { name: `Inspect ${view.name} in 3D` }));
    await waitFor(() => expect(screen.getByText(strings.unavailable3d)).toBeInTheDocument());
    expect(artwork).toHaveClass("opacity-100");
    expect(screen.getByTestId("preflight-stage")).toHaveClass("opacity-0");
    expect(image).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: strings.retry3d }));
    await waitFor(() => expect(log.created).toHaveLength(2));
  });

  it("uses the canonical SVG only after the beauty artwork also fails", async () => {
    renderPreflight("svg");
    const artwork = screen.getByTestId("preflight-artwork");
    const image = screen.getByRole("img", { name: `Finished paper aircraft: ${view.name}` });
    fireEvent.click(screen.getByRole("button", { name: `Inspect ${view.name} in 3D` }));
    await waitFor(() => expect(screen.getByText(strings.unavailable3d)).toBeInTheDocument());
    fireEvent.error(image);
    expect(artwork).toHaveClass("opacity-100");
    expect(artwork.innerHTML).toContain("<svg");
    expect(screen.getByTestId("preflight-stage")).toHaveClass("opacity-0");
  });

  it("resets an inspected aircraft to its authored view", async () => {
    const { log } = renderPreflight();
    fireEvent.click(screen.getByRole("button", { name: `Inspect ${view.name} in 3D` }));
    const reset = await screen.findByRole("button", { name: strings.resetView });
    fireEvent.click(reset);
    expect(log.reset).toBe(1);
  });

  it("derives the spec table from the fold sequence", () => {
    renderPreflight();
    expect(screen.getByText(`${view.stepCount} folds`)).toBeInTheDocument();
    const selected = screen.getAllByRole("radio").find((radio) => (radio as HTMLInputElement).checked);
    const paperSummary = screen.getByText(strings.paper).closest("div")?.querySelector("dd");
    expect(paperSummary).toHaveTextContent(
      strings.paperPicker.label[(selected as HTMLInputElement).value as keyof typeof strings.paperPicker.label],
    );
  });

  it("does not render manifest or prototype fiction", () => {
    renderPreflight();
    expect(screen.queryByText(/aircraft \d+ of \d+ on the hangar floor/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/prototype/i)).not.toBeInTheDocument();
  });

  it("gives every rating a spoken value", () => {
    renderPreflight();
    expect(screen.getByRole("heading", { name: "Estimated flight profile" })).toBeInTheDocument();
    for (const key of ["speed", "distance", "airtime", "ease"] as const) {
      expect(
        screen.getByLabelText(`${strings.rating[key]}: ${view.ratings[key]} out of 5`),
      ).toBeInTheDocument();
    }
  });

  it("uses native paper radios and explains when a change resets progress", () => {
    seedProgress(view.id, 4);
    renderPreflight();
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBeGreaterThan(1);
    expect(screen.getAllByText(strings.paperPicker.resetsProgress).length).toBeGreaterThan(0);

    const alternative = radios.find((radio) => !(radio as HTMLInputElement).checked);
    expect(alternative).toBeDefined();
    fireEvent.click(alternative!);
    expect(alternative).toBeChecked();
    expect(screen.getByTestId("preflight-primary")).toHaveTextContent(strings.startFolding);
    const paperSummary = screen.getByText(strings.paper).closest("div")?.querySelector("dd");
    expect(paperSummary).toHaveTextContent(
      strings.paperPicker.label[(alternative as HTMLInputElement).value as keyof typeof strings.paperPicker.label],
    );
  });
});
