import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("TC-SYS-01: landing page renders with hero section and search bar", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Plan Your Domestic Adventure");
    await expect(page.locator('img[alt*="Logo"]').first()).toBeVisible();
  });

  test("landing page has working SearchBar with placeholder", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator('input[placeholder*="Suggest best trekking"]');
    await expect(searchInput).toBeVisible();
  });

  test("landing page shows hero pill categories", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("text=Trecking").first()).toBeVisible();
    await expect(page.locator("text=Adventure").first()).toBeVisible();
    await expect(page.locator("text=Mountains").first()).toBeVisible();
  });

  test("landing page shows popular destinations section", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("text=Why Choose Our Planner").first()).toBeVisible();
  });
});
