import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client using the secret service_role key.
 * 
 * SECURITY WARNING:
 * - NEVER import or call this in Client Components.
 * - ONLY for server-side administrative background tasks, webhooks, or seeding.
 * - Bypasses all Row Level Security (RLS).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("placeholder")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin client.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
