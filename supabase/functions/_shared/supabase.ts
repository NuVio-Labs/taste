import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function readEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl() {
  return readEnv("SUPABASE_URL");
}

export function getSupabaseAnonKey() {
  return readEnv("SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey() {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function createUserClient(req: Request) {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") ?? "",
      },
    },
  });
}

/**
 * Verifies the JWT from the request's Authorization header and returns the
 * authenticated user. Passes the token explicitly to auth.getUser() because
 * supabase-js does not use global.headers for auth requests in Deno.
 */
export async function getUserFromRequest(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const supabase = createUserClient(req);
  return supabase.auth.getUser(token);
}

export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
