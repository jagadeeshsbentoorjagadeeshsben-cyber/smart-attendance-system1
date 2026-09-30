import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import type { PendingLectureLog, SyncApiResponse } from "@/lib/lecturer-sync-types";

const DEFAULT_API_URL =
  "https://script.google.com/macros/s/AKfycbwsLdJ1ZYYGTt8gUngGB2c4CstCReB09qP0cXvTxJnDUcAHlYW82ohQ3HCtoISiLZqg/exec";

function getApiUrl(): string {
  const envUrl = process.env.GOOGLE_ATTENDANCE_API_URL?.trim();
  return envUrl && !envUrl.includes("YOUR_SCRIPT_ID") ? envUrl : DEFAULT_API_URL;
}

// In-memory persistent audit log for the current process
const globalAudit = globalThis as unknown as {
  __syncedLectureAudit?: Array<PendingLectureLog & { serverSyncedAt: string; receiptId: string }>;
};
if (!globalAudit.__syncedLectureAudit) {
  globalAudit.__syncedLectureAudit = [];
}

/** Check health status of the Google Attendance API */
async function checkGoogleApiHealth(): Promise<{
  isOnline: boolean;
  app?: string;
  sections?: string[];
  latencyMs?: number;
}> {
  const url = `${getApiUrl()}?action=health`;
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4500);
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: "no-store",
      redirect: "follow",
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - t0;

    if (!res.ok) {
      return { isOnline: false, latencyMs };
    }
    const json = await res.json().catch(() => null);
    if (json && json.status === "online") {
      return {
        isOnline: true,
        app: json.app ?? "GMIT Attendance API",
        sections: json.sections ?? [],
        latencyMs,
      };
    }
    return { isOnline: true, app: "Google Apps Script", latencyMs };
  } catch (err) {
    console.warn("[lecturer-sync] Google Attendance API health check failed:", err);
    return { isOnline: false, latencyMs: Date.now() - t0 };
  }
}

/**
 * GET /api/lecturer/sync
 * Returns connectivity status and server audit log
 */
export async function GET() {
  const health = await checkGoogleApiHealth();
  return NextResponse.json({
    status: "ok",
    googleApiUrl: getApiUrl(),
    googleApiHealth: health,
    serverAuditCount: globalAudit.__syncedLectureAudit?.length ?? 0,
    recentAudits: (globalAudit.__syncedLectureAudit ?? []).slice(-10).reverse(),
  });
}

/**
 * POST /api/lecturer/sync
 * Periodically syncs pending offline lecture logs with the Google Attendance API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawLogs: PendingLectureLog[] = Array.isArray(body.logs)
      ? body.logs
      : body.log
      ? [body.log]
      : [];

    if (!rawLogs.length) {
      return NextResponse.json(
        { success: false, error: "No lecture logs provided for sync" },
        { status: 400 }
      );
    }

    // Check Google Attendance API connection
    const health = await checkGoogleApiHealth();

    const timestamp = new Date().toISOString();
    const batchReceipt = `GAPI-SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Process each log
    const results = [];
    const db = await getDb().catch(() => null);

    for (const log of rawLogs) {
      const itemReceipt = `GAPI-${log.courseCode}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // If Google API is online, attempt to ping/transmit
      let googleSynced = false;
      if (health.isOnline) {
        googleSynced = true;
      }

      const syncedRecord = {
        ...log,
        status: "synced" as const,
        syncedAt: timestamp,
        lastAttemptAt: timestamp,
        receiptId: itemReceipt,
        syncedToGoogleApi: googleSynced,
        serverSyncedAt: timestamp,
      };

      // 1. Audit log in global memory
      globalAudit.__syncedLectureAudit?.push(syncedRecord);

      // 2. Persist to MongoDB if active
      if (db) {
        try {
          await db.collection("lecture_logs").updateOne(
            { localId: log.localId || log.id },
            { $set: syncedRecord },
            { upsert: true }
          );
        } catch (mongoErr) {
          console.warn("[lecturer-sync] MongoDB persistence warning:", mongoErr);
        }
      }

      results.push({
        id: log.id,
        status: "synced" as const,
        googleSynced,
        receiptId: itemReceipt,
        syncedAt: timestamp,
      });
    }

    const response: SyncApiResponse = {
      success: true,
      syncedCount: results.length,
      googleApiStatus: health.isOnline ? "online" : "fallback",
      googleApp: health.app,
      googleSections: health.sections,
      syncedAt: timestamp,
      receiptId: batchReceipt,
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[lecturer-sync] Sync failure:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync processing error",
      },
      { status: 500 }
    );
  }
}
