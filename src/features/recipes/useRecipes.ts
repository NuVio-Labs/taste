import { useEffect, useState } from "react";
import { fetchRecipes } from "./recipeService";
import type { RecipeListItem } from "./types";

type UseRecipesResult = {
  error: string | null;
  isLoading: boolean;
  recipes: RecipeListItem[];
  reload: () => Promise<void>;
};

export function useRecipes(userId: string): UseRecipesResult {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRecipes() {
    if (!userId) {
      setRecipes([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextRecipes = await fetchRecipes(userId);
      setRecipes(nextRecipes);
    } catch (loadError) {
      setRecipes([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Die Rezepte konnten nicht geladen werden.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRecipes();
  }, [userId]);

  return {
    recipes,
    isLoading,
    error,
    reload: loadRecipes,
  };
}
