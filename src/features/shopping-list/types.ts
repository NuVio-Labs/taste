import type { RecipeIngredient } from "../recipes/types";

export type ShoppingListPlan = "free" | "pro";

export type ShoppingListRecipeSnapshot = {
  id: string;
  ingredients: RecipeIngredient[];
  servings: number | null;
  recipeId: string;
  recipeTitle: string;
};

export type ShoppingList = {
  checkedItemKeys: string[];
  createdAt: string;
  id: string;
  name: string;
  ownerId: string;
  ownerName: string | null;
  recipes: ShoppingListRecipeSnapshot[];
  updatedAt: string;
};

export type AggregatedShoppingListItemSource = {
  amountDisplay: string;
  ingredientId: string;
  ingredientName: string;
  recipeId: string;
  recipeTitle: string;
  unit: string;
};

export type ShoppingListSharePermission = "read" | "edit";

export type ShoppingListShare = {
  id: string;
  listId: string;
  createdBy: string;
  token: string;
  permission: ShoppingListSharePermission;
  createdAt: string;
};

export type AggregatedShoppingListItem = {
  amountDisplay: string;
  displayName: string;
  isChecked: boolean;
  key: string;
  normalizedName: string;
  sourceCount: number;
  sources: AggregatedShoppingListItemSource[];
  unit: string;
};
