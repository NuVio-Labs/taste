import { supabase } from "../../lib/supabase";
import type { ProfileData } from "./types";

type ProfileRow = {
  avatar_url: string | null;
  created_at: string | null;
  id: string;
  username: string | null;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function mapProfile(row: ProfileRow, fallbackId: string): ProfileData {
  return {
    id: row.id || fallbackId,
    username: readString(row.username) ?? "",
    avatarUrl: readString(row.avatar_url),
    createdAt: row.created_at,
  };
}

export async function fetchProfile(userId: string): Promise<ProfileData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      id: userId,
      username: "",
      avatarUrl: null,
      createdAt: null,
    };
  }

  return mapProfile(data as ProfileRow, userId);
}

export async function saveProfile(
  userId: string,
  input: { avatarUrl: string | null; username: string },
) {
  const payload = {
    id: userId,
    username: input.username.trim(),
    avatar_url: input.avatarUrl?.trim() ? input.avatarUrl.trim() : null,
  };

  const { error } = await supabase.from("profiles").upsert(payload);

  if (error) {
    throw new Error(error.message);
  }
}
