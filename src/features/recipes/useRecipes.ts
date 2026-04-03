import { useQuery, useQueryClient } from "@tanstack/react-query";
import { recipesQueryOptions } from "./queryOptions";
import type { RecipeListItem } from "./types";

type UseRecipesResult = {
  error: string | null;
  isLoading: boolean;
  recipes: RecipeListItem[];
  reload: () => Promise<void>;
};

export function useRecipes(userId: string): UseRecipesResult {
  const queryClient = useQueryClient();
  const query = useQuery(recipesQueryOptions(userId));

  return {
    recipes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    reload: async () => {
      await queryClient.invalidateQueries({ queryKey: recipesQueryOptions(userId).queryKey });
    },
  };
}
