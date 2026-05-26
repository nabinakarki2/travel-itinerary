import { test, expect } from "@playwright/test";

test.describe("Route Optimization", () => {
  test("route page loads with correct title", async ({ page }) => {
    await page.goto("/route");
    await expect(page.locator("h1")).toContainText("Route Planning");
  });

  test("route page shows empty state when no places are selected", async ({ page }) => {
    await page.goto("/route");
    await expect(page.locator("text=No places selected")).toBeVisible();
  });

  test("route page has time delay input field", async ({ page }) => {
    await page.goto("/route");
    const delayInput = page.locator('input[type="number"]');
    await expect(delayInput).toBeVisible();
  });
});
