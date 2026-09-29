import "server-only";
import { getDb } from "./mongo";

/**
 * Profile storage abstraction. Currently backed by MongoDB storing the
 * profile photo as a base64 data URL. Kept intentionally small so the
 * storage backend can be swapped for object storage later without
 * touching the profile UI or route handlers.
 */

export interface StoredProfile {
  usn: string;
  photo: string | null; // data URL or null
  updatedAt: string;
}

const COLLECTION = "profiles";

// Persist in-memory store across hot-reloads in dev / server instance
const g = globalThis as unknown as {
  __gmitProfileCache?: Map<string, StoredProfile>;
};
const memoryStore: Map<string, StoredProfile> =
  g.__gmitProfileCache ?? (g.__gmitProfileCache = new Map());

export async function getProfile(usn: string): Promise<StoredProfile> {
  if (process.env.MONGO_URL) {
    try {
      const db = await getDb();
      const doc = await db
        .collection<StoredProfile>(COLLECTION)
        .findOne({ usn }, { projection: { _id: 0 } });
      if (doc) return doc;
    } catch (err) {
      console.warn("[profile] MongoDB fetch failed, using memory store:", err);
    }
  }
  return memoryStore.get(usn) ?? { usn, photo: null, updatedAt: new Date(0).toISOString() };
}

export async function setProfilePhoto(
  usn: string,
  photo: string
): Promise<StoredProfile> {
  const updatedAt = new Date().toISOString();
  const profile: StoredProfile = { usn, photo, updatedAt };
  memoryStore.set(usn, profile);

  if (process.env.MONGO_URL) {
    try {
      const db = await getDb();
      await db
        .collection<StoredProfile>(COLLECTION)
        .updateOne(
          { usn },
          { $set: { usn, photo, updatedAt } },
          { upsert: true }
        );
    } catch (err) {
      console.warn("[profile] MongoDB save failed, saved to memory fallback:", err);
    }
  }
  return profile;
}

export async function removeProfilePhoto(usn: string): Promise<StoredProfile> {
  const updatedAt = new Date().toISOString();
  const profile: StoredProfile = { usn, photo: null, updatedAt };
  memoryStore.set(usn, profile);

  if (process.env.MONGO_URL) {
    try {
      const db = await getDb();
      await db
        .collection<StoredProfile>(COLLECTION)
        .updateOne(
          { usn },
          { $set: { usn, photo: null, updatedAt } },
          { upsert: true }
        );
    } catch (err) {
      console.warn("[profile] MongoDB remove failed, updated memory fallback:", err);
    }
  }
  return profile;
}
