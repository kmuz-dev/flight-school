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
  await expect(page.getByRole("status")).toContainText(/Static fold view/i);
  await expect(page.getByRole("button", { name: "Play the fold" })).toBeDisabled();
  await expect(page.getByRole("slider", { name: "Scrub through the fold" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Replay this fold" })).toBeDisabled();
  await expect(page.getByRole("group", { name: "Camera angle" })).toHaveCount(0);

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

/**
 * Make the renderer chunk unreachable, the way a dropped connection or a
 * document left open across a redeploy that purged the file it names would.
 *
 * The chunk is found by its contents rather than its name, because the name is
 * a build hash. Three.js appears in exactly one chunk - that is the whole point
 * of the seam in `app/engine/index.ts` - so `WebGLRenderer` identifies it. The
 * body is read through the test's own request context rather than
 * `route.fetch()`, whose response is disposed out from under a handler still
 * reading it when a sibling request is aborted.
 */
async function withoutRendererChunk(
  page: import("@playwright/test").Page,
  request: import("@playwright/test").APIRequestContext,
): Promise<void> {
  const isRenderer = new Map<string, boolean>();
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    const url = route.request().url();
    let blocked = isRenderer.get(url);
    if (blocked === undefined) {
      blocked = (await (await request.get(url)).text()).includes("WebGLRenderer");
      isRenderer.set(url, blocked);
    }
    if (blocked) await route.abort("failed");
    else await route.continue();
  });
}

test("a renderer that never downloads still leaves a foldable tutorial", async ({ page, request }) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
    if (m.type() === "warning") warnings.push(m.text());
  });

  await withoutRendererChunk(page, request);
  await page.goto("/en/plane/dart/fold/");

  // Not a blank stage. The seam hands back the flat SVG engine instead of
  // rejecting, so the cadet gets the same drawing a no-WebGL machine gets.
  const stage = page.getByTestId("engine-mount");
  await expect(stage.locator("[data-fold-engine='fallback']")).toBeVisible();
  await expect(stage.locator("svg")).toBeVisible();

  // And the transport still drives it, which is what a rejected promise took
  // away: `onEngineChange` never fired, so every control was wired to nothing.
  await page.getByRole("combobox", { name: "Choose a fold" }).selectOption("11");
  await expect(page.getByText(/step 12 \/ 12/i).first()).toBeVisible();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.waitForURL(WINGS, { waitUntil: "commit" });
  await expect(page.getByTestId("certified-stamp")).toBeVisible();

  // A failed chunk is a network event, not a defect to report to the cadet. The
  // browser's own "Failed to fetch dynamically imported module" is the one
  // console line the abort itself produces; nothing may be added to it, and in
  // particular no unhandled rejection.
  const ours = errors.filter((e) => !/dynamically imported module|Failed to fetch|ERR_FAILED/i.test(e));
  expect(ours).toEqual([]);

  // It is still not silent. A renderer broken by a bad deploy degrades exactly
  // like a dropped connection, so the degrade announces itself at the severity
  // it deserves - a warning, which is why the error assertion above still holds.
  expect(warnings.filter((w) => w.includes("[fold-engine]"))).not.toEqual([]);
});

test("the hangar renders its catalogue without WebGL", async ({ page }) => {
  await withoutWebGL(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/en/");
  await expect(page.locator("[data-plane]")).toHaveCount(6);
  const dart = page.locator("[data-plane='dart']");

  // Beauty artwork is the default catalog surface, even on a machine without
  // WebGL. The fold engine is not requested until the cadet asks for it.
  await expect(dart.locator("img")).toBeVisible();
  await expect(dart.locator("svg")).toHaveCount(0);

  // Explicit inspection then swaps to the canonical static engine and says so
  // instead of claiming that a flat SVG is interactive 3D.
  await dart.getByRole("button", { name: /inspect .* in 3d/i }).click();
  await expect(dart.locator("[data-fold-engine='fallback']")).toBeVisible();
  await expect(dart.locator("svg")).toBeVisible();
  await expect(dart.getByText(/3D unavailable - showing the static preview/i)).toBeVisible();
  expect(errors).toEqual([]);
});

test("preflight keeps beauty artwork when 3D is unavailable", async ({ page }) => {
  await withoutWebGL(page);
  await page.goto("/en/plane/dart/");

  const artwork = page.getByTestId("preflight-artwork");
  const image = page.getByRole("img", { name: /finished paper aircraft: the dart/i });
  await expect(image).toBeVisible();

  await page.getByRole("button", { name: /inspect the dart in 3d/i }).click();
  await expect(page.getByText(/3D unavailable - showing the static preview/i)).toBeVisible();
  await expect(artwork).toHaveCSS("opacity", "1");
  await expect(page.getByTestId("preflight-stage")).toHaveCSS("opacity", "0");
  await expect(image).toBeVisible();
});

/**
 * The keyboard path. PRD §8 asks for the tutorial to be completable without a
 * mouse, and the transport is a row of icon buttons where that is easy to get
 * wrong: a control reachable only by pointer strands a cadet mid-fold.
 */
test("the whole fold is walkable from the keyboard", async ({ page }) => {
  await page.goto("/en/plane/dart/fold/");
  await expect(page.getByText(/step 01 \/ 12/i).first()).toBeVisible();

  // The rail's primary button is the one advancement path and becomes Finish
  // at the end, so focus can remain predictable throughout the tutorial.
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
  await page.getByRole("combobox", { name: "Choose a fold" }).selectOption("11");
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

  await page.getByRole("combobox", { name: "Choose a fold" }).selectOption("11");
  await expect(page.getByText(/step 12 \/ 12/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Finish", exact: true })).toBeVisible();
  await page.waitForURL(FOLD, { waitUntil: "commit" });
});
