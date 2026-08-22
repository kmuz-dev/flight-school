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

const TEXT_ZOOM_ROUTES = [
  "/en/",
  "/en/plane/dart/",
  "/en/plane/dart/fold/",
] as const;

for (const route of TEXT_ZOOM_ROUTES) {
  test(`${route} keeps its controls reachable at 200% text size`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "one deterministic text-resize viewport");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);
    await page.addStyleTag({ content: ":root { font-size: 200% !important; }" });
    await expect(page.locator("main")).toBeVisible();

    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(metrics.scrollWidth, `${route} scrolls horizontally at 200% text size`).toBeLessThanOrEqual(
      metrics.clientWidth,
    );

    const primary =
      route === "/en/"
        ? page.getByTestId("hangar-primary")
        : route.endsWith("/fold/")
          ? page.getByRole("button", { name: "Next fold", exact: true })
          : page.getByRole("link", { name: "Start folding" });
    await primary.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expect(primary).toBeVisible();
    const box = await primary.boundingBox();
    expect(box, `${route} primary action has no layout box`).not.toBeNull();
    expect(box!.x, `${route} primary action escapes the near edge`).toBeGreaterThanOrEqual(0);
    expect(
      box!.x + box!.width,
      `${route} primary action escapes the far edge`,
    ).toBeLessThanOrEqual(metrics.clientWidth);
  });
}

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

test("the mobile bay keeps its aircraft contained and its controls reachable", async (
  { page },
  testInfo,
) => {
  test.skip(testInfo.project.name !== "mobile", "mobile viewport regression");
  await page.goto("/en/");

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  // The aircraft is positioned by script every frame and scaled off the bay
  // width, so "it fits" is a claim that has to be measured rather than styled.
  const aircraft = page.locator(".hangar-aircraft img").first();
  const box = await aircraft.boundingBox();
  expect(box, "the resting aircraft has no box").not.toBeNull();
  expect(box!.x, "the aircraft escapes the near edge").toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width, "the aircraft escapes the far edge").toBeLessThanOrEqual(
    viewport!.width + 1,
  );

  // Every control the bay stacks over the photograph has to stay on screen and
  // stay hittable: on a phone the arrows sit on the bay's own edges and the dot
  // strip floats over the floor, which is exactly where they can drift off.
  for (const control of ["hangar-prev", "hangar-next", "hangar-primary", "hangar-inspect"]) {
    const element = page.getByTestId(control);
    await expect(element).toBeVisible();
    const rect = await element.boundingBox();
    expect(rect, `${control} has no box`).not.toBeNull();
    expect(rect!.x, `${control} escapes the near edge`).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width, `${control} escapes the far edge`).toBeLessThanOrEqual(
      viewport!.width,
    );
  }

  const dots = page.locator(".hangar-dot");
  await expect(dots).toHaveCount(6);
  const last = await dots.last().boundingBox();
  expect(last!.x + last!.width, "the last marker is pushed off screen").toBeLessThanOrEqual(
    viewport!.width,
  );

  // And the strip still selects, rather than being decoration under a scrim.
  await dots.nth(3).click();
  await expect(dots.nth(3)).toHaveAttribute("aria-current", "true");
});

test("mobile preflight uses a compact one-line Hangar return", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile viewport regression");
  await page.goto("/en/plane/dart/");

  const back = page.getByRole("link", { name: "Back to the hangar" });
  expect((await back.innerText()).trim().toLowerCase()).toBe("hangar");
  const metrics = await back.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(style.lineHeight),
      whiteSpace: style.whiteSpace,
    };
  });
  expect(metrics.whiteSpace).toBe("nowrap");
  expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 1.25);
});

test("tutorial transport and sticky navigation stay coherent at narrow phone widths", async ({ page }) => {
  for (const width of [320, 360, 375, 390, 412]) {
    await page.setViewportSize({ width, height: 780 });
    await page.goto("/en/plane/dart/fold/");

    const play = page.getByRole("button", { name: "Play the fold" });
    const replay = page.getByRole("button", { name: "Replay this fold" });
    const playBox = await play.boundingBox();
    const replayBox = await replay.boundingBox();
    expect(playBox, `${width}px play control has no box`).not.toBeNull();
    expect(replayBox, `${width}px replay control has no box`).not.toBeNull();
    expect(Math.abs(playBox!.y - replayBox!.y), `${width}px replay is orphaned`).toBeLessThan(2);
    expect(playBox!.width).toBeGreaterThanOrEqual(40);
    expect(replayBox!.width).toBeGreaterThanOrEqual(40);

    const planeName = page.getByRole("heading", { level: 1 });
    await expect(planeName).toHaveText("The Dart");
    const nameMetrics = await planeName.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      textOverflow: getComputedStyle(element).textOverflow,
    }));
    expect(nameMetrics.scrollWidth, `${width}px plane name is clipped`).toBeLessThanOrEqual(
      nameMetrics.clientWidth,
    );
    expect(nameMetrics.textOverflow).not.toBe("ellipsis");

    await expect(page.getByRole("group", { name: "Camera angle" })).toBeHidden();

    const selector = page.getByRole("combobox", { name: "Choose a fold" });
    await selector.evaluate((element) => element.scrollIntoView({ block: "center" }));
    const selectorBox = await selector.boundingBox();
    const nextBox = await page.getByRole("button", { name: "Next fold", exact: true }).boundingBox();
    expect(selectorBox, `${width}px selector has no box`).not.toBeNull();
    expect(nextBox, `${width}px sticky navigation has no box`).not.toBeNull();
    const overlaps =
      selectorBox!.x < nextBox!.x + nextBox!.width &&
      selectorBox!.x + selectorBox!.width > nextBox!.x &&
      selectorBox!.y < nextBox!.y + nextBox!.height &&
      selectorBox!.y + selectorBox!.height > nextBox!.y;
    expect(overlaps, `${width}px sticky navigation covers the fold selector`).toBe(false);
  }
});

/**
 * The tutorial is a workspace, not a document.
 *
 * A cadet works it with paper in their hands, so the two things that must not
 * move are the size of the window it occupies and the place Next sits in it.
 * Neither held. `min-h-screen` let the page grow to whatever the current step
 * contained, and Back and Next sat after that content: across the Hammer's
 * fourteen folds the page ran between 253 and 566px past a 390x844 phone and
 * Next appeared at six different heights, while on a 1440x900 desktop a tip bar
 * that only four steps carry moved it by 35px.
 *
 * Both are asserted over a whole plane rather than on one screen, because the
 * defect is by definition invisible on any single step.
 */
const SHELL_VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "phone", width: 390, height: 844 },
] as const;

/*
 * Chromium only, because this test supplies its own three viewports.
 *
 * Under the phone project the same three run again inside Pixel 7 emulation,
 * where a forced 1440px viewport is a device that does not exist and the
 * tutorial never finishes laying out - fourteen folds of SwiftShader spent
 * measuring a combination nobody will ever hold. The widths are the subject
 * here; the device is not.
 */
/*
 * These three run one at a time, in one worker, rather than racing each other.
 *
 * The stage's render loop has no dirty check: it re-rasterises every frame for
 * as long as it is on screen, whether or not anything has moved, so a test that
 * sits on the tutorial for two minutes holds a WebGL surface at 60fps for two
 * minutes. On a GPU that is free. Under SwiftShader - and there is no GPU in
 * this loop on CI or on a laptop - it is a core, continuously.
 *
 * `fullyParallel` then put the two most expensive widths on a two-core runner
 * at the same time, and the desktop one lost: not to a hang, but to a pegged
 * main thread, failing its retries at three different lines including a bare
 * `page.evaluate`. Serialising costs wall-clock in the file and takes the
 * contention out, which is the difference between a slow test and an
 * unreliable one.
 *
 * The loop is worth fixing at the source - a still aeroplane should not cost a
 * core on anyone's laptop either - and that is recorded in docs/KNOWN-ISSUES.md
 * rather than done here, because it is a renderer change and this is a layout
 * test.
 */
test.describe("the tutorial shell", () => {
  test.describe.configure({ mode: "default" });

  for (const { name, width, height } of SHELL_VIEWPORTS) {
    test(`the tutorial holds one shape on every fold, on ${name}`, async ({ page }, info) => {
      test.skip(info.project.name !== "chromium", "this test supplies its own viewports");
      /*
       * The heaviest test in the suite, and the default 90s is not a real budget
       * for it. Fourteen folds of the Hammer are fourteen real WebGL animations
       * rasterised by SwiftShader - there is no GPU in this loop on CI or on a
       * laptop - and the bill scales with the viewport: measured alone on a free
       * machine, 60s at 1440x900, 56s at 1280x800, 32s at 390x844. Sharing
       * workers with the rest of the suite roughly doubles that, which is how a
       * test that passes in isolation fails only in a full run - and did, on a
       * two-worker CI runner, at 180s.
       *
       * So do not pay for the animations at all. The subject here is where the
       * rail's controls sit at each settled step, which is a question about
       * fourteen static layouts; under reduced motion the engine jumps to each
       * settled state (REDUCED_MOTION_SECONDS is 1ms) and the walk costs
       * rasterisation alone. The ceiling below is what a genuine hang hits.
       */
      test.setTimeout(180_000);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height });
      // The Hammer: the longest sequence in the fleet and the one whose tips are
      // spread across it, so it varies more than any other plane.
      await page.goto("/en/plane/hammer/fold/");
      const next = page.getByRole("button", { name: "Next fold", exact: true });
      await expect(next).toBeVisible();

      const tops = new Set<number>();
      const overflows: string[] = [];

      for (let step = 1; step <= 14; step += 1) {
        const box = await next.or(page.getByRole("button", { name: "Finish" })).boundingBox();
        expect(box, `step ${step} has no Next button`).not.toBeNull();
        tops.add(Math.round(box!.y));

        const scroll = await page.evaluate(() => ({
          page: document.documentElement.scrollHeight,
          window: window.innerHeight,
        }));
        if (scroll.page > scroll.window) {
          overflows.push(`step ${step}: ${scroll.page - scroll.window}px`);
        }
        if (step < 14) {
          await next.click();
          // The rail re-renders on the step change; the button must be settled
          // before it is measured or this asserts a frame mid-transition.
          await expect(page.getByRole("combobox", { name: "Choose a fold" })).toHaveValue(
            String(step),
          );
        }
      }

      expect(overflows, `the page scrolls on: ${overflows.join(", ")}`).toEqual([]);
      expect(
        [...tops],
        `Next sits at ${tops.size} different heights across the fold sequence`,
      ).toHaveLength(1);
    });
  }
});
