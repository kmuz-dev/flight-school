/**
 * Live 3D inspection, which now exists in exactly one place: the Hangar bay.
 *
 * Preflight used to carry the same control on its hero, and no longer does -
 * that screen is a decision, not a viewer, and the aircraft it shows is the
 * one the cadet is about to build with their hands.
 */
import { expect, test } from "@playwright/test";

test("the Hangar opens as a resettable live inspection", async ({ page }) => {
  await page.goto("/en/");
  await page.getByTestId("hangar-inspect").click();
  await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
  await expect(page.getByTestId("hangar-stage").locator("canvas")).toHaveCount(1);
  await page.getByTestId("hangar-reset-view").click();
});

test("the Hangar restores artwork after a live WebGL context loss", async ({ page }) => {
  await page.goto("/en/");
  await page.getByTestId("hangar-inspect").click();
  await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();

  await page.getByTestId("hangar-stage").locator("canvas").evaluate((canvas) => {
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });

  await expect(page.getByText("3D is unavailable. Showing artwork.")).toBeVisible();
  await expect(page.locator(".hangar-layer")).not.toHaveClass(/is-hidden/);
  await expect(page.getByRole("button", { name: "Retry 3D" })).toBeVisible();
});
