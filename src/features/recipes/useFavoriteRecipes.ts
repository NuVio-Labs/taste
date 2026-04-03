import { useQuery, useQueryClient } from "@tanstack/react-query";
import { favoriteRecipesQueryOptions } from "./queryOptions";
import type { RecipeListItem } from "./types";

type UseFavoriteRecipesResult = {
  error: string | null;
  favorites: RecipeListItem[];
  isLoading: boolean;
  reload: () => Promise<void>;
};

export function useFavoriteRecipes(userId: string): UseFavoriteRecipesResult {
  const queryClient = useQueryClient();
  const query = useQuery(favoriteRecipesQueryOptions(userId));

  return {
    favorites: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    reload: async () => {
      await queryClient.invalidateQueries({
        queryKey: favoriteRecipesQueryOptions(userId).queryKey,
      });
    },
  };
}
