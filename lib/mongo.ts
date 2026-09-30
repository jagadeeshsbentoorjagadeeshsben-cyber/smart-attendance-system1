import "server-only";
import { MongoClient, Db } from "mongodb";

const rawUri = process.env.MONGO_URL?.trim();
const uri = rawUri && !rawUri.includes("YOUR_") ? rawUri : null;
const dbName = process.env.DB_NAME?.trim() || "smart_attendance";

const g = globalThis as unknown as {
  __gmitMongo?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> | null {
  if (!uri) return null;
  if (!g.__gmitMongo) {
    g.__gmitMongo = new MongoClient(uri).connect().catch((err) => {
      console.warn("[AI Studio] MongoDB connection skipped/failed:", err.message);
      return null as unknown as MongoClient;
    });
  }
  return g.__gmitMongo;
}

export async function getDb(): Promise<Db | null> {
  const promise = clientPromise();
  if (!promise) return null;
  try {
    const client = await promise;
    return client ? client.db(dbName) : null;
  } catch {
    return null;
  }
}
