import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the service_role key, which bypasses Row Level Security — it must NEVER
 * reach the browser. The `server-only` import above turns an accidental import
 * from a "use client" file into a build error, and the env vars deliberately
 * lack a NEXT_PUBLIC_ prefix so they are not inlined into client bundles.
 *
 * Initialized lazily: createClient() throws on missing config, and a module-scope
 * call would fail the production *build* instead of failing the request that
 * actually needs the database.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  client = createClient(url, serviceRoleKey, {
    // No browser session to persist or refresh inside a serverless function.
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}

export const PROJECTS_TABLE = "projects";
