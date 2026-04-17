import { BookOpen } from "lucide-react";
import type { RecipeListItem } from "../../features/recipes/types";
import { RecipeCard } from "./RecipeCard";

type RecipeOverviewProps = {
  addToShoppingListPendingRecipeId?: string | null;
  emptyMessage: string;
  emptyHint?: string;
  emptyAction?: { label: string; onClick: () => void };
  favoritePendingRecipeId?: string | null;
  likePendingRecipeId?: string | null;
  onAddToShoppingList?: (recipeId: string) => void;
  onPrefetchRecipe?: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string) => void;
  onToggleLike: (recipeId: string) => void;
  recipes: RecipeListItem[];
};

export function RecipeOverview({
  addToShoppingListPendingRecipeId = null,
  emptyMessage,
  emptyHint,
  emptyAction,
  favoritePendingRecipeId = null,
  likePendingRecipeId = null,
  onAddToShoppingList,
  onPrefetchRecipe,
  onSelectRecipe,
  onToggleFavorite,
  onToggleLike,
  recipes,
}: RecipeOverviewProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white/8 bg-white/[0.02] px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#6B5F52]">
          <BookOpen size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-[#C8B79F]">{emptyMessage}</p>
          {emptyHint ? (
            <p className="mt-1.5 text-sm text-[#6B5F52]">{emptyHint}</p>
          ) : null}
        </div>
        {emptyAction ? (
          <button
            type="button"
            onClick={emptyAction.onClick}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#D6A84A]/20 bg-[#D6A84A]/10 px-4 text-sm font-medium text-[#F6D78E] transition-colors hover:bg-[#D6A84A]/16"
          >
            {emptyAction.label}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          isAddToShoppingListPending={addToShoppingListPendingRecipeId === recipe.id}
          onClick={() => onSelectRecipe(recipe.id)}
          onAddToShoppingList={
            onAddToShoppingList ? () => onAddToShoppingList(recipe.id) : undefined
          }
          onPrefetch={() => onPrefetchRecipe?.(recipe.id)}
          onToggleFavorite={() => onToggleFavorite(recipe.id)}
          onToggleLike={() => onToggleLike(recipe.id)}
          isFavoritePending={favoritePendingRecipeId === recipe.id}
          isLikePending={likePendingRecipeId === recipe.id}
        />
      ))}
    </div>
  );
}
