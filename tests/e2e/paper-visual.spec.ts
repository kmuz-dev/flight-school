import { expect, test } from "@playwright/test";

const PLANE_IDS = ["dart", "bulldog", "harrier", "sea-glider", "hammer", "square-cruiser"] as const;

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one deterministic desktop visual baseline");
  await page.setViewportSize({ width: 960, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const id of PLANE_IDS) {
  test(`${id} matches its approved authored inspection view`, async ({ page }) => {
    await page.goto(`/en/plane/${id}/`);
    const name = await page.getByRole("heading", { level: 1 }).textContent();
    await page.getByRole("button", { name: `Inspect ${name} in 3D` }).click();
    await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
    await expect(page.getByTestId("preflight-stage")).toHaveScreenshot(
      `${id}-inspection.png`,
      {
        animations: "disabled",
        maxDiffPixelRatio: 0.06,
        threshold: 0.25,
      },
    );
  });
}

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
