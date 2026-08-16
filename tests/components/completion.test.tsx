/**
 * Wings earned, which now reports a completion instead of performing one.
 *
 * The behaviour being pinned is mostly a NEGATIVE: arriving at this URL must
 * not write anything. That used to be the whole mechanism - the route awarded
 * the wings - so anyone who typed the address collected a plane they had never
 * folded, and the hangar then stamped it. These are the tests that keep the
 * tutorial's Finish as the only writer.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { PLANES, getPlane } from "@/content";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { CompletionScreen } from "@/components/completion/CompletionScreen";
import { buildFleet, completionUiFromDictionary } from "@/components/completion/types";
import { finishedPlaneSvg } from "@/components/hangar/viewModel";
import { getAircraftPresentation } from "@/content/presentation";
import { __resetProgressCache, recordCompletion, recordStep } from "@/lib/progress";
import { readStored } from "@/lib/storage";
import type { PlaneId } from "@/content/types";

const strings = completionUiFromDictionary(ui);
const fleetIds = Object.keys(PLANES) as PlaneId[];
const firstId = fleetIds[0]!;
const structure = getPlane(firstId)!;
const planeStrings = planesDict.planes[structure.id]!;

const view = {
  id: structure.id,
  name: planeStrings.name,
  tier: structure.tier,
  stepCount: structure.steps.length,
  svg: finishedPlaneSvg(structure),
  presentation: getAircraftPresentation(structure.id),
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
  it("never awards a wing merely because the route was visited", () => {
    expect(readStored().completed[structure.id]).toBeUndefined();
    renderCompletion();
    expect(readStored().completed[structure.id]).toBeUndefined();
    expect(screen.getByTestId("wings-not-earned")).toBeInTheDocument();
  });

  it("explains the unearned state and offers the fold that would earn it", () => {
    renderCompletion();
    expect(screen.getByText(strings.notEarnedTitle)).toBeInTheDocument();
    expect(screen.getByTestId("wings-start")).toHaveAttribute(
      "href",
      `/en/plane/${view.id}/fold/`,
    );
    expect(screen.getByTestId("wings-start")).toHaveTextContent(strings.startFolding);
    // Nothing about the earned state may leak into it.
    expect(screen.queryByTestId("wings-stamp")).not.toBeInTheDocument();
  });

  it("offers to resume rather than restart when the fold is part-done", () => {
    recordStep(structure.id, 4);
    renderCompletion();
    expect(screen.getByTestId("wings-start")).toHaveTextContent("Resume at step 5");
  });

  it("shows the stamp, the real issue date and the real wing count once earned", () => {
    recordCompletion(structure.id);
    renderCompletion();

    const stamp = screen.getByTestId("wings-stamp");
    expect(stamp).toHaveTextContent(strings.stamp);
    expect(stamp.className).toContain("stamp-slam");
    expect(screen.queryByTestId("wings-not-earned")).not.toBeInTheDocument();

    // The date on the stamp is the one storage recorded, formatted - never a
    // placeholder and never today's date stood in for a missing one.
    const at = readStored().completed[structure.id]!.at;
    const expected = new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(at));
    expect(stamp).toHaveTextContent(expected);
    expect(screen.getByText(`${strings.tier[view.tier]} wings`)).toBeInTheDocument();
    expect(screen.getByText(String(view.stepCount).padStart(2, "0"))).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("keeps the date the wings were first issued when the screen is revisited", () => {
    recordCompletion(structure.id);
    const first = readStored().completed[structure.id]?.at;
    renderCompletion();
    cleanup();
    __resetProgressCache();
    renderCompletion();
    expect(readStored().completed[structure.id]?.at).toBe(first);
  });

  it("drops the resume position on Fold it again, and keeps the wing", () => {
    recordCompletion(structure.id);
    recordStep(structure.id, 7);
    renderCompletion();

    screen.getByTestId("wings-fold-again").click();

    expect(readStored().progress[structure.id]).toBeUndefined();
    expect(readStored().completed[structure.id]).toBeDefined();
  });

  it("points at the next unflown aircraft, with the hangar as the way out", () => {
    recordCompletion(structure.id);
    renderCompletion();

    const next = view.fleet.find((entry) => entry.id !== view.id)!;
    expect(screen.getByTestId("wings-next")).toHaveAttribute("href", next.href);
    expect(screen.getByTestId("wings-return")).toHaveAttribute("href", "/en/");
    // Two red primaries on one screen is one too many, so the way back stays
    // secondary while there is still an aircraft to offer.
    expect(screen.getByTestId("wings-return").className).not.toContain("bg-red-ink");
  });

  it("makes Return to hangar the primary action once the floor is clear", () => {
    for (const id of fleetIds) recordCompletion(id);
    renderCompletion();

    expect(screen.queryByTestId("wings-next")).not.toBeInTheDocument();
    expect(screen.getByText(strings.allComplete)).toBeInTheDocument();
    expect(screen.getByTestId("wings-return").className).toContain("bg-red-ink");
  });

  /*
   * The prerender, which is the state the gate exists for.
   *
   * A static export ships one HTML file per route, built with no storage at
   * all, so `renderToString` here is not a stand-in for the server - it IS what
   * `npm run build` writes into `out/`. Without the gate that file states
   * "you have not earned these wings" for every cadet on earth, and a cadet who
   * finished the plane a second ago reads it for as long as hydration takes.
   */
  it("commits to neither state in the prerendered HTML", () => {
    recordCompletion(structure.id);

    const html = renderToString(
      <CompletionScreen
        ui={strings}
        view={view}
        locale="en"
        hangarHref="/en/"
        tutorialHref={`/en/plane/${view.id}/fold/`}
      />,
    );

    expect(html).toContain("completion-pending");
    expect(html).not.toContain(strings.notEarnedTitle);
    expect(html).not.toContain("wings-stamp");
  });
});
