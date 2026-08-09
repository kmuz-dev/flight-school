/**
 * Smoke test for the dev-only fold editor, run against the static export.
 *
 * NOTE FOR THE ORCHESTRATOR: playwright.config.ts currently sets
 * `testDir: "tests/e2e"`, so this file is not collected by `npm run test:e2e`
 * until that is widened (e.g. `testDir: "tests"` with the default
 * `**\/*.spec.ts` match). The editor track does not own that config file. It was
 * verified locally against a copy of the config pointed at tests/dev.
 */
import { expect, test } from "@playwright/test";

const ROUTE = "/dev/fold-editor/";

test("the fold editor loads, steps to the end and reports a clean Dart", async ({ page }) => {
  const crashes: string[] = [];
  page.on("pageerror", (e) => crashes.push(e.message));

  await page.goto(ROUTE);
  await expect(page.getByRole("heading", { level: 1, name: /fold editor/i })).toBeVisible();

  // The picker is driven by the content registry, so it must at least offer the Dart.
  const picker = page.getByTestId("plane-picker");
  await expect(picker).toBeVisible();
  await picker.selectOption("dart");

  // Both 2D views render from the engine.
  await expect(page.getByTestId("table-plan")).toBeVisible();
  await expect(page.locator("#fe-svg-truth svg")).toBeVisible();

  // Step to the last step of the sequence.
  const stepButtons = page.getByTestId("step-list").getByRole("button");
  const stepCount = await stepButtons.count();
  expect(stepCount).toBeGreaterThan(1);
  await page.getByTestId("last-step").click();
  await expect(stepButtons.nth(stepCount - 1)).toHaveAttribute("aria-current", "step");

  // Validation is green.
  const validation = page.getByTestId("validation-panel");
  await expect(validation).toHaveAttribute("data-clean", "true");
  await expect(validation).toContainText("no issues");

  // The facet inspector is populated and every row carries a facet id.
  const rows = page.locator("[data-facet-row]");
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(1);

  // The crease overlay is drawn with numeric endpoint labels.
  await expect(page.getByTestId("crease-line")).toBeAttached();
  await expect(page.getByTestId("table-plan").locator("text").first()).toContainText(/-?\d/);

  // Diagnostics describe the step we are on.
  await expect(page.getByTestId("diagnostics")).toContainText("facets");

  expect(crashes).toEqual([]);
});

test("selecting a facet row highlights it in the plan", async ({ page }) => {
  await page.goto(ROUTE);
  await page.getByTestId("last-step").click();

  const firstRow = page.locator("[data-facet-row]").first();
  const facetId = await firstRow.getAttribute("data-facet-row");
  expect(facetId).not.toBeNull();

  await firstRow.getByRole("button").click();
  await expect(firstRow).toHaveAttribute("data-selected", "true");
  await expect(page.getByTestId("table-plan").locator(`[data-facet="${facetId}"]`)).toBeAttached();
});

test("the plan reports pointer position in table-space millimetres", async ({ page }) => {
  await page.goto(ROUTE);
  const plan = page.getByTestId("table-plan");
  await plan.hover();
  await expect(page.getByText(/\(-?\d+\.\d, -?\d+\.\d\) mm/)).toBeVisible();
});
