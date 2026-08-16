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
 * The whole product loop, as a cadet walks it: choose an aircraft in the bay,
 * read its preflight, fold it, take the wings, and come back to a hangar that
 * remembers - which now means it opens on the NEXT aircraft rather than on the
 * one just finished.
 */
test("hangar to wings and back, and the bay moves on", async ({ page }) => {
  await page.goto("/en/");

  // A new cadet opens on the first aircraft on the difficulty ladder.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/the dart/i);
  await expect(page.getByTestId("hangar-primary")).toBeVisible();

  // Changing aircraft is view state, not routing: the URL still means "the
  // hangar", and the bay comes back to where it was.
  await page.getByTestId("hangar-next").click();
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(/^the dart$/i);
  await page.getByTestId("hangar-prev").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/the dart/i);
  expect(new URL(page.url()).pathname).toMatch(HANGAR);

  await page.getByTestId("hangar-primary").click();
  await page.waitForURL(PREFLIGHT, { waitUntil: "commit" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/the dart/i);
  await expect(page.getByText(/12 folds/i)).toBeVisible();

  await page.getByTestId("preflight-primary").click();
  await page.waitForURL(FOLD, { waitUntil: "commit" });
  await expect(page.getByText(/step 01 \/ 12/i).first()).toBeVisible();

  // Jump the sequence rather than walking it: tutorial.spec.ts already clicks
  // every fold, and repeating that walk here only doubles the suite's heaviest
  // WebGL test without adding coverage of the hangar-to-wings loop.
  await page.getByRole("combobox", { name: "Choose a fold" }).selectOption("11");
  await page.getByRole("button", { name: "Finish" }).click();

  await page.waitForURL(WINGS, { waitUntil: "commit" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/earned your wings/i);
  await expect(page.getByTestId("wings-stamp")).toBeVisible();

  await page.getByTestId("wings-return").click();
  await page.waitForURL(HANGAR, { waitUntil: "commit" });
  await expect(page.getByTestId("wings-counter")).toHaveText(/wings: 1/i);
  // The Dart is folded, so the bay opens on the next unfinished aircraft and
  // its marker in the strip is filled.
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(/^the dart$/i);
  await expect(page.locator(".hangar-dot[data-plane='dart']")).toHaveAttribute(
    "data-earned",
    "true",
  );
});

test("preflight offers a resume once there is progress", async ({ page }) => {
  await page.goto("/en/plane/dart/fold/");
  await page.getByRole("combobox", { name: "Choose a fold" }).selectOption("4");
  await expect(page.getByText(/step 05 \/ 12/i).first()).toBeVisible();

  await page.goto("/en/plane/dart/");
  await expect(page.getByTestId("preflight-primary")).toHaveText(/resume at step 5/i);
});

test("no console errors across the journey", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/en/");
  await page.getByTestId("hangar-primary").click();
  await page.waitForURL(PREFLIGHT, { waitUntil: "commit" });
  // Never folded, so this is the unearned state rather than the stamp.
  await page.goto("/en/plane/dart/wings/");
  await expect(page.getByTestId("wings-not-earned")).toBeVisible();

  expect(errors).toEqual([]);
});

/**
 * Paper prep. A cadet with a 4x6 index card and no A4 in the house should still
 * be able to fold the Square Cruiser: choosing that sheet puts the cut-it-square
 * steps in front of the plane's own, in the same tutorial.
 */
test("choosing a smaller sheet adds the steps that cut it square", async ({ page }) => {
  /**
   * The sheet lives in localStorage, so the tutorial renders the plane's own
   * sequence first and swaps to the composed one on the render after hydration.
   * Polling rather than reading once is the difference between testing the
   * behaviour and testing which render happened to land first.
   */
  const totalSteps = async (): Promise<number> => {
    const max = await page.getByRole("progressbar").getAttribute("aria-valuemax");
    return Number(max);
  };

  const startFolding = async (): Promise<void> => {
    await page.getByRole("link", { name: /start folding|resume/i }).click();
    await page.waitForURL(/\/plane\/square-cruiser\/fold\/?$/, { waitUntil: "commit" });
  };

  await page.goto("/en/plane/square-cruiser/");
  await page.getByRole("radio", { name: /^square\b/i }).click();
  await startFolding();
  await expect.poll(totalSteps).toBeGreaterThan(0);
  const nativeCount = await totalSteps();

  await page.goto("/en/plane/square-cruiser/");
  await page.getByRole("radio", { name: /4x6 card/i }).click();
  await expect(page.getByText(/extra steps first/i).first()).toBeVisible();

  await startFolding();
  await expect.poll(totalSteps).toBeGreaterThan(nativeCount);

  // And the run opens on the prep, not on the plane's own first fold.
  await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(/corner/i);
});

/**
 * Every plane in the catalog reaches its certificate, not just the Dart.
 *
 * The mobile half of this used to fail on Finish with "the section intercepts
 * pointer events", which read like a stacking bug and was not one: the top bar
 * overflowed the phone viewport, mobile Chrome zoomed the page out to fit, and
 * every synthesised tap landed offset from its target. tests/e2e/layout.spec.ts
 * now guards the width invariant directly.
 */
for (const plane of ["bulldog", "harrier", "sea-glider", "hammer", "square-cruiser"]) {
  test(`${plane} folds from the hangar through to its wings`, async ({ page }) => {
    await page.goto(`/en/plane/${plane}/`);
    await page.getByRole("link", { name: /start folding|resume/i }).click();
    await page.waitForURL(new RegExp(`/plane/${plane}/fold/?$`), { waitUntil: "commit" });

    // Jump to the end through the native fold selector rather than walking
    // every fold. The per-step walk is covered once, on the Dart.
    const selector = page.getByRole("combobox", { name: "Choose a fold" });
    const total = await selector.locator("option").count();
    expect(total, "the selector should offer every fold").toBeGreaterThan(1);
    await selector.selectOption(String(total - 1));

    // Assert we actually landed on the last fold before hunting for Finish, so
    // a strip that did not register reads as a strip failure, not a missing
    // button.
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(total));

    await page.getByRole("button", { name: /^finish$/i }).click();
    await page.waitForURL(new RegExp(`/plane/${plane}/wings/?$`), { waitUntil: "commit" });
    await expect(page.getByText(/mission complete/i)).toBeVisible();
  });
}
