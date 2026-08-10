import { expect, test } from "@playwright/test";

/**
 * Night Flight has to survive a page load, because a static export is a set of
 * separate documents: the class that carries it is set by an inline script from
 * localStorage before anything paints, and nothing else in the app would notice
 * it was missing. Only a real navigation exercises that.
 */
const NIGHT = "#0e1626";

async function rootClass(page: import("@playwright/test").Page): Promise<string> {
  return page.evaluate(() => document.documentElement.className);
}

test.describe("Night Flight", () => {
  test("switches the scene and holds it across a navigation and a reload", async ({ page }) => {
    await page.goto("/en/");
    expect(await rootClass(page)).not.toContain("night");

    const toggle = page.getByTestId("theme-toggle");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(await rootClass(page)).toContain("night");

    const background = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor,
    );
    expect(background).toBe("rgb(14, 22, 38)"); // NIGHT, the deep navy ground

    // A different document entirely: the boot script is the only thing that can
    // carry the choice here.
    await page.goto("/en/plane/dart/");
    expect(await rootClass(page)).toContain("night");

    await page.reload();
    expect(await rootClass(page)).toContain("night");

    // And back off again, from the hangar it was set on.
    await page.goto("/en/");
    await page.getByTestId("theme-toggle").click();
    await page.reload();
    expect(await rootClass(page)).not.toContain("night");
  });

  test("the fold stage changes scene with the page", async ({ page }) => {
    await page.goto("/en/");
    await page.getByTestId("theme-toggle").click();
    await page.goto("/en/plane/dart/fold/");

    // The stage clears to the theme's own background, so reading a pixel from
    // the canvas is what proves the engine got the scene change too.
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    const corner = await canvas.evaluate((el: HTMLCanvasElement) => {
      const gl = el.getContext("webgl2") ?? el.getContext("webgl");
      if (!gl) return null;
      const data = new Uint8Array(4);
      gl.readPixels(2, 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
      return { r: data[0] ?? 0, g: data[1] ?? 0, b: data[2] ?? 0 };
    });
    test.skip(corner === null, "no WebGL in this runner");
    const { r, g, b } = corner!;
    // Tone mapping shifts the clear colour, so this asserts the scene is dark
    // rather than a specific value: the cream ground would be far above it.
    expect(
      r + g + b,
      `stage cleared to rgb(${r}, ${g}, ${b}); expected the Night Flight ground near ${NIGHT}`,
    ).toBeLessThan(240);
  });
});
