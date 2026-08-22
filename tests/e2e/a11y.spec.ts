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

/**
 * Let every colour transition land before reading colours off the page.
 *
 * axe measures contrast from the computed styles at the instant it runs, and a
 * transition caught halfway through is measuring two colours that were never
 * meant to be seen together. The hangar hands the beauty art over to a live
 * stage across 300ms, and the aircraft it is fading between is the ground a
 * badge sits on. A scan landing inside that window failed about one run in
 * three, and only in a full suite, where the machine is busy enough to land
 * there at all.
 *
 * Waiting on the animations themselves rather than sleeping: a sleep is a guess
 * that gets tuned upward every time it flakes. Anything that never finishes -
 * an idle loop, a spinner - is skipped, and the whole wait is bounded, because
 * a stuck animation must not turn an accessibility failure into a timeout.
 */
async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((a) => {
      const timing = a.effect?.getComputedTiming();
      return timing !== undefined && Number.isFinite(timing.endTime ?? Infinity);
    });
    await Promise.race([
      Promise.allSettled(finite.map((a) => a.finished)),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  });
}

async function scan(page: Page) {
  await settle(page);
  return new AxeBuilder({ page })
    .withTags(TAGS)
    .exclude("[data-testid='engine-mount']")
    .analyze();
}

/**
 * Readable failure: axe's default dump is a wall of nodes.
 *
 * Each violation carries its nodes' selectors. Without them a failure reads
 * "one element somewhere fails contrast", which is not something anyone can act
 * on - and an intermittent one is then unfixable, because by the time you go
 * looking it passes.
 */
function summarise(results: Awaited<ReturnType<typeof scan>>): string[] {
  return results.violations.map((v) => {
    const where = v.nodes.map((n) => n.target.join(" ")).join(" | ");
    return `${v.id} (${v.impact ?? "unknown"}) x${v.nodes.length}: ${v.help} @ ${where}`;
  });
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

test("the native fold selector has a usable target and expected keyboard semantics", async ({ page }) => {
  await page.goto("/en/plane/dart/fold/");
  const selector = page.getByRole("combobox", { name: "Choose a fold" });
  await expect(selector.locator("option")).toHaveCount(12);
  const box = await selector.boundingBox();
  expect(box, "fold selector has no box").not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);

  /*
   * The Fold terms disclosure, measured on step 1 and only there.
   *
   * "Fold terms" appears on the steps that TEACH a term, which is most of them
   * but not step 2 - so this has to happen before the selector is exercised
   * below, not after. It was previously written after, and passed only because
   * the keyboard press it followed never moved the step at all.
   */
  const summary = page.getByText("Fold terms", { exact: true });
  const summaryBox = await summary.boundingBox();
  expect(summaryBox, "Fold terms disclosure has no box").not.toBeNull();
  expect(summaryBox!.height, "Fold terms disclosure target is too short").toBeGreaterThanOrEqual(36);
  await expect(page.getByText("Why", { exact: true })).toHaveCount(0);

  /*
   * The select is present in the static HTML. Wait for the client engine seam
   * before driving it, so hydration cannot replace a pre-hydration choice.
   *
   * What is asserted is the product's half of the contract: a change drives the
   * tutorial, and focus survives the step change - which is the one that breaks,
   * because the rail re-renders underneath and a cadet who has just chosen a
   * fold with the keyboard must not be dropped back to the top of the document.
   *
   * The browser's half - that ArrowDown moves a closed native select - is NOT
   * asserted, because it is not true in this browser: headless Chromium leaves
   * a bare `<select>` on its first option after ArrowDown and Enter, with no
   * application code on the page at all. Pinning that would test Chromium and
   * fail forever.
   */
  await expect(page.getByRole("button", { name: "Play the fold" })).toBeEnabled();
  await selector.focus();
  await expect(selector).toBeFocused();
  await selector.selectOption("1");
  await expect(selector).toHaveValue("1");
  await expect(page.getByText(/step 02 \/ 12/i).first()).toBeVisible();
  await expect(selector).toBeFocused();
});

test("arabic has no accessibility violations", async ({ page }) => {
  // RTL is where a landmark or a label goes missing without anyone noticing,
  // because nobody on the team reads the page.
  await page.goto("/ar/plane/dart/");
  await expect(page.locator("main").first()).toBeVisible();
  expect(summarise(await scan(page))).toEqual([]);
});
