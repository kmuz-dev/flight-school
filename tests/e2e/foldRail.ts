/**
 * Driving the tutorial's fold selector without racing hydration.
 *
 * The selector is a controlled React `<select>` on a statically exported page,
 * and between the HTML arriving and hydration finishing it is real, visible
 * and operable with nothing listening. A `change` fired in that window is
 * dropped, and React's first render then restores `value` from its own state,
 * so the page stays on the fold it was already showing and the step readout
 * the caller is about to assert on never appears.
 *
 * Locally the window is a few milliseconds and no run ever lost it. Against a
 * deployed host it is wide enough that a full suite lost two to four specs a
 * run, on a different plane each time - which reads as an unattributable flake
 * and is really one race with one cause. CI saw the same thing from the other
 * direction, on a runner slow enough to lose it locally.
 *
 * `data-material-ready` is the product's own answer to "is this stage live",
 * set from an effect on both the WebGL path and the static fallback, so it
 * cannot be true before React is running.
 */
import { expect, type Page } from "@playwright/test";

/** Resolve once the tutorial stage has mounted and React is driving it. */
export async function tutorialIsLive(page: Page): Promise<void> {
  await expect(page.getByTestId("engine-mount")).toHaveAttribute(
    "data-material-ready",
    "true",
  );
}

/** Jump to a fold by its 0-based index, once the rail can actually hear it. */
export async function chooseFold(page: Page, index: number | string): Promise<void> {
  await tutorialIsLive(page);
  await page.getByRole("combobox", { name: "Choose a fold" }).selectOption(String(index));
}
