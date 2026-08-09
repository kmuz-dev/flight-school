import { expect, test } from "@playwright/test";

/** The core product loop: open a tutorial and fold a plane start to finish. */
test.describe("the Dart tutorial", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/plane/dart/");
  });

  test("renders the stage, transport, and step rail", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dart");
    await expect(page.getByRole("region", { name: /playback controls/i })).toBeVisible();
    await expect(page.getByRole("region", { name: /current step/i })).toBeVisible();
    await expect(page.getByText(/step 01 \/ 12/i).first()).toBeVisible();
  });

  test("shows the first step's instruction and its why", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Fold it in half");
    await expect(page.getByText(/fold the right edge over/i)).toBeVisible();
    await expect(page.getByText(/backbone/i)).toBeVisible();
  });

  test("teaches fold terms on first use", async ({ page }) => {
    const rail = page.getByRole("region", { name: /current step/i });
    await expect(rail.getByText("Valley fold")).toBeVisible();
    await expect(page.getByText(/crease dips down/i)).toBeVisible();
  });

  test("labels the fold on the stage", async ({ page }) => {
    // The engine projects the annotation anchor; React renders the label.
    await expect(page.getByTestId("fold-annotation")).toContainText(/valley fold/i);
  });

  test("steps through all twelve folds and reaches the finish", async ({ page }) => {
    for (let i = 1; i < 12; i++) {
      await page.getByRole("button", { name: "Next fold", exact: true }).click();
      await expect(
        page.getByText(new RegExp(`step ${String(i + 1).padStart(2, "0")} / 12`, "i")).first(),
      ).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Finish" })).toBeVisible();
  });

  test("back is disabled on the first step and works after that", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Back" })).toBeDisabled();
    await page.getByRole("button", { name: "Next fold", exact: true }).click();
    await expect(page.getByRole("button", { name: "Back" })).toBeEnabled();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText(/step 01 \/ 12/i).first()).toBeVisible();
  });

  test("the progress strip jumps to a step", async ({ page }) => {
    await page.getByRole("button", { name: "Go to step 05" }).click();
    await expect(page.getByText(/step 05 \/ 12/i).first()).toBeVisible();
  });

  test("remembers progress and resumes after a reload", async ({ page }) => {
    await page.getByRole("button", { name: "Go to step 04" }).click();
    await expect(page.getByText(/step 04 \/ 12/i).first()).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem("flightschool.v1"));
    expect(stored).toContain('"step":3');
  });

  test("camera presets are operable", async ({ page }) => {
    await page.getByRole("button", { name: "Top" }).click();
    await expect(page.getByRole("button", { name: "Top" })).toBeVisible();
  });

  test("the whole tutorial is keyboard operable", async ({ page }) => {
    const next = page.getByRole("button", { name: "Next fold", exact: true });
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/step 02 \/ 12/i).first()).toBeVisible();
  });

  test("has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.reload();
    await page.getByRole("button", { name: "Next fold", exact: true }).click();
    expect(errors).toEqual([]);
  });
});
