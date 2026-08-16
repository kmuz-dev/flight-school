import { expect, test } from "@playwright/test";

const PLANE_IDS = ["dart", "bulldog", "harrier", "sea-glider", "hammer", "square-cruiser"] as const;

test("all six approved aircraft open as resettable live inspections", async ({ page }) => {
  for (const id of PLANE_IDS) {
    await page.goto(`/en/plane/${id}/`);
    const name = await page.getByRole("heading", { level: 1 }).textContent();
    await page.getByRole("button", { name: `Inspect ${name} in 3D` }).click();
    await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
    await expect(page.getByTestId("preflight-stage").locator("canvas")).toHaveCount(1);
    await page.getByRole("button", { name: "Reset view" }).click();
  }
});
