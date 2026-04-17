import { ArrowRight, Bookmark, Clock } from "lucide-react";
import { getTransformedImageUrl } from "../../features/recipes/imageUpload";
import type { RecipeListItem } from "../../features/recipes/types";

type FavoriteRecipeListProps = {
  favoritePendingRecipeId?: string | null;
  recipes: RecipeListItem[];
  onPrefetchRecipe?: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string) => void;
};

export function FavoriteRecipeList({
  favoritePendingRecipeId = null,
  recipes,
  onPrefetchRecipe,
  onSelectRecipe,
  onToggleFavorite,
}: FavoriteRecipeListProps) {
  return (
    <div className="space-y-2">
      {recipes.map((recipe) => {
        const imgUrl = getTransformedImageUrl(recipe.imageUrl, "card");
        const isPending = favoritePendingRecipeId === recipe.id;

        return (
          <div
            key={recipe.id}
            className="group flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:border-[#D6A84A]/14 hover:bg-white/[0.03]"
          >
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={recipe.title}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] text-[#6B5F52]">
                <Bookmark size={15} />
              </div>
            )}

            <button
              type="button"
              onClick={() => onSelectRecipe(recipe.id)}
              onMouseEnter={() => onPrefetchRecipe?.(recipe.id)}
              onFocus={() => onPrefetchRecipe?.(recipe.id)}
              onTouchStart={() => onPrefetchRecipe?.(recipe.id)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-medium text-[#F6EFE4] transition-colors group-hover:text-white">
                {recipe.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                {recipe.category ? (
                  <span className="text-xs text-[#6B5F52]">{recipe.category}</span>
                ) : null}
                {recipe.prepTime ? (
                  <span className="flex items-center gap-1 text-xs text-[#6B5F52]">
                    <Clock size={10} />
                    {recipe.prepTime} Min
                  </span>
                ) : null}
                {recipe.isVegan ? (
                  <span className="text-xs text-[#94D4AE]">🌱</span>
                ) : recipe.isVegetarian ? (
                  <span className="text-xs text-[#A8D4A4]">🌿</span>
                ) : null}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(recipe.id)}
              disabled={isPending}
              aria-label="Aus Favoriten entfernen"
              className="shrink-0 p-2 text-[#E7C26E] opacity-60 transition-all hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Bookmark size={15} className="fill-current" />
            </button>

            <button
              type="button"
              onClick={() => onSelectRecipe(recipe.id)}
              onMouseEnter={() => onPrefetchRecipe?.(recipe.id)}
              className="shrink-0 text-[#4A3F35] transition-colors group-hover:text-[#D6A84A]"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
