import { queryOptions } from "@tanstack/react-query";
import {
  fetchFavoriteRecipes,
  fetchRecipeById,
  fetchRecipes,
} from "./recipeService";

export function recipesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["recipes", userId],
    queryFn: () => fetchRecipes(userId),
    enabled: Boolean(userId),
  });
}

export function favoriteRecipesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["favorite-recipes", userId],
    queryFn: () => fetchFavoriteRecipes(userId),
    enabled: Boolean(userId),
  });
}

export function recipeDetailQueryOptions(userId: string, recipeId: string) {
  return queryOptions({
    queryKey: ["recipe", userId, recipeId],
    queryFn: () => fetchRecipeById(userId, recipeId),
    enabled: Boolean(userId && recipeId),
  });
}
