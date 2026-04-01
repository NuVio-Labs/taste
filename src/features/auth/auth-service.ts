import type { Session } from "@supabase/supabase-js";
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

  return data.session;
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
