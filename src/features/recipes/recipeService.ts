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
  prep_time: number | null;
  servings: number | null;
  steps?: unknown;
  title: string | null;
  updated_at: string | null;
  user_id: string;
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

function buildLikeCountMap(rows: RecipeLikeRow[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.recipe_id, (counts.get(row.recipe_id) ?? 0) + 1);
  }

  return counts;
}

function mapRecipeListItem(
  row: RecipeRow,
  likedRecipeIds: Set<string>,
  likeCounts: Map<string, number>,
): RecipeListItem {
  return {
    id: row.id,
    title: readString(row.title) ?? "Unbenanntes Rezept",
    description: readString(row.description) ?? "Keine Beschreibung vorhanden.",
    imageUrl: readString(row.image_url),
    category: readString(row.category) ?? "Ohne Kategorie",
    prepTime: readNumber(row.prep_time),
    servings: readNumber(row.servings),
    isPublic: row.is_public === true,
    likeCount: likeCounts.get(row.id) ?? 0,
    isLiked: likedRecipeIds.has(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

export async function fetchRecipes(userId: string): Promise<RecipeListItem[]> {
  const { data: recipeData, error: recipesError } = await supabase
    .from("recipes")
    .select(
      "id, user_id, title, description, image_url, category, prep_time, servings, is_public, created_at, updated_at",
    )
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order("created_at", { ascending: false });

  if (recipesError) {
    throw new Error(recipesError.message);
  }

  const recipeRows = Array.isArray(recipeData) ? recipeData.map((row) => row as RecipeRow) : [];
  const recipeIds = recipeRows.map((row) => row.id);

  if (recipeIds.length === 0) {
    return [];
  }

  const [likesResult, ownLikesResult] = await Promise.all([
    supabase.from("recipe_likes").select("recipe_id").in("recipe_id", recipeIds),
    supabase
      .from("recipe_likes")
      .select("recipe_id")
      .eq("user_id", userId)
      .in("recipe_id", recipeIds),
  ]);

  if (likesResult.error || ownLikesResult.error) {
    throw new Error(
      likesResult.error?.message ??
        ownLikesResult.error?.message ??
        "Die Rezepte konnten nicht geladen werden.",
    );
  }

  const allLikeRows = Array.isArray(likesResult.data)
    ? likesResult.data
        .map((entry) => entry as RecipeLikeRow)
        .filter((entry) => typeof entry.recipe_id === "string")
    : [];
  const ownLikeRows = Array.isArray(ownLikesResult.data)
    ? ownLikesResult.data
        .map((entry) => entry as RecipeLikeRow)
        .filter((entry) => typeof entry.recipe_id === "string")
    : [];

  const likeCounts = buildLikeCountMap(allLikeRows);
  const likedRecipeIds = new Set(ownLikeRows.map((entry) => entry.recipe_id));

  return recipeRows.map((row) => mapRecipeListItem(row, likedRecipeIds, likeCounts));
}

export async function fetchRecipeById(
  userId: string,
  recipeId: string,
): Promise<RecipeDetailData> {
  const [recipeResult, ownLikeResult, likeCountResult] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        "id, user_id, title, description, image_url, category, prep_time, servings, is_public, created_at, updated_at, ingredients, steps",
      )
      .eq("id", recipeId)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .maybeSingle(),
    supabase
      .from("recipe_likes")
      .select("recipe_id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .maybeSingle(),
    supabase
      .from("recipe_likes")
      .select("recipe_id", { count: "exact", head: true })
      .eq("recipe_id", recipeId),
  ]);

  if (recipeResult.error || ownLikeResult.error || likeCountResult.error) {
    throw new Error(
      recipeResult.error?.message ??
        ownLikeResult.error?.message ??
        likeCountResult.error?.message ??
        "Das Rezept konnte nicht geladen werden.",
    );
  }

  if (!recipeResult.data) {
    throw new Error("Rezept nicht gefunden.");
  }

  const likedRecipeIds = new Set<string>();
  const likeCounts = new Map<string, number>([[recipeId, likeCountResult.count ?? 0]]);

  if (ownLikeResult.data && typeof (ownLikeResult.data as RecipeLikeRow).recipe_id === "string") {
    likedRecipeIds.add((ownLikeResult.data as RecipeLikeRow).recipe_id);
  }

  const recipe = mapRecipeListItem(recipeResult.data as RecipeRow, likedRecipeIds, likeCounts);

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
}
