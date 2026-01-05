/**
 * Supabase Client Configuration
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for client-side
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // Server-side: always create new instance
    return createClient();
  }

  // Client-side: reuse instance
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }

  return supabaseInstance;
}
