import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";

// Hilfsfunktion: Login durchführen
async function login(page: Page) {
  await page.goto("/login");
  await page.getByTestId("login-email-input").fill(TEST_EMAIL);
  await page.getByTestId("login-password-input").fill(TEST_PASSWORD);
  await page.getByTestId("login-submit-button").click();
  await page.waitForURL("**/dashboard", { timeout: 12000 });
}

async function createRecipe(page: Page, title: string, description?: string) {
  await page.goto("/dashboard");
  await page.getByTestId("open-create-recipe-button").click();

  await expect(page.getByTestId("recipe-create-modal")).toBeVisible();
  await expect(page.getByTestId("recipe-modal-title")).toHaveText("Neues Rezept erstellen");

  await page.getByTestId("recipe-title-input").fill(title);
  await page
    .getByTestId("recipe-description-input")
    .fill(description ?? "Ein per E2E angelegtes Testrezept mit stabilen Pflichtfeldern.");
  await page.getByTestId("recipe-category-input").fill("E2E");
  await page.getByTestId("recipe-prep-time-input").fill("15");
  await page.getByTestId("recipe-prep-time-unit-select").selectOption("minutes");
  await page.getByTestId("recipe-servings-input").fill("2");
  await page.getByTestId("recipe-visibility-select").selectOption("private");
  await page.getByTestId("ingredient-name-input-0").fill("Nudeln");
  await page.getByTestId("ingredient-amount-input-0").fill("250");
  await page.getByTestId("ingredient-unit-select-0").selectOption("g");
  await page.getByTestId("step-textarea-0").fill("Alle Zutaten vermengen und kurz garen.");

  await page.getByTestId("recipe-submit-button").click();
  await expect(page.getByTestId("recipe-create-modal")).toBeHidden({ timeout: 12000 });
}

test.describe("Rezepte-Flow mit Login", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD nicht gesetzt");
    await login(page);
  });

  test("Rezepte-Seite ist nach Login erreichbar", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.locator("h1")).toContainText(/Rezepte/i);
  });

  test("ein neues Rezept kann erstellt werden", async ({ page }) => {
    const uniqueTitle = `E2E Rezept ${Date.now()}`;

    await createRecipe(page, uniqueTitle);

    await page.goto("/recipes");
    await page.getByTestId("recipe-search-input").fill(uniqueTitle);
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 12000 });
  });

  test("ein Rezept kann bearbeitet werden", async ({ page }) => {
    const originalTitle = `E2E Edit ${Date.now()}`;
    const updatedTitle = `${originalTitle} aktualisiert`;

    await createRecipe(page, originalTitle, "Originalbeschreibung für den E2E-Bearbeiten-Flow.");

    await page.goto("/recipes");
    await page.getByTestId("recipe-search-input").fill(originalTitle);
    await page.getByRole("button", { name: `Rezept öffnen: ${originalTitle}` }).click();

    await expect(page.getByTestId("recipe-detail-title")).toHaveText(originalTitle);
    await page.getByTestId("recipe-edit-button").click();

    await expect(page.getByTestId("recipe-create-modal")).toBeVisible();
    await expect(page.getByTestId("recipe-modal-title")).toHaveText("Rezept bearbeiten");

    await page.getByTestId("recipe-title-input").fill(updatedTitle);
    await page
      .getByTestId("recipe-description-input")
      .fill("Aktualisierte Beschreibung für den E2E-Bearbeiten-Flow.");
    await page.getByTestId("recipe-submit-button").click();

    await expect(page.getByTestId("recipe-create-modal")).toBeHidden({ timeout: 12000 });
    await expect(page.getByTestId("recipe-detail-title")).toHaveText(updatedTitle, {
      timeout: 12000,
    });
    await expect(page.getByText("Aktualisierte Beschreibung für den E2E-Bearbeiten-Flow.")).toBeVisible();
  });

  test("ein Rezept kann gelikt werden", async ({ page }) => {
    const title = `E2E Like ${Date.now()}`;

    await createRecipe(page, title, "Beschreibung für den E2E-Like-Flow.");

    await page.goto("/recipes");
    await page.getByTestId("recipe-search-input").fill(title);
    await page.getByRole("button", { name: `Rezept öffnen: ${title}` }).click();

    const likeButton = page.getByTestId("recipe-detail-like-button");

    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    await likeButton.click();
    await expect(likeButton).toHaveAttribute("aria-pressed", "true", {
      timeout: 12000,
    });
  });

  test("ein Rezept kann favorisiert werden", async ({ page }) => {
    const title = `E2E Favorite ${Date.now()}`;

    await createRecipe(page, title, "Beschreibung für den E2E-Favoriten-Flow.");

    await page.goto("/recipes");
    await page.getByTestId("recipe-search-input").fill(title);
    await page.getByRole("button", { name: `Rezept öffnen: ${title}` }).click();

    const favoriteButton = page.getByTestId("recipe-detail-favorite-button");

    await expect(favoriteButton).toHaveAttribute("aria-pressed", "false");
    await favoriteButton.click();
    await expect(favoriteButton).toHaveAttribute("aria-pressed", "true", {
      timeout: 12000,
    });
  });

  test("die Favoriten-Seite zeigt favorisierte Rezepte", async ({ page }) => {
    const title = `E2E Favorites Page ${Date.now()}`;

    await createRecipe(page, title, "Beschreibung für den E2E-Favoritenseiten-Flow.");

    await page.goto("/recipes");
    await page.getByTestId("recipe-search-input").fill(title);
    await page.getByRole("button", { name: `Rezept öffnen: ${title}` }).click();

    const favoriteButton = page.getByTestId("recipe-detail-favorite-button");
    await expect(favoriteButton).toHaveAttribute("aria-pressed", "false");
    await favoriteButton.click();
    await expect(favoriteButton).toHaveAttribute("aria-pressed", "true", {
      timeout: 12000,
    });

    await page.goto("/favorites");
    await page.getByTestId("recipe-search-input").fill(title);
    await expect(page.getByText(title)).toBeVisible({ timeout: 12000 });

    await page.getByRole("button", { name: `Rezept öffnen: ${title}` }).click();
    await expect(page.getByTestId("recipe-detail-title")).toHaveText(title);
  });

  test("ein Rezept kann zur Einkaufsliste hinzugefügt werden", async ({ page }) => {
    const recipeTitle = `E2E Shopping ${Date.now()}`;
    const listName = `E2E Liste ${Date.now()}`;

    await page.goto("/shopping-list");
    await page.getByTestId("shopping-list-name-input").fill(listName);
    await page.getByTestId("shopping-list-create-button").click();
    await expect(page.getByRole("heading", { name: listName })).toBeVisible({
      timeout: 5000,
    });

    await createRecipe(page, recipeTitle, "Beschreibung für den E2E-Einkaufslisten-Flow.");

    await page.goto("/recipes");
    await page.getByTestId("recipe-search-input").fill(recipeTitle);
    await page.getByRole("button", { name: `Rezept öffnen: ${recipeTitle}` }).click();

    await page.getByTestId("recipe-detail-add-to-shopping-list-button").click();
    await expect(page.getByTestId("shopping-list-picker-dialog")).toBeVisible();
    await page
      .getByTestId("shopping-list-picker-dialog")
      .getByRole("button", { name: new RegExp(listName) })
      .click();
    await page.getByTestId("shopping-list-picker-confirm-button").click();
    await expect(page.getByTestId("shopping-list-picker-dialog")).toBeHidden({
      timeout: 12000,
    });

    await page.goto("/shopping-list");
    await expect(page.getByRole("heading", { name: listName })).toBeVisible({
      timeout: 12000,
    });
    await expect(page.getByText("Nudeln")).toBeVisible({ timeout: 12000 });

    const toggleButton = page
      .locator('[data-testid^="shopping-list-item-toggle-"]')
      .first();
    await toggleButton.click();
    await expect(toggleButton).toHaveClass(/bg-\[#D6A84A\]/);
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

    await expect(
      page.getByRole("heading", { name: "E2E-Testliste" }),
    ).toBeVisible({ timeout: 5000 });
  });

  test("das Profil kann gespeichert werden", async ({ page }) => {
    const updatedUsername = `E2E Profil ${Date.now()}`;

    await page.goto("/profile");
    await page.getByTestId("profile-username-input").fill(updatedUsername);
    await page.getByTestId("profile-avatar-url-input").fill("");
    await page.getByTestId("profile-save-button").click();

    await expect(page.getByTestId("profile-save-success")).toContainText(
      "Profil erfolgreich gespeichert.",
      { timeout: 12000 },
    );
    await expect(page.getByText(updatedUsername)).toBeVisible({ timeout: 12000 });
  });
});

test.describe("Rezepte-Flow ohne Login", () => {
  test("wird auf /login weitergeleitet wenn nicht eingeloggt", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 8000 });
    expect(page.url()).toContain("/login");
  });
});
