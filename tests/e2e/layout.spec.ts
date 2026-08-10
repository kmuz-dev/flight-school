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

/**
 * Fitting the viewport is not the same as being legible in it. The tutorial's
 * top bar passed the check above while the plane name was truncated to zero
 * width and the licence placard ran straight through the step counter: nothing
 * overflowed, and nothing told the cadet which aircraft was on the table.
 */
test("the tutorial says which plane is on the table, at any width", async ({ page }) => {
  await page.goto("/en/plane/dart/fold/");
  const name = page.getByRole("heading", { level: 1 });
  await expect(name).toBeVisible();

  const box = await name.boundingBox();
  expect(box, "the plane name has no box").not.toBeNull();
  // Wide enough for more than an ellipsis. The Dart's name is the shortest in
  // the fleet, so anything that fits it fits the rest.
  expect(box!.width, `the name is ${box!.width}px wide`).toBeGreaterThan(60);

  // And nothing in the bar sits on top of anything else.
  const rects = await page.locator("header > div > *, header > div").evaluateAll((els) =>
    els
      .filter((el) => (el as HTMLElement).offsetParent !== null)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, text: (el.textContent ?? "").slice(0, 24), r };
      }),
  );
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i]!;
      const b = rects[j]!;
      // Containers legitimately contain their children; only siblings that
      // neither nest nor touch are compared.
      const nested =
        (a.r.left <= b.r.left && a.r.right >= b.r.right) ||
        (b.r.left <= a.r.left && b.r.right >= a.r.right);
      if (nested) continue;
      const overlap = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      expect(overlap, `"${a.text}" overlaps "${b.text}" by ${overlap}px`).toBeLessThanOrEqual(0);
    }
  }
});
