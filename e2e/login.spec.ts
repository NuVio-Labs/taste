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
    await expect(page.locator("h1")).toContainText("Willkommen");
    await expect(page.getByRole("button", { name: /Login/i })).toBeVisible();
  });

  test("zeigt Fehlermeldung bei falschen Zugangsdaten", async ({ page }) => {
    await page.getByPlaceholder("name@beispiel.de").fill("falsch@example.com");
    await page.getByPlaceholder("Passwort eingeben").fill("falschesPasswort");
    await page.getByRole("button", { name: /^Login$/ }).click();

    await expect(
      page.locator("p").filter({ hasText: /fehlgeschlagen|ungültig|incorrect/i }),
    ).toBeVisible({ timeout: 8000 });
  });

  test("leitet nach erfolgreichem Login auf /dashboard weiter", async ({ page }) => {
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD nicht gesetzt");

    await page.getByPlaceholder("name@beispiel.de").fill(TEST_EMAIL);
    await page.getByPlaceholder("Passwort eingeben").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /^Login$/ }).click();

    await page.waitForURL("**/dashboard", { timeout: 12000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("Passwort-Reset-Seite ist erreichbar", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toContainText("Reset-Link");
    await expect(page.getByPlaceholder("name@beispiel.de")).toBeVisible();
  });
});
