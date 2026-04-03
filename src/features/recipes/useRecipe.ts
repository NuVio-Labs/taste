import { useQuery, useQueryClient } from "@tanstack/react-query";
import { recipeDetailQueryOptions } from "./queryOptions";
import type { RecipeDetailData } from "./types";

type UseRecipeResult = {
  error: string | null;
  isLoading: boolean;
  recipe: RecipeDetailData | null;
  reload: () => Promise<void>;
};

export function useRecipe(userId: string, recipeId: string): UseRecipeResult {
  const queryClient = useQueryClient();
  const query = useQuery(recipeDetailQueryOptions(userId, recipeId));

  return {
    recipe: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    reload: async () => {
      await queryClient.invalidateQueries({
        queryKey: recipeDetailQueryOptions(userId, recipeId).queryKey,
      });
    },
  };
}
