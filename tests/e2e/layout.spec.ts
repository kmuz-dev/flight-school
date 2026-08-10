import { expect, test } from "@playwright/test";

/**
 * A page wider than the phone's viewport does not scroll sideways on mobile
 * Chrome - it zooms the whole page out to fit, and every tap after that lands
 * offset from what the user aimed at. That is how a 69px-too-wide top bar
 * turned into an unclickable Finish button on four of the six planes, with a
 * failure message ("the section intercepts pointer events") that pointed
 * nowhere near the cause. This asserts the invariant directly, and names the
 * offending elements when it breaks so the next one is a one-minute fix.
 */
const ROUTES = [
  "/en/",
  "/en/plane/dart/",
  "/en/plane/dart/fold/",
  "/en/plane/dart/wings/",
  "/en/plane/bulldog/fold/",
  "/en/plane/square-cruiser/fold/",
];

for (const route of ROUTES) {
  test(`${route} fits its viewport`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      const limit = root.clientWidth;
      const offenders: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("body *")) {
        const r = el.getBoundingClientRect();
        // Only the outermost offender is interesting: a child sticking out
        // because its parent does drags every descendant into the list.
        if (r.right <= limit + 1) continue;
        if (el.parentElement && el.parentElement.getBoundingClientRect().right > limit + 1) continue;
        offenders.push(
          `${el.tagName} right=${Math.round(r.right)} "${(el.className || "").toString().slice(0, 60)}"`,
        );
      }
      return { limit, scrollWidth: root.scrollWidth, offenders };
    });

    expect(
      overflow.scrollWidth,
      `page is ${overflow.scrollWidth - overflow.limit}px wider than the viewport; widest elements: ${overflow.offenders.join(" | ")}`,
    ).toBeLessThanOrEqual(overflow.limit);
  });
}
