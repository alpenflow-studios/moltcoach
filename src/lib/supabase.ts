import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Client-side Supabase client (anon key — read-only, respects RLS) */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/** Server-side Supabase client (service_role key — bypasses RLS, for API routes only) */
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
