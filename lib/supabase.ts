import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  if (!url || !key) return false;
  if (url.includes("YOUR_SUPABASE") || key.includes("YOUR_SUPABASE")) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const isConfigured = isSupabaseConfigured();
  const url = isConfigured
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
    : "https://placeholder.supabase.co";
  const key = isConfigured
    ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
    : "placeholder-anon-key";

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedClient;
}

export const supabase = getSupabaseClient();
