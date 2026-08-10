import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PLANES } from "@/content";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { Hangar } from "@/components/hangar/Hangar";
import { hangarUiFromDictionary } from "@/components/hangar/types";
import { buildHangarPlanes } from "@/components/hangar/viewModel";
import { __resetProgressCache } from "@/lib/progress";
import { createFakeEngineFactory } from "./fakeEngine";

const planes = buildHangarPlanes("en", PLANES, planesDict);
const strings = hangarUiFromDictionary(ui);

function seedCompleted(...ids: string[]): void {
  window.localStorage.setItem(
    "flightschool.v1",
    JSON.stringify({
      progress: {},
      completed: Object.fromEntries(ids.map((id) => [id, { at: "2026-08-09T10:00:00.000Z" }])),
    }),
  );
  __resetProgressCache();
}

function renderHangar() {
  const { factory, log } = createFakeEngineFactory();
  const utils = render(
    <Hangar ui={strings} planes={planes} locale="en" createEngine={factory} />,
  );
  return { ...utils, log };
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  __resetProgressCache();
});

describe("the Hangar", () => {
  it("renders a card per plane in the registry", () => {
    renderHangar();
    for (const plane of planes) {
      expect(screen.getByRole("link", { name: plane.name })).toBeInTheDocument();
    }
  });

  it("filters the fleet by licence without leaving the page", () => {
    const { container } = renderHangar();
    const dart = () => container.querySelector("[data-plane='dart']");

    expect(dart()).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: strings.tier.advanced }));
    expect(dart()).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: strings.tier.easy }));
    expect(dart()).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: strings.filterAll }));
    expect(dart()).not.toBeNull();
  });

  it("marks the active filter for assistive technology", () => {
    renderHangar();
    const ace = screen.getByRole("button", { name: strings.tier.advanced });
    expect(ace).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(ace);
    expect(ace).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: strings.filterAll })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("says so when a licence has no aircraft", () => {
    renderHangar();
    fireEvent.click(screen.getByRole("button", { name: strings.tier.advanced }));
    if (planes.some((p) => p.tier === "advanced")) return;
    expect(screen.getByText(strings.empty)).toBeInTheDocument();
  });

  it("stamps only the planes whose wings have been earned", () => {
    renderHangar();
    expect(screen.queryAllByTestId("wings-stamp")).toHaveLength(0);

    cleanup();
    seedCompleted("dart");
    const { container } = renderHangar();

    expect(container.querySelectorAll("[data-testid='wings-stamp']")).toHaveLength(1);
    expect(
      container.querySelector("[data-plane='dart'] [data-testid='wings-stamp']"),
    ).not.toBeNull();
  });

  it("counts earned wings in the nav", () => {
    seedCompleted("dart");
    renderHangar();
    expect(screen.getByTestId("wings-counter")).toHaveTextContent("Wings: 1");
  });

  it("wakes a live scene on selection and sleeps it again", () => {
    const { container, log } = renderHangar();
    const preview = screen.getByRole("button", { name: `Preview ${planes[0]!.name} in 3D` });

    expect(container.querySelectorAll("[data-testid='live-scene']")).toHaveLength(0);

    fireEvent.click(preview);
    expect(preview).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll("[data-testid='live-scene']")).toHaveLength(1);
    expect(log.created).toHaveLength(1);
    // The catalog shows the finished aircraft, not the folding of it.
    expect(log.steps).toEqual([planes[0]!.stepCount - 1]);

    fireEvent.click(preview);
    expect(preview).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelectorAll("[data-testid='live-scene']")).toHaveLength(0);
    expect(log.disposed).toBe(1);
  });

  /**
   * A card is a decorative 3:2 thumbnail of a floating aircraft, and six of
   * them share one phone. None of these is visible in anything the card
   * renders, so nothing else would catch their removal until the hangar was
   * either slow on a real device or showing planes on their sides.
   */
  it("wakes cards as cheap display surfaces, not as tutorial stages", () => {
    const { log } = renderHangar();
    fireEvent.click(screen.getByRole("button", { name: `Preview ${planes[0]!.name} in 3D` }));

    const opts = log.created[0]?.opts;
    expect(opts?.quality).toBe("preview");
    // Display mode carries the hero angle itself. It is deliberately not a
    // `cameraPreset`: presets are authored into fold steps, and no step may ask
    // for the angle a finished aircraft is photographed from.
    expect(opts?.display).toBe(true);
    expect(opts?.cameraPreset).toBeUndefined();
    // Stands the plane up rather than leaving it on its side, half under the
    // table, in the frame its creases were authored in.
    expect(opts?.rest).toBe(true);
    // No constant spin: it holds the hero angle for about a second and then
    // parks every card at the same non-hero angle in lockstep. The float in the
    // engine is the motion now.
    expect(opts?.autoRotate).toBeUndefined();
  });

  it("keeps the idle float in the engine, not in CSS", () => {
    // A CSS animation on the mount translates the CANVAS, which would drag the
    // backdrop and the contact shadow up and down with the plane - contradicting
    // exactly what the shadow is there to say.
    const { container } = renderHangar();
    fireEvent.click(screen.getByRole("button", { name: `Preview ${planes[0]!.name} in 3D` }));
    const scene = container.querySelector("[data-testid='live-scene']");
    expect(scene).not.toBeNull();
    expect(scene?.className).not.toContain("plane-bob");
  });

  it("never keeps more than two scenes live at once", () => {
    if (planes.length < 3) return;
    const { container } = renderHangar();
    for (const plane of planes.slice(0, 3)) {
      fireEvent.click(screen.getByRole("button", { name: `Preview ${plane.name} in 3D` }));
    }
    expect(
      container.querySelectorAll("[data-testid='live-scene']").length,
    ).toBeLessThanOrEqual(2);
  });
});
