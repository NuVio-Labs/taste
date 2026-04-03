import { supabase } from "../../lib/supabase";
import type { ProfileData } from "./types";

type ProfileRow = {
  avatar_url: string | null;
  created_at: string | null;
  id: string;
  plan: string | null;
  username: string | null;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function mapProfile(row: ProfileRow, fallbackId: string): ProfileData {
  const plan = row.plan === "pro" ? "pro" : "free";

  return {
    id: row.id || fallbackId,
    username: readString(row.username) ?? "",
    avatarUrl: readString(row.avatar_url),
    createdAt: row.created_at,
    plan,
  };
}

export async function fetchProfile(userId: string): Promise<ProfileData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at, plan")
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
      plan: "free",
    };
  }

  return mapProfile(data as ProfileRow, userId);
}

export async function saveProfile(
  userId: string,
  input: { avatarUrl: string | null; username: string },
) {
  const payload = {
    username: input.username.trim(),
    avatar_url: input.avatarUrl?.trim() ? input.avatarUrl.trim() : null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
