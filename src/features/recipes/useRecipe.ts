import { useEffect, useState } from "react";
import { fetchRecipeById } from "./recipeService";
import type { RecipeDetailData } from "./types";

type UseRecipeResult = {
  error: string | null;
  isLoading: boolean;
  recipe: RecipeDetailData | null;
  reload: () => Promise<void>;
};

export function useRecipe(userId: string, recipeId: string): UseRecipeResult {
  const [recipe, setRecipe] = useState<RecipeDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRecipe() {
    if (!userId || !recipeId) {
      setRecipe(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextRecipe = await fetchRecipeById(userId, recipeId);
      setRecipe(nextRecipe);
    } catch (loadError) {
      setRecipe(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Das Rezept konnte nicht geladen werden.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRecipe();
  }, [recipeId, userId]);

  return {
    recipe,
    isLoading,
    error,
    reload: loadRecipe,
  };
}
