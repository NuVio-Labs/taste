import { test, expect } from "@playwright/test";

// Diese Tests setzen voraus, dass gültige Testcredentials in den Env-Vars stehen:
// E2E_TEST_EMAIL & E2E_TEST_PASSWORD
// In CI: als Secrets hinterlegen. Lokal: .env.test anlegen (nicht committen).

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";

test.describe("Login-Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("zeigt die Login-Seite korrekt an", async ({ page }) => {
    await expect(page.getByTestId("auth-title")).toHaveText("Willkommen");
    await expect(page.getByTestId("login-email-input")).toBeVisible();
    await expect(page.getByTestId("login-password-input")).toBeVisible();
    await expect(page.getByTestId("login-submit-button")).toBeVisible();
  });

  test("zeigt Fehlermeldung bei falschen Zugangsdaten", async ({ page }) => {
    await page.getByTestId("login-email-input").fill("falsch@example.com");
    await page.getByTestId("login-password-input").fill("falschesPasswort");
    await page.getByTestId("login-submit-button").click();

    await expect(page.getByTestId("login-error")).toContainText(
      /fehlgeschlagen|ungültig|invalid|incorrect/i,
      { timeout: 8000 },
    );
  });

  test("leitet nach erfolgreichem Login auf /dashboard weiter", async ({ page }) => {
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD nicht gesetzt");

    await page.getByTestId("login-email-input").fill(TEST_EMAIL);
    await page.getByTestId("login-password-input").fill(TEST_PASSWORD);
    await page.getByTestId("login-submit-button").click();

    await page.waitForURL("**/dashboard", { timeout: 12000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("Passwort-Reset-Seite ist aus dem Login erreichbar", async ({ page }) => {
    await page.getByTestId("forgot-password-link").click();

    await page.waitForURL("**/forgot-password");
    await expect(page.getByTestId("forgot-password-title")).toContainText("Reset-Link");
    await expect(page.getByTestId("forgot-password-email-input")).toBeVisible();
    await expect(page.getByTestId("forgot-password-submit-button")).toBeVisible();
  });
});
