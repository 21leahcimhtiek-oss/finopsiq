import { test, expect } from "@playwright/test";

test.describe("Cost Dashboard E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto("/login");
    await expect(page).toHaveTitle(/FinOpsIQ/);
  });

  test("login page renders correctly", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator(".bg-red-50")).toBeVisible({ timeout: 5000 });
  });

  test("landing page has correct hero text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Cut Cloud Costs/i })).toBeVisible();
    await expect(page.getByText("AI-Powered Cloud Cost Optimization")).toBeVisible();
  });

  test("landing page has pricing section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Simple, transparent pricing")).toBeVisible();
    await expect(page.getByText("Team")).toBeVisible();
    await expect(page.getByText("Business")).toBeVisible();
    await expect(page.getByText("Enterprise")).toBeVisible();
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByPlaceholder("Acme Corp")).toBeVisible();
    await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
  });

  test("reset password page renders", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "Reset password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  });
});