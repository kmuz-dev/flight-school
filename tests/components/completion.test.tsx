import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PLANES, getPlane } from "@/content";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { CompletionScreen } from "@/components/completion/CompletionScreen";
import { buildFleet, completionUiFromDictionary } from "@/components/completion/types";
import { finishedPlaneSvg } from "@/components/hangar/viewModel";
import { __resetProgressCache } from "@/lib/progress";
import { readStored } from "@/lib/storage";

const strings = completionUiFromDictionary(ui);
const firstId = Object.keys(PLANES)[0]!;
const structure = getPlane(firstId)!;
const planeStrings = planesDict.planes[structure.id]!;

const view = {
  id: structure.id,
  name: planeStrings.name,
  tier: structure.tier,
  stepCount: structure.steps.length,
  svg: finishedPlaneSvg(structure),
  fleet: buildFleet(PLANES, planesDict, (id) => `/en/plane/${id}/`),
};

function renderCompletion() {
  return render(
    <CompletionScreen
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

describe("Wings earned", () => {
  it("files the completion on arrival, which is what stamps the hangar card", () => {
    expect(readStored().completed[structure.id]).toBeUndefined();
    renderCompletion();
    expect(readStored().completed[structure.id]).toBeDefined();
  });

  it("keeps the date the wings were first issued when the screen is revisited", () => {
    renderCompletion();
    const first = readStored().completed[structure.id]?.at;
    cleanup();
    __resetProgressCache();
    renderCompletion();
    expect(readStored().completed[structure.id]?.at).toBe(first);
  });

  it("slams the certified stamp in", () => {
    renderCompletion();
    const stamp = screen.getByTestId("certified-stamp");
    expect(stamp).toHaveTextContent(strings.certified);
    expect(stamp.className).toContain("stamp-slam");
  });

  it("issues wings named for the plane's licence tier", () => {
    renderCompletion();
    expect(screen.getByText(`${strings.tier[view.tier]} wings`)).toBeInTheDocument();
  });

  it("counts the fold total from the sequence, not from a stored guess", () => {
    renderCompletion();
    expect(screen.getByText(String(view.stepCount).padStart(2, "0"))).toBeInTheDocument();
  });

  it("offers a way back to the hangar and a way to fold it again", () => {
    renderCompletion();
    expect(screen.getByRole("link", { name: strings.returnToHangar })).toHaveAttribute(
      "href",
      "/en/",
    );
    expect(screen.getByRole("link", { name: strings.foldAgain })).toHaveAttribute(
      "href",
      `/en/plane/${view.id}/fold/`,
    );
  });

  it("points at the next unflown aircraft, or says the floor is clear", () => {
    renderCompletion();
    const next = view.fleet.find((entry) => entry.id !== view.id);
    if (next) {
      expect(screen.getByRole("link", { name: strings.foldNextPlane })).toHaveAttribute(
        "href",
        next.href,
      );
    } else {
      expect(screen.getByText(strings.allComplete)).toBeInTheDocument();
    }
  });
});
