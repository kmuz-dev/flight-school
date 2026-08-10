import { expect, test } from "@playwright/test";

/**
 * Layout stability on the screens a cadet walks (plan, Gate 3).
 *
 * Only CLS is asserted here, and the omission is deliberate. LCP and TBT in
 * this loop are reports on whichever CPU ran them - headless Chromium
 * rasterises every WebGL frame through SwiftShader, on CI and on a laptop
 * alike - which is the same trap tests/e2e/hangar-perf.spec.ts documents at
 * length after two attempts at a millisecond budget turned CI red on unrelated
 * commits. Layout shift is different: it is geometry, not speed. A card that
 * jumps when its thumbnail arrives jumps by the same fraction of the viewport
 * on every machine, so a budget here means something everywhere.
 *
 * The measured numbers on the exported build, mobile emulation, are all 0.
 * The budget is Google's "good" threshold rather than zero, because a shift
 * small enough to sit under it is one nobody sees, and pinning a hard zero
 * would fail on a rounding wobble rather than on a regression.
 */
const CLS_BUDGET = 0.1;

const SCREENS = [
  { name: "the hangar", path: "/en/" },
  { name: "preflight", path: "/en/plane/dart/" },
  { name: "the tutorial", path: "/en/plane/dart/fold/" },
  { name: "wings earned", path: "/en/plane/dart/wings/" },
] as const;

for (const { name, path } of SCREENS) {
  test(`${name} settles without shifting its layout`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("main, [role=main]").first()).toBeVisible();

    const cls = await page.evaluate(async () => {
      let total = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          // Shifts within 500ms of a user interaction are expected and excluded
          // from the metric; nothing here interacts, but the flag is part of
          // the definition.
          if (!entry.hadRecentInput) total += entry.value;
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
      // The stage wakes after hydration, which is the moment a shift would
      // happen if the canvas took its space late.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      observer.disconnect();
      return total;
    });

    expect(cls, `CLS ${cls.toFixed(4)}`).toBeLessThanOrEqual(CLS_BUDGET);
  });
}
