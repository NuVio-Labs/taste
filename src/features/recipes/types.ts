export type RecipeIngredient = {
  amount: string;
  amountNote: string;
  amountValue: string;
  id: string;
  name: string;
  unit: string;
};

export function formatRecipeIngredientAmount(ingredient: RecipeIngredient) {
  return [ingredient.amountValue, ingredient.amountNote].filter(Boolean).join(" ").trim();
}

export type RecipeStep = {
  id: string;
  text: string;
};

export type RecipeListItem = {
  authorName: string;
  category: string;
  createdAt: string | null;
  description: string;
  id: string;
  imageUrl: string | null;
  isFavorite: boolean;
  isPublic: boolean;
  isLiked: boolean;
  likeCount: number;
  prepTime: number | null;
  servings: number | null;
  title: string;
  updatedAt: string | null;
  userId: string;
};

export type RecipeDetailData = RecipeListItem & {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};

export type RecipeSortOption = "latest" | "title" | "prepTime";

export type RecipeCategorySummary = {
  count: number;
  key: string;
  label: string;
};
