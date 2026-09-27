import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for Client Components (Browser).
 * Uses public environment variables only.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public credentials missing in environment variables.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
