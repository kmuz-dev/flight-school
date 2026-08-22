import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PLANES, getPlane } from "@/content";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { PreflightScreen } from "@/components/preflight/PreflightScreen";
import { buildPreflightView, preflightUiFromDictionary } from "@/components/preflight/types";
import { finishedPlaneSvg } from "@/components/hangar/viewModel";
import { __resetProgressCache } from "@/lib/progress";

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

function renderPreflight() {
  return render(
    <PreflightScreen
      ui={strings}
      view={view}
      locale="en"
      hangarHref="/en/"
      tutorialHref={`/en/plane/${view.id}/fold/`}
    />,
  );
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

  it("shows the finished aircraft as artwork, with nothing to operate", () => {
    renderPreflight();
    expect(
      screen.getByRole("img", { name: `Finished paper aircraft: ${view.name}` }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("preflight-artwork")).toBeInTheDocument();
    // Preflight is a decision screen. The only control on it is the paper
    // picker and the primary; an inspection toggle on the hero used to offer a
    // second thing to do at the moment the screen exists to make one choice.
    expect(screen.queryByRole("button", { name: /3D/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("preflight-stage")).not.toBeInTheDocument();
  });

  it("falls back to the canonical SVG when the artwork will not load", () => {
    renderPreflight();
    const artwork = screen.getByTestId("preflight-artwork");
    fireEvent.error(screen.getByRole("img", { name: `Finished paper aircraft: ${view.name}` }));
    expect(artwork.innerHTML).toContain("<svg");
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
