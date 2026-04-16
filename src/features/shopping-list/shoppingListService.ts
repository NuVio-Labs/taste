import { supabase } from "../../lib/supabase";
import type { ShoppingList } from "./types";

type ShoppingListRow = {
  id: string;
  user_id: string;
  name: string;
  recipes: unknown;
  checked_item_keys: unknown;
  created_at: string;
  updated_at: string;
};

function rowToShoppingList(row: ShoppingListRow): ShoppingList {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.user_id,
    ownerName: null,
    recipes: Array.isArray(row.recipes) ? row.recipes : [],
    checkedItemKeys: Array.isArray(row.checked_item_keys) ? row.checked_item_keys : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchShoppingLists(_userId: string): Promise<ShoppingList[]> {
  const { data, error } = await supabase
    .from("shopping_lists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Einkaufslisten konnten nicht geladen werden.");
  }

  return Array.isArray(data) ? (data as ShoppingListRow[]).map(rowToShoppingList) : [];
}

export async function insertShoppingList(
  userId: string,
  name: string,
): Promise<ShoppingList> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("shopping_lists")
    .insert({
      user_id: userId,
      name: name.trim(),
      recipes: [],
      checked_item_keys: [],
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message ?? "Liste konnte nicht erstellt werden.");
  }

  return rowToShoppingList(data as ShoppingListRow);
}

export async function updateShoppingList(
  listId: string,
  patch: Partial<Pick<ShoppingList, "name" | "recipes" | "checkedItemKeys">>,
): Promise<void> {
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.name !== undefined) update.name = patch.name;
  if (patch.recipes !== undefined) update.recipes = patch.recipes;
  if (patch.checkedItemKeys !== undefined) update.checked_item_keys = patch.checkedItemKeys;

  const { error } = await supabase
    .from("shopping_lists")
    .update(update)
    .eq("id", listId);

  if (error) {
    throw new Error(error.message ?? "Liste konnte nicht gespeichert werden.");
  }
}

export async function removeShoppingList(listId: string): Promise<void> {
  const { error } = await supabase
    .from("shopping_lists")
    .delete()
    .eq("id", listId);

  if (error) {
    throw new Error(error.message ?? "Liste konnte nicht gelöscht werden.");
  }
}
