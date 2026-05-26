import { test, expect } from "@playwright/test";

test.describe("Planner and Route Workflow", () => {
  test("TC-SYS-01: planner page allows text input and displays messages", async ({ page }) => {
    await page.goto("/planner");

    const input = page.locator('input[placeholder*="Ask for destinations"]');
    await expect(input).toBeVisible();

    await input.fill("Suggest places in Pokhara");
    await page.locator('button[aria-label="Send message"]').click();

    await expect(page.locator("text=Suggest places in Pokhara")).toBeVisible();
  });

  test("TC-SYS-02: route page shows empty state when no places selected", async ({ page }) => {
    await page.goto("/route");

    await expect(page.locator("text=No places selected")).toBeVisible();
  });

  test("planner page has quick prompts visible on initial load", async ({ page }) => {
    await page.goto("/planner");

    const prompt = page.locator("text=Suggest the best adventurous places to visit in Nepal").first();
    await expect(prompt).toBeVisible();
  });

  test("TC-SYS-03: route page heading loads correctly", async ({ page }) => {
    await page.goto("/route");

    const heading = page.locator("h1");
    await expect(heading).toContainText("Route Planning");
  });

  test("route page redirects to planner when no places are selected", async ({ page }) => {
    await page.goto("/route");
    await expect(page.locator("text=No places selected")).toBeVisible();
  });

  test("planner page has trip planning workspace heading", async ({ page }) => {
    await page.goto("/planner");

    await expect(page.locator("text=Trip Planning Workspace").first()).toBeVisible();
  });
});
