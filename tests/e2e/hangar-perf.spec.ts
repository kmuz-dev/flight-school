import { expect, test } from "@playwright/test";

/**
 * The hangar's performance floor (plan, Gate 2): two live WebGL scenes must not
 * cost the page its responsiveness on a slow device. Measured under 4x CPU
 * throttling via CDP, on the phone project, because that is the device the
 * floor is about.
 *
 * The assertion is a RATIO against the same page's own idle cadence, not an
 * absolute millisecond budget. An absolute threshold measures the machine: this
 * laptop renders the two-scene hangar at a 32ms median, a GitHub 2-core runner
 * on software WebGL at 50-100ms, and a threshold calibrated on either one is
 * either always green or always red on the other. What the hangar actually
 * promises is that waking the scenes does not change the kind of page it is,
 * and a ratio says exactly that on whatever hardware it happens to run on.
 *
 * Both samples come from one page load, seconds apart, so they share a machine,
 * a browser and a throttling rate. Chromium only - CDP is not available
 * elsewhere.
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
  test("waking two live scenes does not cost the hangar its cadence", async (
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

    const ratio = live.median / Math.max(idle.median, 1);
    const detail =
      `idle ${Math.round(idle.median)}ms -> two scenes ${Math.round(live.median)}ms ` +
      `(x${ratio.toFixed(1)}, p95 ${Math.round(live.p95)}ms over ${live.frames} frames)`;

    // Recorded whether or not the gate trips: a perf number nobody can read on
    // a green run is a perf number nobody can act on when it starts drifting.
    testInfo.annotations.push({ type: "cadence", description: detail });

    expect(live.frames, `the page should keep animating; ${detail}`).toBeGreaterThan(20);
    // 3x is the line between "the scenes cost something" and "the scenes have
    // taken the page over". This build measures 1.9x on a throttled phone
    // profile; before the previews dropped to their own quality tier the same
    // scene measured 4.0x, so the threshold sits between the two.
    expect(ratio, detail).toBeLessThan(3);
  });
});
