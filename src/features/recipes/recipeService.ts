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

function mapRecipeListItem(row: RecipeRow): RecipeListItem {
  return {
    id: row.id,
    title: readString(row.title) ?? "Unbenanntes Rezept",
    description: readString(row.description) ?? "Keine Beschreibung vorhanden.",
    imageUrl: readString(row.image_url),
    category: readString(row.category) ?? "Ohne Kategorie",
    prepTime: readNumber(row.prep_time),
    servings: readNumber(row.servings),
    isPublic: row.is_public === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchRecipes(userId: string): Promise<RecipeListItem[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, title, description, image_url, category, prep_time, servings, is_public, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data.map((row) => mapRecipeListItem(row as RecipeRow)) : [];
}

export async function fetchRecipeById(
  userId: string,
  recipeId: string,
): Promise<RecipeDetailData> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, title, description, image_url, category, prep_time, servings, is_public, created_at, updated_at, ingredients, steps",
    )
    .eq("user_id", userId)
    .eq("id", recipeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Rezept nicht gefunden.");
  }

  const recipe = mapRecipeListItem(data as RecipeRow);

  return {
    ...recipe,
    ingredients: parseIngredients((data as RecipeRow).ingredients),
    steps: parseSteps((data as RecipeRow).steps),
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
