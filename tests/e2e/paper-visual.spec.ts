import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one deterministic desktop visual baseline");
  await page.setViewportSize({ width: 960, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

/**
 * The display stage - standing aircraft, graded backdrop, contact shadow -
 * now lives only in the Hangar bay, so that is where its paper is baselined.
 * The per-plane Preflight inspection views this used to cover went with the
 * inspection control itself.
 */
test("the Hangar bay matches the approved display-stage paper", async ({ page }) => {
  await page.goto("/en/");
  await page.getByTestId("hangar-inspect").click();
  await expect(page.getByTestId("hangar-reset-view")).toBeVisible();
  await expect(page.getByTestId("hangar-stage")).toHaveScreenshot("hangar-inspection.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.06,
    threshold: 0.25,
  });
});

for (const [name, step] of [
  ["early", "0"],
  ["middle", "5"],
  ["final", "11"],
] as const) {
  test(`the Dart ${name} fold matches the approved paper stage`, async ({ page }) => {
    await page.goto("/en/plane/dart/fold/");
    const stage = page.getByTestId("engine-mount");
    await expect(stage).toHaveAttribute("data-material-ready", "true");
    await page.getByRole("combobox", { name: "Choose a fold" }).selectOption(step);
    await expect(page.getByRole("combobox", { name: "Choose a fold" })).toHaveValue(step);
    await expect(stage).toHaveScreenshot(`dart-tutorial-${name}.png`, {
      animations: "disabled",
      maxDiffPixelRatio: 0.06,
      threshold: 0.25,
    });
  });
}
