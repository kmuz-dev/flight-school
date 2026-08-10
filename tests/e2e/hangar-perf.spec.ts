import { expect, test } from "@playwright/test";

/**
 * The hangar's performance floor (plan, Gate 2): two live WebGL scenes must not
 * cost the page its responsiveness on a slow device. Measured under 4x CPU
 * throttling via CDP, on the phone project, because that is the device the
 * floor is about.
 *
 * What this asserts is that the page keeps producing frames with both scenes
 * awake, and what it records is how fast. It does NOT assert a millisecond
 * budget, and the reason is worth writing down, because two earlier versions of
 * this test did and both were measuring the wrong thing.
 *
 * Headless Chromium rasterises WebGL through SwiftShader on the CI runner AND on
 * a developer laptop - there is no GPU in this loop anywhere - so the number is
 * a report on the CPU that happened to run it: 17ms here, 67-100ms on a 2-core
 * runner, same commit. Expressing it as a ratio against the page's own idle
 * cadence looked machine-independent and was not, since an idle page sits at the
 * vsync floor whatever it runs on, leaving a fixed ~17ms denominator. That
 * version turned CI red on unrelated commits.
 *
 * The optimisation those numbers were meant to defend - hangar previews render
 * at one device pixel with no multisampling and no shadows - is deterministic,
 * so it is gated deterministically instead, in tests/render/engine.test.ts and
 * tests/components/hangar.test.tsx. The cadence here stays as an annotation: a
 * human comparing runs on one machine can still see drift.
 *
 * Chromium only - CDP is not available elsewhere.
 */

type FrameStats = { frames: number; median: number; p95: number };

/**
 * Median frame interval over `ms`, sampled from requestAnimationFrame.
 * Runs in the page, so it closes over nothing from this module.
 */
const sampleFrames = async (ms: number): Promise<FrameStats> => {
  const gaps: number[] = [];
  let last = performance.now();
  await new Promise<void>((resolve) => {
    const start = last;
    const tick = (now: number): void => {
      gaps.push(now - last);
      last = now;
      if (now - start < ms) requestAnimationFrame(tick);
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
};

test.describe("hangar under load", () => {
  test("keeps animating with two live scenes awake, and reports its cadence", async (
    { page, context, browserName },
    testInfo,
  ) => {
    test.skip(
      browserName !== "chromium" || testInfo.project.name !== "mobile",
      "phone project only",
    );

    const client = await context.newCDPSession(page);
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await page.goto("/en/");
    const cards = page.locator("[data-plane]");
    await expect(cards.first()).toBeVisible();

    const idle = await page.evaluate(sampleFrames, 2000);

    // Two live scenes is the documented ceiling, so measure at the ceiling.
    // Pressing previews rather than hovering: a phone has no hover, and a hover
    // is evicted by the next one, so hovering would time one scene, not two.
    await cards.nth(0).getByRole("button", { name: /preview/i }).click();
    await cards.nth(1).getByRole("button", { name: /preview/i }).click();
    await expect(page.getByTestId("live-scene")).toHaveCount(2);

    const live = await page.evaluate(sampleFrames, 3000);

    const detail =
      `idle ${Math.round(idle.median)}ms -> two scenes ${Math.round(live.median)}ms ` +
      `(p95 ${Math.round(live.p95)}ms over ${live.frames} frames)`;

    // A perf number nobody can read on a green run is a perf number nobody can
    // act on when it starts drifting.
    testInfo.annotations.push({ type: "cadence", description: detail });

    expect(live.frames, `the page should keep animating; ${detail}`).toBeGreaterThan(20);
    // The ceiling still holds after three seconds of load: a scene that leaked
    // past the LRU would show up here and nowhere else.
    await expect(page.getByTestId("live-scene")).toHaveCount(2);
  });
});
