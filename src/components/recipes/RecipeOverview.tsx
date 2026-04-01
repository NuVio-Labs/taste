import type { RecipeListItem } from "../../features/recipes/types";
import { RecipeCard } from "./RecipeCard";

type RecipeOverviewProps = {
  emptyMessage: string;
  onSelectRecipe: (recipeId: string) => void;
  recipes: RecipeListItem[];
};

export function RecipeOverview({
  emptyMessage,
  onSelectRecipe,
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
        />
      ))}
    </div>
  );
}
