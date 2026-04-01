import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase ENV Variablen fehlen. Pruefe VITE_SUPABASE_URL und VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
