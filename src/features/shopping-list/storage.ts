import {
  formatRecipeIngredientAmount,
  type RecipeDetailData,
  type RecipeIngredient,
} from "../recipes/types";
import {
  createNormalizedIngredientKey,
  normalizeIngredientName,
  normalizeIngredientUnit,
} from "../recipes/ingredientNormalization";
import type {
  AggregatedShoppingListItem,
  AggregatedShoppingListItemSource,
  ShoppingList,
  ShoppingListPlan,
  ShoppingListRecipeSnapshot,
} from "./types";

const STORAGE_PREFIX = "taste.shopping-lists";

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}.${userId}`;
}

function createListId() {
  return `list-${crypto.randomUUID()}`;
}

function createRecipeSnapshotId(recipeId: string) {
  return `recipe-${recipeId}-${crypto.randomUUID()}`;
}

function parseNumericAmount(value: string) {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return null;
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatAmount(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, "");
}

function scaleIngredientAmount(
  ingredient: RecipeIngredient,
  baseServings: number | null,
  targetServings: number,
): RecipeIngredient {
  if (!baseServings || baseServings <= 0 || targetServings <= 0) {
    return ingredient;
  }

  const parsedAmount = parseNumericAmount(ingredient.amountValue);

  if (parsedAmount === null) {
    return ingredient;
  }

  const scaledValue = (parsedAmount / baseServings) * targetServings;
  const nextAmountValue = formatAmount(scaledValue);

  return {
    ...ingredient,
    amount: [nextAmountValue, ingredient.amountNote].filter(Boolean).join(" ").trim(),
    amountValue: nextAmountValue,
  };
}

function normalizeIngredients(ingredients: RecipeIngredient[]) {
  return ingredients
    .filter((ingredient) => ingredient.name.trim())
    .map((ingredient) => ({
      ...ingredient,
      amount: ingredient.amount.trim(),
      amountNote: ingredient.amountNote.trim(),
      amountValue: ingredient.amountValue.trim(),
      name: ingredient.name.trim(),
      unit: normalizeIngredientUnit(ingredient.unit),
    }));
}

function isShoppingList(value: unknown): value is ShoppingList {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ShoppingList>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    Array.isArray(candidate.recipes) &&
    Array.isArray(candidate.checkedItemKeys)
  );
}

export function getMaxShoppingListsForPlan(plan: ShoppingListPlan) {
  return plan === "pro" ? 10 : 2;
}

export function loadShoppingLists(userId: string) {
  if (!userId || typeof window === "undefined") {
    return [] as ShoppingList[];
  }

  const raw = window.localStorage.getItem(getStorageKey(userId));

  if (!raw) {
    return [] as ShoppingList[];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [] as ShoppingList[];
    }

    return parsed.filter(isShoppingList);
  } catch {
    return [] as ShoppingList[];
  }
}

export function saveShoppingLists(userId: string, lists: ShoppingList[]) {
  if (!userId || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(lists));
}

export function createShoppingList(
  userId: string,
  name: string,
  plan: ShoppingListPlan,
) {
  const existing = loadShoppingLists(userId);
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Bitte vergib einen Namen für die Liste.");
  }

  if (existing.length >= getMaxShoppingListsForPlan(plan)) {
    throw new Error(
      `Mit deinem ${plan === "pro" ? "Pro" : "Free"}-Plan sind maximal ${getMaxShoppingListsForPlan(plan)} Listen möglich.`,
    );
  }

  const now = new Date().toISOString();
  const nextList: ShoppingList = {
    checkedItemKeys: [],
    createdAt: now,
    id: createListId(),
    name: trimmedName,
    recipes: [],
    updatedAt: now,
  };

  const nextLists = [nextList, ...existing];
  saveShoppingLists(userId, nextLists);
  return nextList;
}

export function deleteShoppingList(userId: string, listId: string) {
  const nextLists = loadShoppingLists(userId).filter((list) => list.id !== listId);
  saveShoppingLists(userId, nextLists);
  return nextLists;
}

export function renameShoppingList(userId: string, listId: string, name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Bitte vergib einen Namen für die Liste.");
  }

  const nextLists = loadShoppingLists(userId).map((list) =>
    list.id === listId
      ? {
          ...list,
          name: trimmedName,
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

  saveShoppingLists(userId, nextLists);
  return nextLists;
}

export function addRecipeToShoppingList(
  userId: string,
  listId: string,
  recipe: Pick<RecipeDetailData, "id" | "ingredients" | "servings" | "title">,
  targetServings: number,
) {
  const existing = loadShoppingLists(userId);
  const nextLists = existing.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    const nextRecipe: ShoppingListRecipeSnapshot = {
      id: createRecipeSnapshotId(recipe.id),
      ingredients: normalizeIngredients(recipe.ingredients).map((ingredient) =>
        scaleIngredientAmount(ingredient, recipe.servings, targetServings),
      ),
      servings: targetServings,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
    };

    return {
      ...list,
      recipes: [...list.recipes, nextRecipe],
      updatedAt: new Date().toISOString(),
    };
  });

  saveShoppingLists(userId, nextLists);
  return nextLists;
}

export function toggleShoppingListItemChecked(
  userId: string,
  listId: string,
  itemKey: string,
) {
  const existing = loadShoppingLists(userId);
  const nextLists = existing.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    const isChecked = list.checkedItemKeys.includes(itemKey);

    return {
      ...list,
      checkedItemKeys: isChecked
        ? list.checkedItemKeys.filter((key) => key !== itemKey)
        : [...list.checkedItemKeys, itemKey],
      updatedAt: new Date().toISOString(),
    };
  });

  saveShoppingLists(userId, nextLists);
  return nextLists;
}

export function updateShoppingListRecipeServings(
  userId: string,
  listId: string,
  shoppingListRecipeId: string,
  targetServings: number,
) {
  if (!Number.isFinite(targetServings) || targetServings < 1) {
    throw new Error("Bitte wähle mindestens 1 Portion.");
  }

  const existing = loadShoppingLists(userId);
  const nextLists = existing.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    return {
      ...list,
      recipes: list.recipes.map((recipe) => {
        if (recipe.id !== shoppingListRecipeId) {
          return recipe;
        }

        return {
          ...recipe,
          ingredients: recipe.ingredients.map((ingredient) =>
            scaleIngredientAmount(ingredient, recipe.servings, targetServings),
          ),
          servings: targetServings,
        };
      }),
      updatedAt: new Date().toISOString(),
    };
  });

  saveShoppingLists(userId, nextLists);
  return nextLists;
}

export function removeRecipeFromShoppingList(
  userId: string,
  listId: string,
  shoppingListRecipeId: string,
) {
  const existing = loadShoppingLists(userId);
  const nextLists = existing.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    return {
      ...list,
      recipes: list.recipes.filter((recipe) => recipe.id !== shoppingListRecipeId),
      updatedAt: new Date().toISOString(),
    };
  });

  saveShoppingLists(userId, nextLists);
  return nextLists;
}

export function aggregateShoppingListItems(list: ShoppingList) {
  const bucket = new Map<
    string,
    {
      displayName: string;
      name: string;
      numericTotal: number;
      numericValuesCount: number;
      sources: AggregatedShoppingListItemSource[];
      unit: string;
    }
  >();

  for (const recipe of list.recipes) {
    for (const ingredient of recipe.ingredients) {
      const ingredientName = ingredient.name.trim();

      if (!ingredientName) {
        continue;
      }

      const normalizedName = normalizeIngredientName(ingredientName);
      const unit = normalizeIngredientUnit(ingredient.unit);
      const key = createNormalizedIngredientKey(ingredientName, unit);
      const parsedAmount = parseNumericAmount(ingredient.amountValue);
      const source: AggregatedShoppingListItemSource = {
        amountDisplay: formatRecipeIngredientAmount(ingredient),
        ingredientId: ingredient.id,
        ingredientName,
        recipeId: recipe.recipeId,
        recipeTitle: recipe.recipeTitle,
        unit,
      };

      const existing = bucket.get(key);

      if (existing) {
        existing.sources.push(source);

        if (parsedAmount !== null) {
          existing.numericTotal += parsedAmount;
          existing.numericValuesCount += 1;
        }

        continue;
      }

      bucket.set(key, {
        displayName: ingredientName,
        name: normalizedName,
        numericTotal: parsedAmount ?? 0,
        numericValuesCount: parsedAmount !== null ? 1 : 0,
        sources: [source],
        unit,
      });
    }
  }

  const items: AggregatedShoppingListItem[] = Array.from(bucket.entries())
    .map(([key, value]) => {
      const hasOnlyNumericSources = value.numericValuesCount === value.sources.length;
      const amountDisplay = hasOnlyNumericSources
        ? formatAmount(value.numericTotal)
        : value.sources
            .map((source) => source.amountDisplay)
            .filter(Boolean)
            .join(" + ");

      return {
        amountDisplay,
        displayName: value.displayName,
        isChecked: list.checkedItemKeys.includes(key),
        key,
        normalizedName: value.name,
        sourceCount: value.sources.length,
        sources: value.sources,
        unit: value.unit,
      };
    })
    .sort((left, right) => left.displayName.localeCompare(right.displayName, "de"));

  return items;
}
