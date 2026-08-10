import { expect, test } from "@playwright/test";

/**
 * The hangar's performance floor (plan, Gate 2): two live WebGL scenes must
 * stay smooth on a slow device. Measured under 4x CPU throttling via CDP, so
 * the number means something on hardware weaker than the CI runner.
 *
 * The assertion is on the median frame interval. Across repeated local runs the
 * median held to a tenth of a millisecond (32.0, 32.2) while p95 swung from 50
 * to 66 on the same build - on a shared CI runner a tail statistic measures the
 * runner, not the page. p95 is still reported in the failure message, because
 * that is the number worth reading once the median has already gone bad.
 * Chromium only - CDP is not available elsewhere.
 */
test.describe("hangar under load", () => {
  test("holds its frame cadence with two live scenes on a throttled CPU", async (
    { page, context, browserName },
    testInfo,
  ) => {
    // The phone is the device this floor is about, and CDP throttling is
    // chromium-only, so this runs once rather than once per project.
    test.skip(
      browserName !== "chromium" || testInfo.project.name !== "mobile",
      "phone project only",
    );

    const client = await context.newCDPSession(page);
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await page.goto("/en/");
    const cards = page.locator("[data-plane]");
    await expect(cards.first()).toBeVisible();

    // Two live scenes is the documented ceiling, so measure at the ceiling.
    // Pressing previews rather than hovering: a phone has no hover, and a hover
    // is evicted by the next one, so hovering would time one scene, not two.
    await cards.nth(0).getByRole("button", { name: /preview/i }).click();
    await cards.nth(1).getByRole("button", { name: /preview/i }).click();
    await expect(page.getByTestId("live-scene")).toHaveCount(2);

    const stats = await page.evaluate(async () => {
      const gaps: number[] = [];
      let last = performance.now();
      await new Promise<void>((resolve) => {
        const start = last;
        const tick = (now: number) => {
          gaps.push(now - last);
          last = now;
          if (now - start < 3000) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
      gaps.sort((a, b) => a - b);
      return {
        frames: gaps.length,
        median: gaps[Math.floor(gaps.length * 0.5)] ?? 0,
        p95: gaps[Math.floor(gaps.length * 0.95)] ?? 0,
      };
    });

    // 40ms is 25fps: the floor at which a slow bob still reads as motion rather
    // than as stutter. Measured headroom on this build is 32ms, and the same
    // scene cost 67ms before the previews dropped to their own quality tier, so
    // the threshold sits between a healthy build and the regression it catches.
    expect(stats.frames, "the page should keep animating").toBeGreaterThan(30);
    expect(
      stats.median,
      `median frame gap ${Math.round(stats.median)}ms, p95 ${Math.round(stats.p95)}ms, over ${stats.frames} frames`,
    ).toBeLessThan(40);
  });
});
