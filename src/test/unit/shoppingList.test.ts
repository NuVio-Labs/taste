import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createShoppingList,
  deleteShoppingList,
  renameShoppingList,
  loadShoppingLists,
  clearShoppingList,
  getMaxShoppingListsForPlan,
  addRecipeToShoppingList,
  resetShoppingListChecks,
  toggleShoppingListItemChecked,
  aggregateShoppingListItems,
} from "../../features/shopping-list/storage";

const TEST_USER_ID = "test-user-123";

// Mock localStorage with jsdom (already available via vitest jsdom environment)
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Plan limits
// ---------------------------------------------------------------------------

describe("getMaxShoppingListsForPlan", () => {
  it("gibt 2 für Free-Plan zurück", () => {
    expect(getMaxShoppingListsForPlan("free")).toBe(2);
  });

  it("gibt 10 für Pro-Plan zurück", () => {
    expect(getMaxShoppingListsForPlan("pro")).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// createShoppingList
// ---------------------------------------------------------------------------

describe("createShoppingList", () => {
  it("erstellt eine neue Liste mit Namen", () => {
    const list = createShoppingList(TEST_USER_ID, "Wocheneinkauf", "free");
    expect(list.name).toBe("Wocheneinkauf");
    expect(list.id).toMatch(/^list-/);
    expect(list.recipes).toEqual([]);
    expect(list.checkedItemKeys).toEqual([]);
  });

  it("trimmt Leerzeichen im Namen", () => {
    const list = createShoppingList(TEST_USER_ID, "  Einkauf  ", "free");
    expect(list.name).toBe("Einkauf");
  });

  it("wirft bei leerem Namen", () => {
    expect(() => createShoppingList(TEST_USER_ID, "", "free")).toThrow(
      "Bitte vergib einen Namen",
    );
  });

  it("wirft bei nur Leerzeichen als Name", () => {
    expect(() => createShoppingList(TEST_USER_ID, "   ", "free")).toThrow(
      "Bitte vergib einen Namen",
    );
  });

  it("wirft bei Plan-Limit (Free: 2 Listen)", () => {
    createShoppingList(TEST_USER_ID, "Liste 1", "free");
    createShoppingList(TEST_USER_ID, "Liste 2", "free");
    expect(() => createShoppingList(TEST_USER_ID, "Liste 3", "free")).toThrow(
      "2 Listen",
    );
  });

  it("erlaubt mehr Listen mit Pro-Plan", () => {
    for (let i = 1; i <= 5; i++) {
      createShoppingList(TEST_USER_ID, `Liste ${i}`, "pro");
    }
    const lists = loadShoppingLists(TEST_USER_ID);
    expect(lists.length).toBe(5);
  });

  it("neue Liste erscheint als erstes in der gespeicherten Reihenfolge", () => {
    createShoppingList(TEST_USER_ID, "Erste", "free");
    createShoppingList(TEST_USER_ID, "Zweite", "free");
    const lists = loadShoppingLists(TEST_USER_ID);
    expect(lists[0].name).toBe("Zweite");
  });
});

// ---------------------------------------------------------------------------
// deleteShoppingList
// ---------------------------------------------------------------------------

describe("deleteShoppingList", () => {
  it("entfernt eine Liste anhand ihrer ID", () => {
    const list = createShoppingList(TEST_USER_ID, "Zu löschen", "free");
    deleteShoppingList(TEST_USER_ID, list.id);
    const remaining = loadShoppingLists(TEST_USER_ID);
    expect(remaining.find((l) => l.id === list.id)).toBeUndefined();
  });

  it("lässt andere Listen unberührt", () => {
    const keepList = createShoppingList(TEST_USER_ID, "Behalten", "free");
    const deleteList = createShoppingList(TEST_USER_ID, "Löschen", "free");
    deleteShoppingList(TEST_USER_ID, deleteList.id);
    const remaining = loadShoppingLists(TEST_USER_ID);
    expect(remaining.find((l) => l.id === keepList.id)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// renameShoppingList
// ---------------------------------------------------------------------------

describe("renameShoppingList", () => {
  it("benennt eine Liste um", () => {
    const list = createShoppingList(TEST_USER_ID, "Alt", "free");
    const updated = renameShoppingList(TEST_USER_ID, list.id, "Neu");
    expect(updated.find((l) => l.id === list.id)?.name).toBe("Neu");
  });

  it("wirft bei leerem Namen", () => {
    const list = createShoppingList(TEST_USER_ID, "Alt", "free");
    expect(() => renameShoppingList(TEST_USER_ID, list.id, "")).toThrow(
      "Bitte vergib einen Namen",
    );
  });
});

// ---------------------------------------------------------------------------
// addRecipeToShoppingList
// ---------------------------------------------------------------------------

const mockRecipe = {
  id: "recipe-abc",
  title: "Pasta",
  servings: 2,
  ingredients: [
    {
      id: "ing-1",
      name: "Nudeln",
      amount: "200",
      amountValue: "200",
      amountNote: "",
      unit: "g",
    },
    {
      id: "ing-2",
      name: "Salz",
      amount: "1",
      amountValue: "1",
      amountNote: "",
      unit: "TL",
    },
  ],
};

describe("addRecipeToShoppingList", () => {
  it("fügt ein Rezept zur Liste hinzu", () => {
    const list = createShoppingList(TEST_USER_ID, "Kochwoche", "free");
    const updatedLists = addRecipeToShoppingList(
      TEST_USER_ID,
      list.id,
      mockRecipe,
      2,
    );
    const updatedList = updatedLists.find((l) => l.id === list.id);
    expect(updatedList?.recipes.length).toBe(1);
    expect(updatedList?.recipes[0].recipeTitle).toBe("Pasta");
  });

  it("skaliert Zutatenmengen bei abweichenden Portionen", () => {
    const list = createShoppingList(TEST_USER_ID, "Kochwoche", "free");
    // Originalrezept für 2, wir wollen 4 Portionen
    const updatedLists = addRecipeToShoppingList(
      TEST_USER_ID,
      list.id,
      mockRecipe,
      4,
    );
    const updatedList = updatedLists.find((l) => l.id === list.id);
    const nudeln = updatedList?.recipes[0].ingredients.find(
      (i) => i.name === "Nudeln",
    );
    // 200g für 2 Portionen → 400g für 4 Portionen
    expect(nudeln?.amountValue).toBe("400");
  });
});

// ---------------------------------------------------------------------------
// toggleShoppingListItemChecked
// ---------------------------------------------------------------------------

describe("toggleShoppingListItemChecked", () => {
  it("markiert einen Eintrag als abgehakt", () => {
    const list = createShoppingList(TEST_USER_ID, "Testliste", "free");
    const updated = toggleShoppingListItemChecked(TEST_USER_ID, list.id, "nudeln__g");
    const updatedList = updated.find((l) => l.id === list.id);
    expect(updatedList?.checkedItemKeys).toContain("nudeln__g");
  });

  it("hebt Abhaken wieder auf (Toggle)", () => {
    const list = createShoppingList(TEST_USER_ID, "Testliste", "free");
    toggleShoppingListItemChecked(TEST_USER_ID, list.id, "nudeln__g");
    const unchecked = toggleShoppingListItemChecked(TEST_USER_ID, list.id, "nudeln__g");
    const updatedList = unchecked.find((l) => l.id === list.id);
    expect(updatedList?.checkedItemKeys).not.toContain("nudeln__g");
  });
});

// ---------------------------------------------------------------------------
// aggregateShoppingListItems
// ---------------------------------------------------------------------------

describe("aggregateShoppingListItems", () => {
  it("aggregiert gleiche Zutaten aus mehreren Rezepteinträgen", () => {
    const list = createShoppingList(TEST_USER_ID, "Aggregiert", "free");
    const updatedLists1 = addRecipeToShoppingList(
      TEST_USER_ID,
      list.id,
      mockRecipe,
      2,
    );
    const addedList1 = updatedLists1.find((l) => l.id === list.id);

    // Zweites Mal dasselbe Rezept hinzufügen
    const updatedLists2 = addRecipeToShoppingList(
      TEST_USER_ID,
      list.id,
      mockRecipe,
      2,
    );
    const addedList2 = updatedLists2.find((l) => l.id === list.id);

    if (!addedList2) throw new Error("Liste nicht gefunden");
    const items = aggregateShoppingListItems(addedList2);

    const nudeln = items.find((i) => i.displayName === "Nudeln");
    // 200 + 200 = 400
    expect(nudeln?.amountDisplay).toBe("400");
    expect(nudeln?.sourceCount).toBe(2);

    // Sicherstellen dass kein Warning aus addedList1
    expect(addedList1).toBeDefined();
  });

  it("sortiert Einträge alphabetisch", () => {
    const list = createShoppingList(TEST_USER_ID, "Sortiert", "free");
    addRecipeToShoppingList(TEST_USER_ID, list.id, mockRecipe, 2);
    const lists = loadShoppingLists(TEST_USER_ID);
    const targetList = lists.find((l) => l.id === list.id);
    if (!targetList) throw new Error("Liste nicht gefunden");

    const items = aggregateShoppingListItems(targetList);
    const names = items.map((i) => i.displayName);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "de")));
  });

  it("markiert abgehakte Einträge korrekt", () => {
    const list = createShoppingList(TEST_USER_ID, "Checked", "free");
    addRecipeToShoppingList(TEST_USER_ID, list.id, mockRecipe, 2);
    const lists = loadShoppingLists(TEST_USER_ID);
    const targetList = lists.find((l) => l.id === list.id);
    if (!targetList) throw new Error("Liste nicht gefunden");

    const items = aggregateShoppingListItems(targetList);
    const nudelnKey = items.find((i) => i.displayName === "Nudeln")?.key ?? "";

    toggleShoppingListItemChecked(TEST_USER_ID, list.id, nudelnKey);
    const updatedLists = loadShoppingLists(TEST_USER_ID);
    const updatedList = updatedLists.find((l) => l.id === list.id);
    if (!updatedList) throw new Error("Liste nicht gefunden");

    const itemsAfter = aggregateShoppingListItems(updatedList);
    const nudeln = itemsAfter.find((i) => i.displayName === "Nudeln");
    expect(nudeln?.isChecked).toBe(true);
  });

  it("sortiert abgehakte Einträge ans Ende", () => {
    const list = createShoppingList(TEST_USER_ID, "Sort by checked", "free");
    addRecipeToShoppingList(TEST_USER_ID, list.id, mockRecipe, 2);
    const initialLists = loadShoppingLists(TEST_USER_ID);
    const targetList = initialLists.find((l) => l.id === list.id);
    if (!targetList) throw new Error("Liste nicht gefunden");

    const items = aggregateShoppingListItems(targetList);
    const nudelnKey = items.find((i) => i.displayName === "Nudeln")?.key ?? "";
    toggleShoppingListItemChecked(TEST_USER_ID, list.id, nudelnKey);

    const updatedList = loadShoppingLists(TEST_USER_ID).find((l) => l.id === list.id);
    if (!updatedList) throw new Error("Liste nicht gefunden");

    const reorderedItems = aggregateShoppingListItems(updatedList);
    expect(reorderedItems[0]?.displayName).toBe("Salz");
    expect(reorderedItems[1]?.displayName).toBe("Nudeln");
    expect(reorderedItems[1]?.isChecked).toBe(true);
  });

  it("führt Stück-Angaben mit unterschiedlichen Schreibweisen zusammen", () => {
    const list = createShoppingList(TEST_USER_ID, "Einheiten", "free");
    const recipe = {
      id: "recipe-units",
      title: "Gemüse",
      servings: 2,
      ingredients: [
        {
          id: "ing-1",
          name: "Zwiebeln",
          amount: "2",
          amountValue: "2",
          amountNote: "",
          unit: "Stk.",
        },
        {
          id: "ing-2",
          name: "Zwiebel",
          amount: "1",
          amountValue: "1",
          amountNote: "",
          unit: "Stück",
        },
      ],
    };

    const updatedLists = addRecipeToShoppingList(TEST_USER_ID, list.id, recipe, 2);
    const updatedList = updatedLists.find((l) => l.id === list.id);
    if (!updatedList) throw new Error("Liste nicht gefunden");

    const items = aggregateShoppingListItems(updatedList);
    const zwiebel = items.find((i) => i.displayName === "Zwiebeln");
    expect(zwiebel?.amountDisplay).toBe("3");
    expect(zwiebel?.unit).toBe("Stk.");
    expect(zwiebel?.sourceCount).toBe(2);
    expect(zwiebel?.normalizedName).toBe("zwiebel");
    expect(zwiebel?.sources[0]?.ingredientName).toBe("Zwiebeln");
  });

  it("behält Einträge ohne numerische Menge über die Einheit in der Liste", () => {
    const list = createShoppingList(TEST_USER_ID, "Bedarf", "free");
    const recipe = {
      id: "recipe-needs",
      title: "Salat",
      servings: 2,
      ingredients: [
        {
          id: "ing-1",
          name: "Salz",
          amount: "",
          amountValue: "",
          amountNote: "",
          unit: "nach Bedarf",
        },
      ],
    };

    const updatedLists = addRecipeToShoppingList(TEST_USER_ID, list.id, recipe, 2);
    const updatedList = updatedLists.find((l) => l.id === list.id);
    if (!updatedList) throw new Error("Liste nicht gefunden");

    const items = aggregateShoppingListItems(updatedList);
    const salz = items.find((i) => i.displayName === "Salz");
    expect(salz?.amountDisplay).toBe("");
    expect(salz?.unit).toBe("nach Bedarf");
    expect(salz?.sourceCount).toBe(1);
  });

  it("führt Singular und Plural bei typischen Zutaten heuristisch zusammen", () => {
    const list = createShoppingList(TEST_USER_ID, "Lemmata", "free");
    const recipe = {
      id: "recipe-lemma",
      title: "Suppe",
      servings: 2,
      ingredients: [
        {
          id: "ing-1",
          name: "Tomaten",
          amount: "2",
          amountValue: "2",
          amountNote: "",
          unit: "Stk.",
        },
        {
          id: "ing-2",
          name: "Tomate",
          amount: "1",
          amountValue: "1",
          amountNote: "",
          unit: "Stück",
        },
      ],
    };

    const updatedLists = addRecipeToShoppingList(TEST_USER_ID, list.id, recipe, 2);
    const updatedList = updatedLists.find((l) => l.id === list.id);
    if (!updatedList) throw new Error("Liste nicht gefunden");

    const items = aggregateShoppingListItems(updatedList);
    const tomate = items.find((i) => i.displayName === "Tomaten");
    expect(tomate?.amountDisplay).toBe("3");
    expect(tomate?.unit).toBe("Stk.");
    expect(tomate?.sourceCount).toBe(2);
    expect(tomate?.normalizedName).toBe("tomate");
  });

  it("normalisiert beschreibende Varianten wie gehackte und stückige Tomaten", () => {
    const list = createShoppingList(TEST_USER_ID, "Varianten", "free");
    const recipe = {
      id: "recipe-variants",
      title: "Sauce",
      servings: 2,
      ingredients: [
        {
          id: "ing-1",
          name: "gehackte Tomaten",
          amount: "1",
          amountValue: "1",
          amountNote: "",
          unit: "Dose",
        },
        {
          id: "ing-2",
          name: "stückige Tomate",
          amount: "2",
          amountValue: "2",
          amountNote: "",
          unit: "Dosen",
        },
      ],
    };

    const updatedLists = addRecipeToShoppingList(TEST_USER_ID, list.id, recipe, 2);
    const updatedList = updatedLists.find((l) => l.id === list.id);
    if (!updatedList) throw new Error("Liste nicht gefunden");

    const items = aggregateShoppingListItems(updatedList);
    const tomaten = items.find((i) => i.displayName === "gehackte Tomaten");
    expect(tomaten?.amountDisplay).toBe("3");
    expect(tomaten?.unit).toBe("Dose");
    expect(tomaten?.sourceCount).toBe(2);
    expect(tomaten?.sources[1]?.ingredientName).toBe("stückige Tomate");
  });
});

describe("shopping list completion actions", () => {
  it("setzt alle Haken einer Liste zurück", () => {
    const list = createShoppingList(TEST_USER_ID, "Reset", "free");
    addRecipeToShoppingList(TEST_USER_ID, list.id, mockRecipe, 2);
    toggleShoppingListItemChecked(TEST_USER_ID, list.id, "nudeln__g");
    toggleShoppingListItemChecked(TEST_USER_ID, list.id, "salz__tl");

    const updatedLists = resetShoppingListChecks(TEST_USER_ID, list.id);
    const updatedList = updatedLists.find((l) => l.id === list.id);
    expect(updatedList?.checkedItemKeys).toEqual([]);
    expect(updatedList?.recipes.length).toBe(1);
  });

  it("leert eine abgearbeitete Liste vollständig", () => {
    const list = createShoppingList(TEST_USER_ID, "Clear", "free");
    addRecipeToShoppingList(TEST_USER_ID, list.id, mockRecipe, 2);
    toggleShoppingListItemChecked(TEST_USER_ID, list.id, "nudeln__g");

    const updatedLists = clearShoppingList(TEST_USER_ID, list.id);
    const updatedList = updatedLists.find((l) => l.id === list.id);
    expect(updatedList?.checkedItemKeys).toEqual([]);
    expect(updatedList?.recipes).toEqual([]);
  });
});
