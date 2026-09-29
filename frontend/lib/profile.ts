import "server-only";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface StoredProfile {
  usn: string;
  photo: string | null; // Public Supabase Storage URL or data URL/null
  updatedAt: string;
}

const BUCKET = "avatars";

// Persist in-memory store across hot-reloads in dev
const g = globalThis as unknown as {
  __gmitProfileCache?: Map<string, StoredProfile>;
};
const memoryStore: Map<string, StoredProfile> =
  g.__gmitProfileCache ?? (g.__gmitProfileCache = new Map());

export async function getProfile(usn: string): Promise<StoredProfile> {
  const filePath = `${usn}/profile.jpg`;

  if (isSupabaseConfigured) {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET)
        .list(usn);

      if (!listError && files && files.some((f) => f.name === "profile.jpg")) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        return {
          usn,
          photo: `${data.publicUrl}?t=${Date.now()}`,
          updatedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("[profile] Supabase fetch error, using fallback:", err);
    }
  }

  return memoryStore.get(usn) ?? { usn, photo: null, updatedAt: new Date(0).toISOString() };
}

export async function setProfilePhoto(
  usn: string,
  photo: string
): Promise<StoredProfile> {
  const filePath = `${usn}/profile.jpg`;
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      const match = photo.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const contentType = match[1];
        const buffer = Buffer.from(match[2], "base64");

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, buffer, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error("[profile] Supabase upload failed:", uploadError);
          throw uploadError;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
        const profile: StoredProfile = { usn, photo: publicUrl, updatedAt };
        memoryStore.set(usn, profile);
        return profile;
      }
    } catch (err) {
      console.warn("[profile] Supabase save error, saved to memory store:", err);
    }
  }

  const profile: StoredProfile = { usn, photo, updatedAt };
  memoryStore.set(usn, profile);
  return profile;
}

export async function removeProfilePhoto(usn: string): Promise<StoredProfile> {
  const filePath = `${usn}/profile.jpg`;
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      await supabase.storage.from(BUCKET).remove([filePath]);
    } catch (err) {
      console.warn("[profile] Supabase remove error:", err);
    }
  }

  const profile: StoredProfile = { usn, photo: null, updatedAt };
  memoryStore.set(usn, profile);
  return profile;
}
