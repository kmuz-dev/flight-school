import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * axe-core over the screens a cadet actually walks (PRD §8, Gate 3).
 *
 * Two deliberate choices about what is scanned.
 *
 * The tags are WCAG 2.1 A and AA plus axe's own best-practice set. AA is the
 * bar DESIGN.md sets for contrast; best-practice is included because most of
 * what it catches here - a heading level skipped, a landmark missing, a control
 * with no accessible name - is the kind of thing that costs nothing to keep
 * right and everything to retrofit.
 *
 * The 3D stage is excluded by selector, not by disabling a rule. A WebGL canvas
 * has no accessible content by construction and carries aria-hidden for exactly
 * that reason; the tutorial it belongs to is completable without it, which is
 * what tests/e2e/resilience.spec.ts proves. Excluding the canvas keeps every
 * rule live everywhere else, where a real violation would otherwise hide behind
 * a blanket disable.
 */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];

function scan(page: Page) {
  return new AxeBuilder({ page })
    .withTags(TAGS)
    .exclude("[data-testid='engine-mount']")
    .exclude("[data-testid='preflight-stage']")
    .analyze();
}

/** Readable failure: axe's default dump is a wall of nodes. */
function summarise(results: Awaited<ReturnType<typeof scan>>): string[] {
  return results.violations.map(
    (v) => `${v.id} (${v.impact ?? "unknown"}) x${v.nodes.length}: ${v.help}`,
  );
}

const SCREENS: readonly { readonly name: string; readonly path: string }[] = [
  { name: "the hangar", path: "/en/" },
  { name: "preflight", path: "/en/plane/dart/" },
  { name: "the tutorial", path: "/en/plane/dart/fold/" },
  { name: "wings earned", path: "/en/plane/dart/wings/" },
];

for (const { name, path } of SCREENS) {
  test(`${name} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("main, [role=main]").first()).toBeVisible();
    expect(summarise(await scan(page))).toEqual([]);
  });
}

test("night flight keeps its contrast", async ({ page }) => {
  // The palette swaps wholesale in Night Flight, so passing in daylight says
  // nothing about the dark scene. Same scan, other theme.
  await page.goto("/en/");
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html.night")).toHaveCount(1);
  expect(summarise(await scan(page))).toEqual([]);
});

test("every step on the progress strip is big enough to hit", async ({ page }) => {
  // WCAG 2.5.8 asks 24x24 CSS px of any control a thumb has to find, and the
  // strip is the one place on the site where twelve controls compete for a
  // phone's width. axe does not check this - 2.5.8 is WCAG 2.2 and the scan
  // above is tagged 2.1 - and it is exactly the kind of thing a later layout
  // tweak shrinks without anyone noticing, so it is measured rather than
  // trusted.
  await page.goto("/en/plane/dart/fold/");
  const steps = page.getByRole("button", { name: /go to step/i });
  const count = await steps.count();
  expect(count).toBeGreaterThan(1);

  for (let i = 0; i < count; i += 1) {
    const box = await steps.nth(i).boundingBox();
    expect(box, `step ${i + 1} has no box`).not.toBeNull();
    expect(box!.width, `step ${i + 1} is ${box!.width}px wide`).toBeGreaterThanOrEqual(24);
    expect(box!.height, `step ${i + 1} is ${box!.height}px tall`).toBeGreaterThanOrEqual(24);
  }
});

test("arabic has no accessibility violations", async ({ page }) => {
  // RTL is where a landmark or a label goes missing without anyone noticing,
  // because nobody on the team reads the page.
  await page.goto("/ar/plane/dart/");
  await expect(page.locator("main").first()).toBeVisible();
  expect(summarise(await scan(page))).toEqual([]);
});
