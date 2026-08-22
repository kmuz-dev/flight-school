import { expect, test, type Page } from "@playwright/test";

/**
 * The fold renderer is intentionally a second product download.
 *
 * Beauty artwork must carry the first Hangar and Preflight frames by itself.
 * Looking for the built chunk's WebGLRenderer symbol avoids coupling this gate
 * to Turbopack's content-hashed filename.
 */
async function initialRendererRequests(page: Page, url: string): Promise<{
  readonly paper: string[];
  readonly renderer: string[];
}> {
  const paper: string[] = [];
  const renderer: string[] = [];
  const pending: Promise<void>[] = [];

  page.on("request", (request) => {
    if (request.url().includes("paper-craft-")) paper.push(request.url());
  });
  page.on("response", (response) => {
    if (!response.url().includes("/_next/static/chunks/") || !response.url().endsWith(".js")) {
      return;
    }
    pending.push(
      response
        .text()
        .then((body) => {
          if (body.includes("WebGLRenderer")) renderer.push(response.url());
        })
        .catch(() => {}),
    );
  });

  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await Promise.all(pending);
  return { paper, renderer };
}

test("the initial Hangar fetches neither Three.js nor paper maps", async ({ page }) => {
  const requests = await initialRendererRequests(page, "/en/");
  expect(requests.renderer).toEqual([]);
  expect(requests.paper).toEqual([]);
});

test("the initial Preflight fetches neither Three.js nor paper maps", async ({ page }) => {
  const requests = await initialRendererRequests(page, "/en/plane/dart/");
  expect(requests.renderer).toEqual([]);
  expect(requests.paper).toEqual([]);
});
