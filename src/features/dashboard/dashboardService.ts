import { supabase } from "../../lib/supabase";

type RecipeRow = Record<string, unknown>;

type RecipeStatsRow = {
  created_at: string | null;
  id: string;
  is_public: boolean | null;
  title: string | null;
  updated_at: string | null;
};

export type RecipePreview = {
  id: string;
  sortTimestamp: number;
  subtitle: string;
  title: string;
};

export type DashboardStats = {
  lastUpdatedHint: string;
  lastUpdatedLabel: string;
  privateRecipes: number;
  publicRecipes: number;
  totalRecipes: number;
};

export type DashboardData = {
  recentRecipes: RecipePreview[];
  stats: DashboardStats;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function formatRecipeSubtitle(row: RecipeRow): string {
  const category = readString(row.category) ?? readString(row.category_name);
  const description =
    readString(row.description) ??
    readString(row.summary) ??
    readString(row.notes);

  if (category && description) return `${category} • ${description}`;
  if (category) return category;
  if (description) return description;

  const createdAt =
    readString(row.created_at) ??
    readString(row.updated_at) ??
    readString(row.inserted_at);

  if (!createdAt) return "Rezept aus Supabase";

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) return "Rezept aus Supabase";

  return `Erstellt am ${parsedDate.toLocaleDateString("de-DE")}`;
}

function mapRecipeRow(row: RecipeRow, index: number): RecipePreview {
  const title =
    readString(row.title) ??
    readString(row.name) ??
    readString(row.recipe_name) ??
    `Rezept ${index + 1}`;

  const id =
    readString(row.id) ??
    readString(row.uuid) ??
    readString(row.slug) ??
    `${title}-${index}`;

  const dateValue =
    readString(row.created_at) ??
    readString(row.updated_at) ??
    readString(row.inserted_at);
  const sortTimestamp = dateValue ? new Date(dateValue).getTime() : 0;

  return {
    id,
    sortTimestamp: Number.isNaN(sortTimestamp) ? 0 : sortTimestamp,
    title,
    subtitle: formatRecipeSubtitle(row),
  };
}

function formatRelativeDate(value: string | null): string {
  if (!value) return "Noch offen";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Noch offen";

  const differenceInDays = Math.floor(
    (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (differenceInDays <= 0) return "Heute";
  if (differenceInDays === 1) return "Gestern";
  if (differenceInDays < 7) return `Vor ${differenceInDays} Tagen`;

  return parsedDate.toLocaleDateString("de-DE");
}

function formatPreciseDate(value: string | null): string {
  if (!value) return "Kein Zeitstempel vorhanden";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Kein Zeitstempel vorhanden";

  return parsedDate.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildDashboardStats(rows: RecipeStatsRow[]): DashboardStats {
  const totalRecipes = rows.length;
  const publicRecipes = rows.filter((row) => row.is_public === true).length;
  const privateRecipes = totalRecipes - publicRecipes;

  const latestRow = rows.reduce<RecipeStatsRow | null>((latest, row) => {
    const dateValue = row.updated_at ?? row.created_at;
    if (!dateValue) return latest;

    const timestamp = new Date(dateValue).getTime();
    if (Number.isNaN(timestamp)) return latest;
    if (!latest) return row;

    const latestValue = latest.updated_at ?? latest.created_at;
    const latestTimestamp = latestValue ? new Date(latestValue).getTime() : 0;
    return timestamp > latestTimestamp ? row : latest;
  }, null);

  const latestDateValue = latestRow?.updated_at ?? latestRow?.created_at ?? null;
  const latestTitle =
    (typeof latestRow?.title === "string" && latestRow.title.trim()) ||
    "Unbenanntes Rezept";

  return {
    totalRecipes,
    publicRecipes,
    privateRecipes,
    lastUpdatedLabel: formatRelativeDate(latestDateValue),
    lastUpdatedHint: latestDateValue
      ? `${latestTitle} · ${formatPreciseDate(latestDateValue)}`
      : "Noch keine Rezeptänderung vorhanden.",
  };
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const [recentResult, statsResult] = await Promise.all([
    supabase
      .from("recipes")
      .select("*")
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("recipes")
      .select("id, title, is_public, created_at, updated_at")
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order("created_at", { ascending: false }),
  ]);

  if (recentResult.error) throw new Error(recentResult.error.message);
  if (statsResult.error) throw new Error(statsResult.error.message);

  const recentRows = Array.isArray(recentResult.data) ? recentResult.data : [];
  const statsRows = Array.isArray(statsResult.data) ? statsResult.data : [];

  return {
    recentRecipes: recentRows.map(mapRecipeRow),
    stats: buildDashboardStats(statsRows as RecipeStatsRow[]),
  };
}
