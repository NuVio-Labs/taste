import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";

// Hilfsfunktion: Login durchführen
async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("name@beispiel.de").fill(TEST_EMAIL);
  await page.getByPlaceholder("Passwort eingeben").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /^Login$/ }).click();
  await page.waitForURL("**/dashboard", { timeout: 12000 });
}

test.describe("Rezepte-Flow", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD nicht gesetzt");
    await login(page);
  });

  test("Rezepte-Seite ist nach Login erreichbar", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.locator("h1")).toContainText(/Rezepte/i);
  });

  test("Favoriten-Seite ist nach Login erreichbar", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page.locator("h1")).toContainText(/Favoriten/i);
  });

  test("Einkaufsliste-Seite ist nach Login erreichbar", async ({ page }) => {
    await page.goto("/shopping-list");
    await expect(page.locator("h1")).toContainText(/Einkaufsliste/i);
  });

  test("Profil-Seite ist nach Login erreichbar", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("h1")).toContainText(/Profil/i);
  });

  test("eine neue Einkaufsliste kann angelegt werden", async ({ page }) => {
    await page.goto("/shopping-list");

    const listNameInput = page.getByPlaceholder(/Neue Liste/i);
    await listNameInput.fill("E2E-Testliste");
    await page.getByRole("button", { name: /Liste anlegen/i }).click();

    await expect(page.getByText("E2E-Testliste")).toBeVisible({ timeout: 5000 });
  });

  test("wird auf /login weitergeleitet wenn nicht eingeloggt", async ({ page }) => {
    // Neue Seite ohne Session
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 8000 });
    expect(page.url()).toContain("/login");
  });
});
