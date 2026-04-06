import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }
}

export async function signUpWithEmailPassword(
  name: string,
  email: string,
  password: string,
): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.user && data.session) {
    await ensureProfileForUser(data.user);
  }

  return data.session;
}

function buildProfileUsername(user: User): string {
  const metadataName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  if (metadataName) {
    return metadataName;
  }

  const emailPrefix = user.email?.split("@")[0]?.trim() ?? "";
  return emailPrefix;
}

export async function ensureProfileForUser(user: User): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username: buildProfileUsername(user),
      plan: "free",
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function updateUserEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    email,
  });

  if (error) {
    throw error;
  }
}

export async function updateUserPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw error;
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw error;
  }
}
