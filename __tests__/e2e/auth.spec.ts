import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("register page shows form fields", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator("h1")).toContainText("Create account");
    await expect(page.locator('input[placeholder="Your full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="you@example.com"]')).toBeVisible();
    await expect(page.locator('input[placeholder="At least 6 characters"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Repeat your password"]')).toBeVisible();
  });

  test("register page shows validation error for short name", async ({ page }) => {
    await page.goto("/register");

    await page.locator('input[placeholder="Your full name"]').fill("A");
    await page.locator('input[placeholder="you@example.com"]').fill("test@test.com");
    await page.locator('input[placeholder="At least 6 characters"]').fill("pass123");
    await page.locator('input[placeholder="Repeat your password"]').fill("pass123");
    await page.locator('button[type="submit"]').click();

    await expect(page.locator("text=Name must be at least 2 characters")).toBeVisible();
  });

  test("login page shows form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h1")).toContainText("Welcome back");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Sign in");
  });

  test("login page shows validation error for invalid email", async ({ page }) => {
    await page.goto("/login");

    await page.locator('input[type="email"]').fill("a@b");
    await page.locator('input[type="password"]').fill("password123");
    await page.locator('button[type="submit"]').click({ force: true });

    await expect(page.locator("text=Enter a valid email")).toBeVisible();
  });

  test("login page has link to register", async ({ page }) => {
    await page.goto("/login");

    const registerLink = page.locator('a[href="/register"]').first();
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toContainText("Create one");
  });

  test("register page has link to login", async ({ page }) => {
    await page.goto("/register");

    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText("Sign in");
  });
});
