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
