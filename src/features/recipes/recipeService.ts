import { supabase } from "../../lib/supabase";
import type {
  RecipeDetailData,
  RecipeIngredient,
  RecipeListItem,
  RecipeStep,
} from "./types";

type RecipeRow = {
  category: string | null;
  created_at: string | null;
  description: string | null;
  id: string;
  image_url: string | null;
  ingredients?: unknown;
  is_public: boolean | null;
  like_count?: number | null;
  prep_time: number | null;
  servings: number | null;
  steps?: unknown;
  title: string | null;
  updated_at: string | null;
};

type RecipeLikeRow = {
  recipe_id: string;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapIngredient(value: unknown, index: number): RecipeIngredient | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const name = readString(row.name);

  if (!name) {
    return null;
  }

  return {
    id: readString(row.id) ?? `ingredient-${index}`,
    name,
    amount: readString(row.amount) ?? "",
    unit: readString(row.unit) ?? "",
  };
}

function mapStep(value: unknown, index: number): RecipeStep | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const text = readString(row.text);

  if (!text) {
    return null;
  }

  return {
    id: readString(row.id) ?? `step-${index}`,
    text,
  };
}

function parseIngredients(value: unknown): RecipeIngredient[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => mapIngredient(entry, index))
    .filter((entry): entry is RecipeIngredient => entry !== null);
}

function parseSteps(value: unknown): RecipeStep[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => mapStep(entry, index))
    .filter((entry): entry is RecipeStep => entry !== null);
}

function mapRecipeListItem(row: RecipeRow, likedRecipeIds: Set<string>): RecipeListItem {
  return {
    id: row.id,
    title: readString(row.title) ?? "Unbenanntes Rezept",
    description: readString(row.description) ?? "Keine Beschreibung vorhanden.",
    imageUrl: readString(row.image_url),
    category: readString(row.category) ?? "Ohne Kategorie",
    prepTime: readNumber(row.prep_time),
    servings: readNumber(row.servings),
    isPublic: row.is_public === true,
    likeCount: readNumber(row.like_count) ?? 0,
    isLiked: likedRecipeIds.has(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchRecipes(userId: string): Promise<RecipeListItem[]> {
  const [recipesResult, likesResult] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        "id, title, description, image_url, category, prep_time, servings, is_public, created_at, updated_at, like_count",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("recipe_likes").select("recipe_id").eq("user_id", userId),
  ]);

  if (recipesResult.error || likesResult.error) {
    throw new Error(
      recipesResult.error?.message ??
        likesResult.error?.message ??
        "Die Rezepte konnten nicht geladen werden.",
    );
  }

  const likedRecipeIds = new Set(
    Array.isArray(likesResult.data)
      ? likesResult.data
          .map((entry) => (entry as RecipeLikeRow).recipe_id)
          .filter((recipeId): recipeId is string => typeof recipeId === "string")
      : [],
  );

  return Array.isArray(recipesResult.data)
    ? recipesResult.data.map((row) => mapRecipeListItem(row as RecipeRow, likedRecipeIds))
    : [];
}

export async function fetchRecipeById(
  userId: string,
  recipeId: string,
): Promise<RecipeDetailData> {
  const [recipeResult, likeResult] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        "id, title, description, image_url, category, prep_time, servings, is_public, created_at, updated_at, ingredients, steps, like_count",
      )
      .eq("user_id", userId)
      .eq("id", recipeId)
      .maybeSingle(),
    supabase
      .from("recipe_likes")
      .select("recipe_id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .maybeSingle(),
  ]);

  if (recipeResult.error || likeResult.error) {
    throw new Error(
      recipeResult.error?.message ??
        likeResult.error?.message ??
        "Das Rezept konnte nicht geladen werden.",
    );
  }

  if (!recipeResult.data) {
    throw new Error("Rezept nicht gefunden.");
  }

  const likedRecipeIds = new Set<string>();

  if (likeResult.data && typeof (likeResult.data as RecipeLikeRow).recipe_id === "string") {
    likedRecipeIds.add((likeResult.data as RecipeLikeRow).recipe_id);
  }

  const recipe = mapRecipeListItem(recipeResult.data as RecipeRow, likedRecipeIds);

  return {
    ...recipe,
    ingredients: parseIngredients((recipeResult.data as RecipeRow).ingredients),
    steps: parseSteps((recipeResult.data as RecipeRow).steps),
  };
}

type SaveRecipeInput = {
  category: string;
  description: string;
  imageUrl: string | null;
  ingredients: RecipeIngredient[];
  isPublic: boolean;
  prepTime: number;
  servings: number;
  steps: RecipeStep[];
  title: string;
};

function buildRecipePayload(input: SaveRecipeInput, timestamp: string) {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    ingredients: input.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name.trim(),
      amount: ingredient.amount.trim(),
      unit: ingredient.unit.trim(),
    })),
    steps: input.steps.map((step) => ({
      id: step.id,
      text: step.text.trim(),
    })),
    image_url: input.imageUrl?.trim() ? input.imageUrl.trim() : null,
    category: input.category.trim(),
    prep_time: input.prepTime,
    servings: input.servings,
    is_public: input.isPublic,
    updated_at: timestamp,
  };
}

export async function createRecipe(userId: string, input: SaveRecipeInput) {
  const now = new Date().toISOString();
  const payload = {
    id: crypto.randomUUID(),
    user_id: userId,
    created_at: now,
    ...buildRecipePayload(input, now),
  };

  const { error } = await supabase.from("recipes").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateRecipe(
  userId: string,
  recipeId: string,
  input: SaveRecipeInput,
) {
  const now = new Date().toISOString();
  const payload = buildRecipePayload(input, now);

  const { error } = await supabase
    .from("recipes")
    .update(payload)
    .eq("user_id", userId)
    .eq("id", recipeId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteRecipe(userId: string, recipeId: string) {
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("user_id", userId)
    .eq("id", recipeId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function likeRecipe(userId: string, recipeId: string) {
  const { error: likeInsertError } = await supabase
    .from("recipe_likes")
    .insert({
      recipe_id: recipeId,
      user_id: userId,
    });

  if (likeInsertError) {
    throw new Error(likeInsertError.message);
  }

  const { data: recipeData, error: recipeReadError } = await supabase
    .from("recipes")
    .select("like_count")
    .eq("id", recipeId)
    .maybeSingle();

  if (recipeReadError) {
    throw new Error(recipeReadError.message);
  }

  const nextLikeCount =
    ((recipeData as { like_count?: number | null } | null)?.like_count ?? 0) + 1;

  const { error: recipeUpdateError } = await supabase
    .from("recipes")
    .update({ like_count: nextLikeCount })
    .eq("id", recipeId);

  if (recipeUpdateError) {
    throw new Error(recipeUpdateError.message);
  }
}

export async function unlikeRecipe(userId: string, recipeId: string) {
  const { error: likeDeleteError } = await supabase
    .from("recipe_likes")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);

  if (likeDeleteError) {
    throw new Error(likeDeleteError.message);
  }

  const { data: recipeData, error: recipeReadError } = await supabase
    .from("recipes")
    .select("like_count")
    .eq("id", recipeId)
    .maybeSingle();

  if (recipeReadError) {
    throw new Error(recipeReadError.message);
  }

  const currentLikeCount =
    (recipeData as { like_count?: number | null } | null)?.like_count ?? 0;

  const { error: recipeUpdateError } = await supabase
    .from("recipes")
    .update({ like_count: Math.max(0, currentLikeCount - 1) })
    .eq("id", recipeId);

  if (recipeUpdateError) {
    throw new Error(recipeUpdateError.message);
  }
}
