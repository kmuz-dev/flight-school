import { expect, test } from "@playwright/test";
import { LOCALES } from "../../app/i18n/config";

test("root redirects into a locale", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL(/\/(en|es|fr|de|pt|ru|hi|id|ja|ko|zh|ar)\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("every locale route exists in the static export", async ({ page }) => {
  for (const locale of LOCALES) {
    const response = await page.goto(`/${locale}/`);
    expect(response?.status(), `locale ${locale}`).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("arabic renders right-to-left", async ({ page }) => {
  await page.goto("/ar/");
  await expect(page.locator("[dir=rtl]").first()).toBeVisible();
});

test("no console errors on the hangar", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
