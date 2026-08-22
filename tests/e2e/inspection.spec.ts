import { expect, test } from "@playwright/test";

const PLANE_IDS = ["dart", "bulldog", "harrier", "sea-glider", "hammer", "square-cruiser"] as const;

for (const id of PLANE_IDS) {
  test(`${id} opens as a resettable live inspection`, async ({ page }) => {
    await page.goto(`/en/plane/${id}/`);
    const name = await page.getByRole("heading", { level: 1 }).textContent();
    await page.getByRole("button", { name: `Inspect ${name} in 3D` }).click();
    await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
    await expect(page.getByTestId("preflight-stage").locator("canvas")).toHaveCount(1);
    await page.getByRole("button", { name: "Reset view" }).click();
  });
}

test("Preflight restores artwork after a live WebGL context loss", async ({ page }) => {
  await page.goto("/en/plane/dart/");
  await page.getByRole("button", { name: "Inspect The Dart in 3D" }).click();
  await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();

  await page.getByTestId("preflight-stage").locator("canvas").evaluate((canvas) => {
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });

  await expect(page.getByText("3D is unavailable. Showing artwork.")).toBeVisible();
  await expect(page.getByTestId("preflight-artwork")).toHaveCSS("opacity", "1");
  await expect(page.getByRole("button", { name: "Retry 3D" })).toBeVisible();
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
