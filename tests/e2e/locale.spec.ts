import { expect, test } from "@playwright/test";
import { getPlanes, getUi } from "../../app/i18n/dictionary";

/**
 * What a translated build has to prove, beyond "the route exists".
 *
 * The failure this guards against is the one that shipped for two phases
 * without anyone noticing: twelve prerendered locales, every route 200, every
 * heading present - all of them rendering English, because the pages imported
 * `@/i18n/ui/en` by name. A locale smoke test that only checks status codes
 * cannot see that. So these assert the actual translated string, taken from
 * the same dictionary the page was built from.
 *
 * Arabic gets the extra checks because RTL is where a layout breaks silently:
 * direction has to compute as rtl on the content, and the page must not spill
 * sideways, which is how a physical `left-md` that should have been `start-md`
 * announces itself.
 */

const AR_UI = getUi("ar");
const JA_UI = getUi("ja");

test("arabic renders arabic, right to left", async ({ page }) => {
  await page.goto("/ar/");

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveText(AR_UI["hangar.title"]!);
  await expect(heading).toHaveCSS("direction", "rtl");
});

test("arabic does not spill sideways", async ({ page }) => {
  await page.goto("/ar/plane/dart/");
  await expect(page.locator("main")).toBeVisible();

  const spill = await page.evaluate(() => {
    const root = document.documentElement;
    const limit = root.clientWidth;
    const offenders: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const r = el.getBoundingClientRect();
      // In RTL the overflow escapes to the left, so both edges matter.
      const out = r.right > limit + 1 || r.left < -1;
      if (!out) continue;
      const parent = el.parentElement?.getBoundingClientRect();
      if (parent && (parent.right > limit + 1 || parent.left < -1)) continue;
      offenders.push(`${el.tagName} left=${Math.round(r.left)} right=${Math.round(r.right)}`);
    }
    return { limit, offenders };
  });

  expect(spill.offenders, `elements outside the ${spill.limit}px viewport`).toEqual([]);
});

test("a CJK locale renders its own prose", async ({ page }) => {
  await page.goto("/ja/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(JA_UI["hangar.title"]!);
});

test("the tutorial teaches the fold in the chosen language", async ({ page }) => {
  const dart = getPlanes("ja").planes.dart!;
  await page.goto("/ja/plane/dart/fold/");
  await expect(page.getByText(dart.steps["dart.step-01"]!)).toBeVisible();
});

test("switching language keeps the cadet on the same screen", async ({ page }) => {
  // Preflight, not the hangar: the segment swap only earns its keep if it holds
  // somewhere deeper than "/xx/", and this is the screen a cadet is on when
  // they notice the site is in the wrong language.
  await page.goto("/en/plane/dart/");
  await page.getByTestId("locale-picker").selectOption("ar");
  await page.waitForURL(/\/ar\/plane\/dart\/$/);

  const dart = getPlanes("ar").planes.dart!;
  await expect(page.getByText(dart.description)).toBeVisible();
});

test("the language choice survives a fresh visit to the root", async ({ page }) => {
  await page.goto("/en/");
  await page.getByTestId("locale-picker").selectOption("de");
  await page.waitForURL(/\/de\/$/);

  await page.goto("/");
  await page.waitForURL(/\/de\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(getUi("de")["hangar.title"]!);
});
