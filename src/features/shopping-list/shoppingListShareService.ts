import { supabase } from "../../lib/supabase";
import type { ShoppingListShare, ShoppingListSharePermission } from "./types";

type ShareRow = {
  id: string;
  list_id: string;
  created_by: string;
  token: string;
  permission: string;
  created_at: string;
};

function rowToShare(row: ShareRow): ShoppingListShare {
  return {
    id: row.id,
    listId: row.list_id,
    createdBy: row.created_by,
    token: row.token,
    permission: row.permission as ShoppingListSharePermission,
    createdAt: row.created_at,
  };
}

export async function fetchSharesForList(listId: string): Promise<ShoppingListShare[]> {
  const { data, error } = await supabase
    .from("shopping_list_shares")
    .select("*")
    .eq("list_id", listId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message ?? "Freigaben konnten nicht geladen werden.");
  return Array.isArray(data) ? (data as ShareRow[]).map(rowToShare) : [];
}

export async function createShare(
  listId: string,
  createdBy: string,
  permission: ShoppingListSharePermission,
): Promise<ShoppingListShare> {
  const { data, error } = await supabase
    .from("shopping_list_shares")
    .insert({ list_id: listId, created_by: createdBy, permission })
    .select()
    .single();

  if (error) throw new Error(error.message ?? "Freigabe konnte nicht erstellt werden.");
  return rowToShare(data as ShareRow);
}

export async function deleteShare(shareId: string): Promise<void> {
  const { error } = await supabase
    .from("shopping_list_shares")
    .delete()
    .eq("id", shareId);

  if (error) throw new Error(error.message ?? "Freigabe konnte nicht gelöscht werden.");
}

export async function resolveShareToken(token: string): Promise<ShoppingListShare | null> {
  const { data, error } = await supabase
    .from("shopping_list_shares")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw new Error(error.message ?? "Freigabe konnte nicht aufgelöst werden.");
  return data ? rowToShare(data as ShareRow) : null;
}
