import type { RecipeListItem } from "../../features/recipes/types";
import { RecipeCard } from "./RecipeCard";

type RecipeOverviewProps = {
  emptyMessage: string;
  favoritePendingRecipeId?: string | null;
  likePendingRecipeId?: string | null;
  onSelectRecipe: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string) => void;
  onToggleLike: (recipeId: string) => void;
  recipes: RecipeListItem[];
};

export function RecipeOverview({
  emptyMessage,
  favoritePendingRecipeId = null,
  likePendingRecipeId = null,
  onSelectRecipe,
  onToggleFavorite,
  onToggleLike,
  recipes,
}: RecipeOverviewProps) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/8 bg-white/[0.025] px-4 py-5 text-sm leading-6 text-[#B7AA96]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onClick={() => onSelectRecipe(recipe.id)}
          onToggleFavorite={() => onToggleFavorite(recipe.id)}
          onToggleLike={() => onToggleLike(recipe.id)}
          isFavoritePending={favoritePendingRecipeId === recipe.id}
          isLikePending={likePendingRecipeId === recipe.id}
        />
      ))}
    </div>
  );
}
