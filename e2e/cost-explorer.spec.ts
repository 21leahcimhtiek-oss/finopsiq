import { test, expect } from "@playwright/test";

test.describe("Cost Explorer", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto("/login");
    await page.fill('input[type="email"]', process.env.E2E_USER_EMAIL ?? "test@example.com");
    await page.fill('input[type="password"]', process.env.E2E_USER_PASSWORD ?? "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("dashboard loads with cost charts", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.locator('[data-testid="spend-summary"]')).toBeVisible();
  });

  test("costs page displays cost records table", async ({ page }) => {
    await page.goto("/costs");
    await expect(page.locator("h1")).toContainText("Cost Explorer");
    await expect(page.locator("table")).toBeVisible();
  });

  test("anomalies page shows anomaly cards", async ({ page }) => {
    await page.goto("/anomalies");
    await expect(page.locator("h1")).toContainText("Anomalies");
  });

  test("budgets page displays budget progress bars", async ({ page }) => {
    await page.goto("/budgets");
    await expect(page.locator("h1")).toContainText("Budgets");
  });

  test("can navigate sidebar links", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('a[href="/costs"]');
    await expect(page).toHaveURL("/costs");
    await page.click('a[href="/anomalies"]');
    await expect(page).toHaveURL("/anomalies");
    await page.click('a[href="/recommendations"]');
    await expect(page).toHaveURL("/recommendations");
  });
});