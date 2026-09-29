import "server-only";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

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

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      const { data: files, error: listError } = await client.storage
        .from(BUCKET)
        .list(usn);

      console.log(`[Supabase list ${usn}]:`, { files, listError });

      if (!listError && files && files.some((f) => f.name === "profile.jpg")) {
        const { data } = client.storage.from(BUCKET).getPublicUrl(filePath);
        console.log(`[Supabase public URL ${usn}]:`, data.publicUrl);
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

  if (isSupabaseConfigured()) {
    const match = photo.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      const contentType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      const uint8Array = new Uint8Array(buffer);

      console.log(`[Supabase uploading ${filePath}]:`, {
        bucket: BUCKET,
        size: uint8Array.byteLength,
        contentType,
      });

      const client = getSupabaseClient();
      const { data: uploadData, error: uploadError } = await client.storage
        .from(BUCKET)
        .upload(filePath, uint8Array, {
          contentType,
          upsert: true,
        });

      console.log("[Supabase upload response]:", { uploadData, uploadError });

      if (uploadError) {
        console.error(`[Supabase Upload Failed] ${uploadError.message}:`, uploadError);
        throw new Error(`Supabase upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      console.log("[Supabase Upload Success Public URL]:", publicUrl);

      const profile: StoredProfile = { usn, photo: publicUrl, updatedAt };
      memoryStore.set(usn, profile);
      return profile;
    }
  }

  console.warn("[profile] Supabase not configured or invalid image data, saving to memory fallback");
  const profile: StoredProfile = { usn, photo, updatedAt };
  memoryStore.set(usn, profile);
  return profile;
}

export async function removeProfilePhoto(usn: string): Promise<StoredProfile> {
  const filePath = `${usn}/profile.jpg`;
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      const { data, error: removeError } = await client.storage.from(BUCKET).remove([filePath]);
      console.log(`[Supabase remove ${filePath} response]:`, { data, removeError });
      if (removeError) {
        console.error(`[Supabase Remove Failed]:`, removeError);
      }
    } catch (err) {
      console.warn("[profile] Supabase remove error:", err);
    }
  }

  const profile: StoredProfile = { usn, photo: null, updatedAt };
  memoryStore.set(usn, profile);
  return profile;
}
