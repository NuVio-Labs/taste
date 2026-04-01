export type RecipeIngredient = {
  amount: string;
  id: string;
  name: string;
  unit: string;
};

export type RecipeStep = {
  id: string;
  text: string;
};

export type RecipeListItem = {
  category: string;
  createdAt: string | null;
  description: string;
  id: string;
  imageUrl: string | null;
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
