import { expect, test } from "@playwright/test";

/**
 * The site on a machine that cannot do what it would prefer.
 *
 * PRD acceptance: a cadet with no WebGL still finishes the plane. That promise
 * is only worth what an actual no-WebGL run proves, and the unit tests cannot
 * prove it - they exercise `createFallbackEngine` directly, which is the one
 * arrangement where the fallback is guaranteed to be reached. Here the page
 * decides for itself, from a browser where `getContext("webgl")` returns null,
 * exactly as an old machine or a blocklisted driver would report it.
 */
const FOLD = /\/en\/plane\/dart\/fold\/?$/;
const WINGS = /\/en\/plane\/dart\/wings\/?$/;

/** Make the browser look like one without WebGL, before any page script runs. */
async function withoutWebGL(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const real = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, id: string, ...rest: any[]) {
      if (id === "webgl" || id === "webgl2" || id === "experimental-webgl") return null;
      return (real as any).call(this, id, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

test("the tutorial falls back to flat drawings, and still teaches", async ({ page }) => {
  await withoutWebGL(page);
  await page.goto("/en/plane/dart/fold/");

  const stage = page.getByTestId("engine-mount");
  await expect(stage.locator("[data-fold-engine='fallback']")).toBeVisible();
  // A drawing, not an empty box: the flat SVG is the same projection the
  // thumbnails and the golden snapshots use.
  await expect(stage.locator("svg")).toBeVisible();

  // The instruction rail is DOM either way, which is the reason the fallback is
  // a viable tutorial rather than a placeholder.
  await expect(page.getByText(/step 01 \/ 12/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(/fold it in half/i);
});

test("a cadet with no WebGL still earns their wings", async ({ page }) => {
  await withoutWebGL(page);
  await page.goto("/en/plane/dart/fold/");

  await expect(page.getByText(/step 01 \/ 12/i).first()).toBeVisible();
  for (let step = 2; step <= 12; step += 1) {
    await page.getByRole("button", { name: "Next fold", exact: true }).click();
    await expect(page.getByText(new RegExp(`step ${String(step).padStart(2, "0")} / 12`, "i")).first()).toBeVisible();
  }

  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.waitForURL(WINGS, { waitUntil: "commit" });
  await expect(page.getByTestId("certified-stamp")).toBeVisible();
});

test("the hangar renders its catalogue without WebGL", async ({ page }) => {
  await withoutWebGL(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/en/");
  await expect(page.locator("[data-plane]")).toHaveCount(6);
  // Cards are build-time SVG until a scene wakes, so a machine that can never
  // wake one still sees the whole fleet rather than six empty frames.
  await expect(page.locator("[data-plane='dart'] svg").first()).toBeVisible();
  expect(errors).toEqual([]);
});

/**
 * The keyboard path. PRD §8 asks for the tutorial to be completable without a
 * mouse, and the transport is a row of icon buttons where that is easy to get
 * wrong: a control reachable only by pointer strands a cadet mid-fold.
 */
test("the whole fold is walkable from the keyboard", async ({ page }) => {
  await page.goto("/en/plane/dart/fold/");
  await expect(page.getByText(/step 01 \/ 12/i).first()).toBeVisible();

  // Two controls advance the fold: the transport arrow ("Go to next fold")
  // and the rail's primary button. The rail one is the keyboard path a cadet
  // reading the instruction actually lands on, and it becomes "Finish" at the
  // end, which is why the focus assertion below accepts either label.
  const next = page.getByRole("button", { name: "Next fold", exact: true });
  await next.focus();
  await expect(next).toBeFocused();

  // Three folds, not twelve. What can break here is the step change itself
  // stealing focus, and that either happens on the first one or never; walking
  // the whole sequence would only buy nine more SwiftShader folds and push the
  // test past its timeout. The no-WebGL test above already walks all twelve.
  for (let step = 2; step <= 4; step += 1) {
    await page.keyboard.press("Enter");
    await expect(page.getByText(new RegExp(`step ${String(step).padStart(2, "0")} / 12`, "i")).first()).toBeVisible();
    // Focus has to survive the step change, or the next Enter goes nowhere and
    // the cadet has to find the button again with Tab on every single fold.
    await expect(next).toBeFocused();
  }

  // And the last fold's button, which is a different label on the same element,
  // finishes the plane from the keyboard rather than needing a click.
  await page.getByRole("button", { name: "Go to step 12" }).click();
  const finish = page.getByRole("button", { name: "Finish", exact: true });
  await finish.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(WINGS, { waitUntil: "commit" });
  await expect(page.getByTestId("certified-stamp")).toBeVisible();
});

test("reduced motion still reaches every fold", async ({ page }) => {
  // Under `prefers-reduced-motion` the engine snaps to each settled state
  // instead of tweening. The steps must still advance; a stage that only ever
  // moved via the tween would freeze on step one.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/plane/dart/fold/");

  await page.getByRole("button", { name: "Go to step 12" }).click();
  await expect(page.getByText(/step 12 \/ 12/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Finish", exact: true })).toBeVisible();
  await page.waitForURL(FOLD, { waitUntil: "commit" });
});
