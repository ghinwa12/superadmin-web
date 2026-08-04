import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function createSupabaseClient(url: string, anonKey: string) {
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/** Singleton for Vite/browser apps using VITE_SUPABASE_* env vars */
export function getBrowserSupabase() {
  const url = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example and fill in your project keys."
    );
  }

  if (!browserClient) {
    browserClient = createSupabaseClient(url, key);
  }
  return browserClient;
}

declare global {
  interface ImportMeta {
    env?: Record<string, string>;
  }
}
