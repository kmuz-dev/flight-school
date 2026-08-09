import { expect, test } from "@playwright/test";

/**
 * `paths.ts` builds directory hrefs with a trailing slash, but the export runs
 * with Next's default `trailingSlash: false`, so the host answers those with a
 * redirect to the slashless form. These patterns accept either, so the suite
 * stays green whichever way that mismatch is settled.
 *
 * Every wait uses `waitUntil: "commit"`: what matters is that the router landed
 * on the right route, and the assertions after it already auto-wait for the
 * content. Waiting for `load` instead makes each hop hostage to the WebGL stage
 * finishing its first frame, which is what made this suite flake under parallel
 * workers.
 */
const HANGAR = /\/en\/?$/;
const PREFLIGHT = /\/en\/plane\/dart\/?$/;
const FOLD = /\/en\/plane\/dart\/fold\/?$/;
const WINGS = /\/en\/plane\/dart\/wings\/?$/;

/**
 * The whole product loop, as a cadet walks it: pick a licence, read the
 * preflight card, fold the plane, take the certificate, and come back to a
 * hangar that remembers.
 */
test("hangar to wings and back, with the badge on the card", async ({ page }) => {
  await page.goto("/en/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/the hangar/i);

  const dartCard = page.locator("[data-plane='dart']");
  await expect(dartCard).toBeVisible();

  // Filter chips are view state, not routing: the URL still means "the hangar".
  await page.getByRole("button", { name: /^ace$/i }).click();
  await expect(dartCard).toBeHidden();
  await page.getByRole("button", { name: /^beginner$/i }).click();
  await expect(dartCard).toBeVisible();
  expect(new URL(page.url()).pathname).toMatch(HANGAR);

  await dartCard.getByRole("link", { name: /the dart/i }).click();
  await page.waitForURL(PREFLIGHT, { waitUntil: "commit" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/the dart/i);
  await expect(page.getByText(/12 folds/i)).toBeVisible();

  await page.getByTestId("preflight-primary").click();
  await page.waitForURL(FOLD, { waitUntil: "commit" });
  await expect(page.getByText(/step 01 \/ 12/i).first()).toBeVisible();

  // Jump the sequence rather than walking it: tutorial.spec.ts already clicks
  // every fold, and repeating that walk here only doubles the suite's heaviest
  // WebGL test without adding coverage of the hangar-to-wings loop.
  await page.getByRole("button", { name: "Go to step 12" }).click();
  await page.getByRole("button", { name: "Finish" }).click();

  await page.waitForURL(WINGS, { waitUntil: "commit" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/earned your wings/i);
  await expect(page.getByTestId("certified-stamp")).toBeVisible();

  await page.getByRole("link", { name: /return to hangar/i }).click();
  await page.waitForURL(HANGAR, { waitUntil: "commit" });
  await expect(page.locator("[data-plane='dart']").getByTestId("wings-stamp")).toBeVisible();
  await expect(page.getByTestId("wings-counter")).toHaveText(/wings: 1/i);
});

test("preflight offers a resume once there is progress", async ({ page }) => {
  await page.goto("/en/plane/dart/fold/");
  await page.getByRole("button", { name: "Go to step 05" }).click();
  await expect(page.getByText(/step 05 \/ 12/i).first()).toBeVisible();

  await page.goto("/en/plane/dart/");
  await expect(page.getByTestId("preflight-primary")).toHaveText(/resume at step 5/i);
});

test("no console errors across the journey", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/en/");
  await page.locator("[data-plane='dart']").getByRole("link", { name: /the dart/i }).click();
  await page.waitForURL(PREFLIGHT, { waitUntil: "commit" });
  await page.goto("/en/plane/dart/wings/");
  await expect(page.getByTestId("certified-stamp")).toBeVisible();

  expect(errors).toEqual([]);
});
