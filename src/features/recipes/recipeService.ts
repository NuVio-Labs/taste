import { supabase } from "../../lib/supabase";
import { normalizeIngredientUnit } from "./ingredientNormalization";
import type {
  RecipeDetailData,
  RecipeIngredient,
  RecipeListItem,
  RecipeStep,
} from "./types";

type RecipeRow = {
  author_name?: string | null;
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

type RecipeFavoriteRow = {
  recipe_id: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
};

type RecipeFeedRow = RecipeRow & {
  author_name: string | null;
  is_favorite: boolean | null;
  is_liked: boolean | null;
  like_count: number | null;
};

function isMissingFavoritesTableError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("recipe_favorites") && message.includes("could not find the table");
}

function isMissingRecipeFeedFunctionError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    message.includes("get_recipe_feed") ||
    message.includes("get_favorite_recipe_feed")
  ) && (
    message.includes("does not exist") ||
    message.includes("could not find the function")
  );
}

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
    amountNote: readString(row.amount_note) ?? "",
    amountValue: readString(row.amount_value) ?? readString(row.amount) ?? "",
    unit: normalizeIngredientUnit(readString(row.unit) ?? ""),
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

function buildAuthorMap(rows: ProfileRow[]): Map<string, string> {
  const authors = new Map<string, string>();

  for (const row of rows) {
    const username = readString(row.username);

    if (username) {
      authors.set(row.id, username);
    }
  }

  return authors;
}

function mapRecipeListItem(
  row: RecipeRow,
  favoriteRecipeIds: Set<string>,
  likedRecipeIds: Set<string>,
  likeCounts: Map<string, number>,
  authorNames: Map<string, string>,
): RecipeListItem {
  return {
    authorName: authorNames.get(row.user_id) ?? "Unbekannter Nutzer",
    id: row.id,
    title: readString(row.title) ?? "Unbenanntes Rezept",
    description: readString(row.description) ?? "Keine Beschreibung vorhanden.",
    imageUrl: readString(row.image_url),
    category: readString(row.category) ?? "Ohne Kategorie",
    prepTime: readNumber(row.prep_time),
    servings: readNumber(row.servings),
    isFavorite: favoriteRecipeIds.has(row.id),
    isPublic: row.is_public === true,
    likeCount: likeCounts.get(row.id) ?? 0,
    isLiked: likedRecipeIds.has(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function mapRecipeFeedListItem(row: RecipeFeedRow): RecipeListItem {
  return {
    authorName: readString(row.author_name) ?? "Unbekannter Nutzer",
    id: row.id,
    title: readString(row.title) ?? "Unbenanntes Rezept",
    description: readString(row.description) ?? "Keine Beschreibung vorhanden.",
    imageUrl: readString(row.image_url),
    category: readString(row.category) ?? "Ohne Kategorie",
    prepTime: readNumber(row.prep_time),
    servings: readNumber(row.servings),
    isFavorite: row.is_favorite === true,
    isPublic: row.is_public === true,
    likeCount: readNumber(row.like_count) ?? 0,
    isLiked: row.is_liked === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

async function fetchRecipesLegacy(userId: string): Promise<RecipeListItem[]> {
  // Step 1: recipes + own likes + own favorites in parallel
  // own_likes and own_favorites don't need recipe IDs — fetch all for user upfront
  const [recipesResult, ownLikesResult, ownFavoritesResult] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        "id, user_id, title, description, image_url, category, prep_time, servings, is_public, created_at, updated_at",
      )
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order("created_at", { ascending: false }),
    supabase.from("recipe_likes").select("recipe_id").eq("user_id", userId),
    supabase.from("recipe_favorites").select("recipe_id").eq("user_id", userId),
  ]);

  if (recipesResult.error || ownLikesResult.error) {
    throw new Error(
      recipesResult.error?.message ??
        ownLikesResult.error?.message ??
        "Die Rezepte konnten nicht geladen werden.",
    );
  }

  if (ownFavoritesResult.error && !isMissingFavoritesTableError(ownFavoritesResult.error)) {
    throw new Error(ownFavoritesResult.error.message);
  }

  const recipeRows = Array.isArray(recipesResult.data)
    ? recipesResult.data.map((row) => row as RecipeRow)
    : [];
  const recipeIds = recipeRows.map((row) => row.id);

  if (recipeIds.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(recipeRows.map((row) => row.user_id)));

  // Step 2: all like counts + author profiles in parallel (both need data from step 1)
  const [allLikesResult, profilesResult] = await Promise.all([
    supabase.from("recipe_likes").select("recipe_id").in("recipe_id", recipeIds),
    supabase.from("public_profiles").select("id, username").in("id", userIds),
  ]);

  if (allLikesResult.error) {
    throw new Error(allLikesResult.error.message ?? "Die Rezepte konnten nicht geladen werden.");
  }

  const allLikeRows = Array.isArray(allLikesResult.data)
    ? allLikesResult.data
        .map((entry) => entry as RecipeLikeRow)
        .filter((entry) => typeof entry.recipe_id === "string")
    : [];
  const ownLikeRows = Array.isArray(ownLikesResult.data)
    ? ownLikesResult.data
        .map((entry) => entry as RecipeLikeRow)
        .filter((entry) => typeof entry.recipe_id === "string")
    : [];
  const ownFavoriteRows = Array.isArray(ownFavoritesResult.data)
    ? ownFavoritesResult.data
        .map((entry) => entry as RecipeFavoriteRow)
        .filter((entry) => typeof entry.recipe_id === "string")
    : [];

  const likeCounts = buildLikeCountMap(allLikeRows);
  const likedRecipeIds = new Set(ownLikeRows.map((entry) => entry.recipe_id));
  const favoriteRecipeIds = new Set(ownFavoriteRows.map((entry) => entry.recipe_id));
  const authorNames = buildAuthorMap(
    Array.isArray(profilesResult.data) ? profilesResult.data.map((row) => row as ProfileRow) : [],
  );

  return recipeRows.map((row) =>
    mapRecipeListItem(row, favoriteRecipeIds, likedRecipeIds, likeCounts, authorNames),
  );
}

async function fetchFavoriteRecipesLegacy(userId: string): Promise<RecipeListItem[]> {
  // Step 1: favorites + own likes in parallel
  // own_likes don't need recipe IDs — fetch all for user upfront
  const [favoritesResult, ownLikesResult] = await Promise.all([
    supabase.from("recipe_favorites").select("recipe_id").eq("user_id", userId),
    supabase.from("recipe_likes").select("recipe_id").eq("user_id", userId),
  ]);

  if (favoritesResult.error) {
    throw new Error(favoritesResult.error.message);
  }

  if (ownLikesResult.error) {
    throw new Error(ownLikesResult.error.message);
  }

  const favoriteRows = Array.isArray(favoritesResult.data)
    ? favoritesResult.data
        .map((entry) => entry as RecipeFavoriteRow)
        .filter((entry) => typeof entry.recipe_id === "string")
    : [];
  const favoriteRecipeIds = new Set(favoriteRows.map((entry) => entry.recipe_id));
  const recipeIds = Array.from(favoriteRecipeIds);

  if (recipeIds.length === 0) {
    return [];
  }

  // Step 2: recipes + all like counts in parallel (both need recipe IDs from step 1)
  const [recipesResult, allLikesResult] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        "id, user_id, title, description, image_url, category, prep_time, servings, is_public, created_at, updated_at",
      )
      .in("id", recipeIds)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order("created_at", { ascending: false }),
    supabase.from("recipe_likes").select("recipe_id").in("recipe_id", recipeIds),
  ]);

  if (recipesResult.error || allLikesResult.error) {
    throw new Error(
      recipesResult.error?.message ??
        allLikesResult.error?.message ??
        "Die Favoriten konnten nicht geladen werden.",
    );
  }

  const recipeRows = Array.isArray(recipesResult.data)
    ? recipesResult.data.map((row) => row as RecipeRow)
    : [];

  if (recipeRows.length === 0) {
    return [];
  }

  // Step 3: author profiles (needs user IDs from step 2)
  const userIds = Array.from(new Set(recipeRows.map((row) => row.user_id)));
  const { data: profileData } = await supabase
    .from("public_profiles")
    .select("id, username")
    .in("id", userIds);

  const allLikeRows = Array.isArray(allLikesResult.data)
    ? allLikesResult.data
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
  const authorNames = buildAuthorMap(
    Array.isArray(profileData) ? profileData.map((row) => row as ProfileRow) : [],
  );

  return recipeRows.map((row) =>
    mapRecipeListItem(row, favoriteRecipeIds, likedRecipeIds, likeCounts, authorNames),
  );
}

export async function fetchRecipes(userId: string): Promise<RecipeListItem[]> {
  const { data, error } = await supabase.rpc("get_recipe_feed");

  if (error) {
    if (isMissingRecipeFeedFunctionError(error)) {
      return fetchRecipesLegacy(userId);
    }

    throw new Error(error.message ?? "Die Rezepte konnten nicht geladen werden.");
  }

  return Array.isArray(data)
    ? data.map((row) => mapRecipeFeedListItem(row as RecipeFeedRow))
    : [];
}

export async function fetchFavoriteRecipes(userId: string): Promise<RecipeListItem[]> {
  const { data, error } = await supabase.rpc("get_favorite_recipe_feed");

  if (error) {
    if (isMissingRecipeFeedFunctionError(error)) {
      return fetchFavoriteRecipesLegacy(userId);
    }

    throw new Error(error.message ?? "Die Favoriten konnten nicht geladen werden.");
  }

  return Array.isArray(data)
    ? data.map((row) => mapRecipeFeedListItem(row as RecipeFeedRow))
    : [];
}

export async function fetchRecipeById(
  userId: string,
  recipeId: string,
): Promise<RecipeDetailData> {
  const [recipeResult, ownLikeResult, ownFavoriteResult, likeCountResult] = await Promise.all([
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
      .from("recipe_favorites")
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

  if (ownFavoriteResult.error && !isMissingFavoritesTableError(ownFavoriteResult.error)) {
    throw new Error(ownFavoriteResult.error.message);
  }

  if (!recipeResult.data) {
    throw new Error("Rezept nicht gefunden.");
  }

  const favoriteRecipeIds = new Set<string>();
  const likedRecipeIds = new Set<string>();
  const likeCounts = new Map<string, number>([[recipeId, likeCountResult.count ?? 0]]);
  const { data: profileData } = await supabase
    .from("public_profiles")
    .select("id, username")
    .eq("id", (recipeResult.data as RecipeRow).user_id)
    .maybeSingle();
  const authorNames = buildAuthorMap(
    profileData ? [profileData as ProfileRow] : [],
  );

  if (ownLikeResult.data && typeof (ownLikeResult.data as RecipeLikeRow).recipe_id === "string") {
    likedRecipeIds.add((ownLikeResult.data as RecipeLikeRow).recipe_id);
  }

  if (
    ownFavoriteResult.data &&
    typeof (ownFavoriteResult.data as RecipeFavoriteRow).recipe_id === "string"
  ) {
    favoriteRecipeIds.add((ownFavoriteResult.data as RecipeFavoriteRow).recipe_id);
  }

  const recipe = mapRecipeListItem(
    recipeResult.data as RecipeRow,
    favoriteRecipeIds,
    likedRecipeIds,
    likeCounts,
    authorNames,
  );

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
      amount_note: ingredient.amountNote.trim(),
      amount_value: ingredient.amountValue.trim(),
      unit: normalizeIngredientUnit(ingredient.unit),
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

export async function favoriteRecipe(userId: string, recipeId: string) {
  const { error } = await supabase
    .from("recipe_favorites")
    .insert({
      recipe_id: recipeId,
      user_id: userId,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function unfavoriteRecipe(userId: string, recipeId: string) {
  const { error } = await supabase
    .from("recipe_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);

  if (error) {
    throw new Error(error.message);
  }
}
