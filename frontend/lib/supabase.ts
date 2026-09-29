import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    Boolean(url) &&
    url !== "YOUR_SUPABASE_PROJECT_URL" &&
    Boolean(key) &&
    key !== "YOUR_SUPABASE_PUBLISHABLE_KEY"
  );
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const validUrl = isSupabaseConfigured() ? url : "https://placeholder.supabase.co";
  const validKey = isSupabaseConfigured() ? key : "placeholder";

  cachedClient = createClient(validUrl, validKey);
  return cachedClient;
}

export const supabase = getSupabaseClient();
