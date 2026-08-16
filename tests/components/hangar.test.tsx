/**
 * The Hangar bay: one aircraft, four ways to change it, and one renderer at
 * most.
 *
 * The two properties worth the most here are both negative, because both are
 * invisible when they hold and expensive when they break: the renderer must not
 * be requested by arriving, hovering or focusing, and there must never be a
 * second live scene. A grid of six cards could afford to be sloppy about the
 * first and capped at two for the second; a carousel that flies aircraft in and
 * out cannot.
 */
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PLANES } from "@/content";
import planesDict from "@/i18n/planes/en";
import ui from "@/i18n/ui/en";
import { Hangar } from "@/components/hangar/Hangar";
import { firstUnfinishedIndex, hangarUiFromDictionary } from "@/components/hangar/types";
import { buildHangarPlanes } from "@/components/hangar/viewModel";
import { __resetProgressCache } from "@/lib/progress";
import { createFakeEngineFactory } from "./fakeEngine";

const planes = buildHangarPlanes("en", PLANES, planesDict);
const strings = hangarUiFromDictionary(ui);

function seed(stored: { progress?: object; completed?: string[] }): void {
  window.localStorage.setItem(
    "flightschool.v1",
    JSON.stringify({
      progress: stored.progress ?? {},
      completed: Object.fromEntries(
        (stored.completed ?? []).map((id) => [id, { at: "2026-08-09T10:00:00.000Z" }]),
      ),
    }),
  );
  __resetProgressCache();
}

function renderHangar(renderMode: "webgl" | "svg" = "webgl", locale: "en" | "ar" = "en") {
  const { factory, log } = createFakeEngineFactory(renderMode);
  const utils = render(
    <Hangar ui={strings} planes={planes} locale={locale} createEngine={factory} />,
  );
  return { ...utils, log };
}

const title = (): string => screen.getByRole("heading", { level: 1 }).textContent ?? "";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  __resetProgressCache();
});

describe("the Hangar bay", () => {
  it("shows one aircraft, named, with its own tier and fold count", () => {
    renderHangar();
    expect(title()).toBe(planes[0]!.name);
    expect(screen.getByText(strings.tier[planes[0]!.tier])).toBeInTheDocument();
    expect(screen.getByText(`${planes[0]!.stepCount} folds`)).toBeInTheDocument();
  });

  it("puts one marker in the strip per aircraft in the registry", () => {
    const { container } = renderHangar();
    expect(container.querySelectorAll(".hangar-dot")).toHaveLength(planes.length);
    for (const plane of planes) {
      expect(container.querySelector(`.hangar-dot[data-plane='${plane.id}']`)).not.toBeNull();
    }
  });

  it("sends its primary action to the selected aircraft's Preflight", () => {
    renderHangar();
    expect(screen.getByTestId("hangar-primary")).toHaveAttribute("href", planes[0]!.href);

    fireEvent.click(screen.getByTestId("hangar-next"));
    expect(screen.getByTestId("hangar-primary")).toHaveAttribute("href", planes[1]!.href);
  });

  it("offers to resume rather than restart when a fold is part-done", () => {
    seed({ progress: { [planes[0]!.id]: { step: 5, updatedAt: "2026-08-09T10:00:00.000Z" } } });
    renderHangar();
    expect(screen.getByTestId("hangar-primary")).toHaveTextContent("Resume at step 6");
  });

  // --- selection -----------------------------------------------------------

  it("changes aircraft from the arrows, the dots and the keyboard alike", () => {
    const { container } = renderHangar();

    fireEvent.click(screen.getByTestId("hangar-next"));
    expect(title()).toBe(planes[1]!.name);

    fireEvent.click(screen.getByTestId("hangar-prev"));
    expect(title()).toBe(planes[0]!.name);

    fireEvent.click(container.querySelector(`.hangar-dot[data-plane='${planes[3]!.id}']`)!);
    expect(title()).toBe(planes[3]!.name);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(title()).toBe(planes[4]!.name);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(title()).toBe(planes[3]!.name);
  });

  it("wraps at both ends, so the fleet is a ring rather than a queue", () => {
    renderHangar();
    fireEvent.click(screen.getByTestId("hangar-prev"));
    expect(title()).toBe(planes.at(-1)!.name);
    fireEvent.click(screen.getByTestId("hangar-next"));
    expect(title()).toBe(planes[0]!.name);
  });

  it("follows the reading direction, so Left is the next aircraft in Arabic", () => {
    renderHangar("webgl", "ar");
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(title()).toBe(planes[1]!.name);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(title()).toBe(planes[0]!.name);
  });

  it("leaves the arrow keys alone inside a text field", () => {
    renderHangar();
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(title()).toBe(planes[0]!.name);
    input.remove();
  });

  it("changes aircraft on a long horizontal swipe", () => {
    renderHangar();
    const bay = screen.getByTestId("hangar-bay");

    fireEvent.pointerDown(bay, { clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(bay, { clientX: 150, pointerId: 1 });
    fireEvent.pointerUp(bay, { clientX: 150, pointerId: 1 });
    expect(title()).toBe(planes[1]!.name);

    // Backwards, and the other way round in Arabic, where the fleet reads
    // right to left and a leftward flick means "the one before".
    fireEvent.pointerDown(bay, { clientX: 150, pointerId: 2 });
    fireEvent.pointerMove(bay, { clientX: 300, pointerId: 2 });
    fireEvent.pointerUp(bay, { clientX: 300, pointerId: 2 });
    expect(title()).toBe(planes[0]!.name);
  });

  it("treats a short drag as an inspection, never as a swipe", () => {
    const { log } = renderHangar();
    const bay = screen.getByTestId("hangar-bay");

    fireEvent.pointerDown(bay, { clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(bay, { clientX: 260, pointerId: 1 });
    fireEvent.pointerUp(bay, { clientX: 260, pointerId: 1 });

    // 40px must not swap the plane out from under someone trying to turn it.
    expect(title()).toBe(planes[0]!.name);
    expect(log.created).toHaveLength(1);
  });

  it("leaves the pointer to the canvas while a scene is live", () => {
    renderHangar();
    const bay = screen.getByTestId("hangar-bay");
    fireEvent.click(screen.getByTestId("hangar-inspect"));

    // Orbiting the aircraft must not also fly it out of the bay.
    fireEvent.pointerDown(bay, { clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(bay, { clientX: 150, pointerId: 1 });
    fireEvent.pointerUp(bay, { clientX: 150, pointerId: 1 });
    expect(title()).toBe(planes[0]!.name);
  });

  // --- accessibility -------------------------------------------------------

  it("marks the current dot and announces the change politely", () => {
    const { container } = renderHangar();
    const dotFor = (id: string) => container.querySelector(`.hangar-dot[data-plane='${id}']`)!;

    expect(dotFor(planes[0]!.id)).toHaveAttribute("aria-current", "true");
    expect(dotFor(planes[1]!.id)).toHaveAttribute("aria-current", "false");

    fireEvent.click(screen.getByTestId("hangar-next"));
    expect(dotFor(planes[1]!.id)).toHaveAttribute("aria-current", "true");
    expect(dotFor(planes[0]!.id)).toHaveAttribute("aria-current", "false");

    const live = screen.getByTestId("hangar-announce");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent(planes[1]!.name);
    expect(live).toHaveTextContent(strings.tier[planes[1]!.tier]);
  });

  it("says in a dot's own name whether that aircraft's wings are earned", () => {
    seed({ completed: [planes[2]!.id] });
    const { container } = renderHangar();

    expect(container.querySelector(`.hangar-dot[data-plane='${planes[2]!.id}']`)).toHaveAttribute(
      "aria-label",
      `${planes[2]!.name}, wings earned`,
    );
    expect(container.querySelector(`.hangar-dot[data-plane='${planes[1]!.id}']`)).toHaveAttribute(
      "aria-label",
      planes[1]!.name,
    );
  });

  it("counts earned wings in the nav", () => {
    seed({ completed: [planes[0]!.id] });
    renderHangar();
    expect(screen.getByTestId("wings-counter")).toHaveTextContent("Wings: 1");
  });

  // --- which aircraft the bay opens on -------------------------------------

  it("opens on the first aircraft the cadet has not finished", () => {
    seed({ completed: [planes[0]!.id, planes[1]!.id] });
    renderHangar();
    expect(title()).toBe(planes[2]!.name);
    expect(screen.queryByTestId("hangar-wings")).not.toBeInTheDocument();
  });

  it("opens on the first aircraft for a new cadet and for a finished one alike", () => {
    renderHangar();
    expect(title()).toBe(planes[0]!.name);

    cleanup();
    seed({ completed: planes.map((plane) => plane.id) });
    renderHangar();
    // Nothing left unfinished to find, and the fleet being complete is a
    // success rather than a state with nothing to show.
    expect(title()).toBe(planes[0]!.name);
    expect(screen.getByTestId("hangar-wings")).toBeInTheDocument();
  });

  it("picks once, so an arrowed-to aircraft is never yanked back", () => {
    seed({ completed: [planes[0]!.id] });
    renderHangar();
    expect(title()).toBe(planes[1]!.name);

    fireEvent.click(screen.getByTestId("hangar-next"));
    expect(title()).toBe(planes[2]!.name);

    // A wing recorded elsewhere (another tab) republishes the snapshot. The
    // strip must update; the selection must not.
    act(() => {
      seed({ completed: [planes[0]!.id, planes[1]!.id] });
      window.dispatchEvent(new StorageEvent("storage"));
    });
    expect(title()).toBe(planes[2]!.name);
  });

  it("selects the first unfinished aircraft by rule, not by hard-coded id", () => {
    const done = new Set([planes[0]!.id, planes[1]!.id, planes[2]!.id]);
    expect(firstUnfinishedIndex(planes, (id) => done.has(id))).toBe(3);
    expect(firstUnfinishedIndex(planes, () => false)).toBe(0);
    expect(firstUnfinishedIndex(planes, () => true)).toBe(0);
  });

  // --- the renderer --------------------------------------------------------

  it("requests no renderer on arrival, on hover, or on focus", () => {
    const { log } = renderHangar();
    const bay = screen.getByTestId("hangar-bay");

    fireEvent.pointerEnter(bay);
    fireEvent.mouseOver(bay);
    screen.getByTestId("hangar-primary").focus();
    screen.getByTestId("hangar-inspect").focus();

    expect(log.created).toHaveLength(0);
    expect(screen.queryByTestId("hangar-stage")).not.toBeInTheDocument();
  });

  it("mounts the stage from the named button, as a cheap display surface", () => {
    const { log } = renderHangar();
    fireEvent.click(screen.getByTestId("hangar-inspect"));

    expect(log.created).toHaveLength(1);
    // The hangar shows the aircraft, not the folding of it.
    expect(log.steps).toEqual([planes[0]!.stepCount - 1]);

    const opts = log.created[0]?.opts;
    expect(opts?.quality).toBe("preview");
    // Display mode carries the hero angle itself. It is deliberately not a
    // `cameraPreset`: presets are authored into fold steps, and no step may ask
    // for the angle a finished aircraft is photographed from.
    expect(opts?.display).toBe(true);
    expect(opts?.displayView).toEqual(planes[0]!.presentation.displayView);
    expect(opts?.cameraPreset).toBeUndefined();
    // Stands the plane up rather than leaving it on its side, half under the
    // table, in the frame its creases were authored in.
    expect(opts?.rest).toBe(true);
    expect(opts?.autoRotate).toBeUndefined();
  });

  it("mounts the stage from a short drag, which is deliberate where hover is not", () => {
    const { log } = renderHangar();
    const bay = screen.getByTestId("hangar-bay");

    fireEvent.pointerDown(bay, { clientX: 400, pointerId: 1 });
    fireEvent.pointerMove(bay, { clientX: 370, pointerId: 1 });
    fireEvent.pointerUp(bay, { clientX: 370, pointerId: 1 });

    expect(log.created).toHaveLength(1);
    expect(title()).toBe(planes[0]!.name);
  });

  it("never leaves a second scene alive when the aircraft changes", () => {
    const { log } = renderHangar();

    fireEvent.click(screen.getByTestId("hangar-inspect"));
    expect(log.created).toHaveLength(1);
    expect(log.disposed).toBe(0);

    fireEvent.click(screen.getByTestId("hangar-next"));
    expect(log.disposed).toBe(1);
    expect(screen.queryByTestId("hangar-stage")).not.toBeInTheDocument();
    expect(screen.getByTestId("hangar-inspect")).toHaveAttribute("aria-pressed", "false");

    // And arrowing right through the whole fleet, inspecting each one, still
    // leaves nothing behind. One created per deliberate ask, one disposed per
    // aircraft change - never a scene built for a plane nobody asked about.
    for (const _ of planes) {
      fireEvent.click(screen.getByTestId("hangar-inspect"));
      fireEvent.click(screen.getByTestId("hangar-next"));
    }
    expect(log.created).toHaveLength(planes.length + 1);
    expect(log.disposed).toBe(log.created.length);
  });

  it("keeps the beauty art visible until the stage is actually drawing", () => {
    const { container } = renderHangar();
    fireEvent.click(screen.getByTestId("hangar-inspect"));
    // The art layer is never removed or hidden by mounting; the stage fades in
    // over it, so a 644 KB chunk arriving late leaves no blank rectangle.
    expect(container.querySelector(".hangar-layer")).not.toBeNull();
    expect(container.querySelectorAll(".hangar-aircraft")).toHaveLength(planes.length);
  });

  it("keeps beauty art on a WebGL failure and offers a retry", async () => {
    const { container, log } = renderHangar("svg");
    fireEvent.click(screen.getByTestId("hangar-inspect"));

    await waitFor(() => expect(screen.getByText(strings.unavailable3d)).toBeInTheDocument());
    expect(container.querySelector(".hangar-layer")).not.toHaveClass("is-hidden");
    fireEvent.click(screen.getByRole("button", { name: strings.retry3d }));
    await waitFor(() => expect(log.created).toHaveLength(2));
  });

  it("resets an inspected aircraft to its authored view", async () => {
    const { log } = renderHangar();
    fireEvent.click(screen.getByTestId("hangar-inspect"));
    const reset = await screen.findByRole("button", { name: strings.resetView });
    fireEvent.click(reset);
    expect(log.reset).toBe(1);
  });

  // --- what the card grid took with it -------------------------------------

  it("has no tier filters, no card grid, and no ratings", () => {
    const { container } = renderHangar();
    expect(container.querySelector("[role='group'][aria-label*='difficulty']")).toBeNull();
    expect(screen.queryByRole("button", { name: "All" })).not.toBeInTheDocument();
    expect(container.querySelectorAll("article")).toHaveLength(0);
    expect(screen.queryByText("Speed")).not.toBeInTheDocument();
  });
});
