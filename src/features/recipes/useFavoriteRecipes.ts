import { useEffect, useState } from "react";
import { fetchFavoriteRecipes } from "./recipeService";
import type { RecipeListItem } from "./types";

type UseFavoriteRecipesResult = {
  error: string | null;
  favorites: RecipeListItem[];
  isLoading: boolean;
  reload: () => Promise<void>;
};

export function useFavoriteRecipes(userId: string): UseFavoriteRecipesResult {
  const [favorites, setFavorites] = useState<RecipeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFavorites() {
    if (!userId) {
      setFavorites([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextFavorites = await fetchFavoriteRecipes(userId);
      setFavorites(nextFavorites);
    } catch (loadError) {
      setFavorites([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Die Favoriten konnten nicht geladen werden.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadFavorites();
  }, [userId]);

  return {
    favorites,
    isLoading,
    error,
    reload: loadFavorites,
  };
}
