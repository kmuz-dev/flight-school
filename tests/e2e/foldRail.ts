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
 * The gate is the step readout, because that is the cheapest thing on the page
 * that only React can produce: the rail re-renders on the step change without
 * waiting for the stage. Gating on the stage instead (`data-material-ready`)
 * also works and costs four minutes of suite time, because it waits out a
 * SwiftShader engine boot that the assertion does not need.
 */
import { expect, type Page } from "@playwright/test";

/** The rail's "Step 04 / 12" readout, which is 1-based and zero-padded. */
export function stepReadout(index: number, total: number): RegExp {
  return new RegExp(`step ${String(index + 1).padStart(2, "0")} / ${total}`, "i");
}

/**
 * Jump to a fold by its 0-based index, and do not return until the rail has
 * actually taken it. Re-issued rather than waited out: there is no signal for
 * "hydrated" short of the app answering, so the answer is the signal.
 */
export async function chooseFold(page: Page, index: number): Promise<void> {
  const selector = page.getByRole("combobox", { name: "Choose a fold" });
  const total = await selector.locator("option").count();
  await expect(async () => {
    await selector.selectOption(String(index));
    await expect(page.getByText(stepReadout(index, total)).first()).toBeVisible({
      timeout: 1_000,
    });
  }).toPass({ timeout: 30_000 });
}
