import { supabase } from "../../lib/supabase";
import type { ProfileData } from "./types";

type ProfileRow = {
  access_source: string | null;
  avatar_url: string | null;
  billing_status: string | null;
  created_at: string | null;
  id: string;
  plan: string | null;
  username: string | null;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function derivePlan(row: ProfileRow): "free" | "pro" {
  const accessSource = readString(row.access_source);
  const billingStatus = readString(row.billing_status);

  if (
    accessSource === "stripe" &&
    (billingStatus === "active" || billingStatus === "trialing")
  ) {
    return "pro";
  }

  return row.plan === "pro" ? "pro" : "free";
}

function mapProfile(row: ProfileRow, fallbackId: string): ProfileData {
  const plan = derivePlan(row);

  return {
    accessSource: readString(row.access_source),
    id: row.id || fallbackId,
    username: readString(row.username) ?? "",
    avatarUrl: readString(row.avatar_url),
    billingStatus: readString(row.billing_status),
    createdAt: row.created_at,
    plan,
  };
}

export async function fetchProfile(userId: string): Promise<ProfileData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at, plan, billing_status, access_source")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      accessSource: null,
      id: userId,
      username: "",
      avatarUrl: null,
      billingStatus: null,
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
    id: userId,
    username: input.username.trim(),
    avatar_url: input.avatarUrl?.trim() ? input.avatarUrl.trim() : null,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }
}
