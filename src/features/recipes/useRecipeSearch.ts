import { useQuery } from "@tanstack/react-query";
import { searchRecipeIds } from "./recipeService";

export function useRecipeSearch(userId: string, query: string) {
  const trimmed = query.trim();
  const enabled = Boolean(userId) && trimmed.length >= 2;

  const { data, isLoading } = useQuery({
    queryKey: ["recipe-search", userId, trimmed],
    queryFn: () => searchRecipeIds(userId, trimmed),
    enabled,
    staleTime: 30_000,
  });

  return {
    searchResultIds: enabled ? (data ?? null) : null,
    isSearching: enabled && isLoading,
  };
}
