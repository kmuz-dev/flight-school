import { expect, test } from "@playwright/test";

/**
 * The hangar's performance floor (plan, Gate 2): a live WebGL scene must not
 * cost the page its responsiveness on a slow device. Measured under 4x CPU
 * throttling via CDP, on the phone project, because that is the device the
 * floor is about.
 *
 * The bay is a harder case than the card grid it replaced, and in a way the
 * grid never was: it animates on every frame whether or not a scene is live,
 * because six aircraft are positioned by script rather than by CSS. So the idle
 * sample here is load-bearing rather than a baseline for comparison.
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
  test("keeps animating with a live scene awake, and reports its cadence", async (
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
    await expect(page.locator(".hangar-aircraft img").first()).toBeVisible();

    // Not an idle page: the float runs from the moment the bay mounts.
    const floating = await page.evaluate(sampleFrames, 2000);

    // One live scene is the documented ceiling, so measure at the ceiling.
    // Inspection is explicit: arriving, hovering and focusing stay image-only.
    await page.getByTestId("hangar-inspect").click();
    await expect(page.getByTestId("hangar-stage")).toHaveCount(1);

    const live = await page.evaluate(sampleFrames, 3000);

    const detail =
      `float ${Math.round(floating.median)}ms -> one scene ${Math.round(live.median)}ms ` +
      `(p95 ${Math.round(live.p95)}ms over ${live.frames} frames)`;

    // A perf number nobody can read on a green run is a perf number nobody can
    // act on when it starts drifting.
    testInfo.annotations.push({ type: "cadence", description: detail });

    // The bay animates from mount, and an animating page sits at the vsync
    // floor on every machine that is not in trouble, so this one is a real
    // threshold everywhere: 2000ms of frames is ~120, and 20 is trouble.
    expect(floating.frames, `the bay should keep breathing; ${detail}`).toBeGreaterThan(20);

    /*
     * The live sample is a different question and needs a different number.
     *
     * The header above says this test deliberately asserts no millisecond
     * budget, because the figure it produces is a report on whichever CPU ran
     * it. `> 20 frames in 3000ms` is a 150ms-per-frame budget wearing another
     * hat, and it duly went red: 10 frames on a 2-core CI runner under 4x
     * throttling with SwiftShader, and again on a laptop with the rest of the
     * suite competing for the same cores. Neither run had a defect in it.
     *
     * What a defect looks like here is a stall - a scene that takes the page
     * with it produces one frame, or none, for the whole window. So the floor
     * is set where a stall lives rather than where a fast machine lives, and
     * the cadence stays in the annotation for a human comparing runs.
     */
    expect(live.frames, `the page should keep animating; ${detail}`).toBeGreaterThan(5);

    // The ceiling still holds after three seconds of load, and still holds
    // after arrowing on: a scene left behind by a swap shows up here and
    // nowhere else.
    await expect(page.getByTestId("hangar-stage")).toHaveCount(1);
    await page.getByTestId("hangar-next").click();
    await expect(page.getByTestId("hangar-stage")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
