"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  PendingLectureLog,
  StudentAttendanceEntry,
  SyncApiResponse,
  SyncEngineStatus,
} from "./lecturer-sync-types";

const PENDING_STORAGE_KEY = "gmit_pending_lecture_logs_v1";
const SYNCED_STORAGE_KEY = "gmit_synced_lecture_logs_v1";
const SIMULATED_OFFLINE_KEY = "gmit_simulated_offline_mode";
const SYNC_INTERVAL_SEC = 15; // Periodic background sync cycle in seconds

// Event emitter to notify multiple components if any
const SYNC_EVENT_NAME = "gmit_lecturer_sync_state_changed";

function dispatchSyncEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME));
  }
}

/** Safely read pending logs from localStorage */
export function getStoredPendingLogs(): PendingLectureLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Safely save pending logs */
function setStoredPendingLogs(logs: PendingLectureLog[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(logs));
    dispatchSyncEvent();
  } catch (e) {
    console.error("Failed to save pending logs to storage:", e);
  }
}

/** Safely read synced logs */
export function getStoredSyncedLogs(): PendingLectureLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SYNCED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Safely append synced logs */
function appendStoredSyncedLogs(newLogs: PendingLectureLog[]): void {
  if (typeof window === "undefined" || !newLogs.length) return;
  try {
    const existing = getStoredSyncedLogs();
    const updated = [...newLogs, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem(SYNCED_STORAGE_KEY, JSON.stringify(updated));
    dispatchSyncEvent();
  } catch (e) {
    console.error("Failed to append synced logs to storage:", e);
  }
}

/** Check simulated offline mode */
export function isSimulatedOffline(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIMULATED_OFFLINE_KEY) === "true";
}

export function setSimulatedOffline(val: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SIMULATED_OFFLINE_KEY, val ? "true" : "false");
  dispatchSyncEvent();
}

/**
 * Sends a batch of pending logs to the backend sync API
 */
async function syncBatchToServer(logs: PendingLectureLog[]): Promise<SyncApiResponse> {
  const res = await fetch("/api/lecturer/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logs }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sync API responded with status ${res.status}: ${errText}`);
  }
  return res.json();
}

/**
 * Main React Hook providing the background sync engine to the lecturer portal
 */
export function useLecturerSync() {
  const [pendingLogs, setPendingLogs] = useState<PendingLectureLog[]>([]);
  const [syncedLogs, setSyncedLogs] = useState<PendingLectureLog[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(SYNC_INTERVAL_SEC);
  const [googleApiStatus, setGoogleApiStatus] = useState<
    "online" | "offline" | "checking" | "unknown"
  >("checking");

  const isSyncingRef = useRef(false);

  // Refresh local state from storage
  const reloadFromStorage = useCallback(() => {
    setPendingLogs(getStoredPendingLogs());
    setSyncedLogs(getStoredSyncedLogs());
    setIsSimulated(isSimulatedOffline());
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine && !isSimulatedOffline());
    }
  }, []);

  // Periodic health check of Google Attendance API
  const checkGoogleHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/lecturer/sync");
      if (res.ok) {
        const json = await res.json();
        setGoogleApiStatus(json.googleApiHealth?.isOnline ? "online" : "offline");
      }
    } catch {
      setGoogleApiStatus("offline");
    }
  }, []);

  // Core Sync Execution Logic
  const performSync = useCallback(
    async (manual = false): Promise<boolean> => {
      if (isSyncingRef.current) return false;

      const simulated = isSimulatedOffline();
      const online = typeof navigator !== "undefined" ? navigator.onLine && !simulated : true;

      if (!online) {
        if (manual) {
          setLastError("Device is offline. Logs remain queued and will sync when network connects.");
        }
        return false;
      }

      const currentPending = getStoredPendingLogs();
      if (currentPending.length === 0) {
        // Nothing to sync; check health and reset
        checkGoogleHealth();
        return true;
      }

      isSyncingRef.current = true;
      setIsSyncing(true);
      setLastError(null);

      // Mark items as syncing
      const nowIso = new Date().toISOString();
      const inFlight = currentPending.map((item) => ({
        ...item,
        status: "syncing" as const,
        lastAttemptAt: nowIso,
        retryCount: item.retryCount + 1,
      }));
      setStoredPendingLogs(inFlight);

      try {
        const response = await syncBatchToServer(inFlight);

        if (response.success) {
          // Identify successful IDs
          const successfulIds = new Set(
            response.results.filter((r) => r.status === "synced").map((r) => r.id)
          );

          const syncedBatch: PendingLectureLog[] = inFlight
            .filter((item) => successfulIds.has(item.id))
            .map((item) => {
              const resMeta = response.results.find((r) => r.id === item.id);
              return {
                ...item,
                status: "synced" as const,
                syncedAt: resMeta?.syncedAt || nowIso,
                receiptId: resMeta?.receiptId || response.receiptId,
                syncedToGoogleApi: resMeta?.googleSynced ?? true,
              };
            });

          // Remaining pending items
          const remainingPending = inFlight.filter((item) => !successfulIds.has(item.id));
          setStoredPendingLogs(remainingPending);
          appendStoredSyncedLogs(syncedBatch);

          setLastSyncTime(new Date().toLocaleTimeString());
          setGoogleApiStatus(response.googleApiStatus === "online" ? "online" : "offline");
          setIsSyncing(false);
          isSyncingRef.current = false;
          return true;
        } else {
          throw new Error(response.error || "Sync server rejected the batch");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Sync error";
        console.warn("[lecturer-sync] Background sync failed, retrying on next cycle:", message);
        setLastError(message);

        // Mark items back to pending or failed
        const reverted = inFlight.map((item) => ({
          ...item,
          status: (item.retryCount >= 5 ? "failed" : "pending") as "failed" | "pending",
          error: message,
        }));
        setStoredPendingLogs(reverted);

        setIsSyncing(false);
        isSyncingRef.current = false;
        return false;
      }
    },
    [checkGoogleHealth]
  );

  // Queue a new lecture log (e.g. from attendance register)
  const queueLectureLog = useCallback(
    (logData: {
      date: string;
      period: string;
      courseCode: string;
      courseName: string;
      section: string;
      topic: string;
      presentCount: number;
      totalCount: number;
      roster: StudentAttendanceEntry[];
    }): PendingLectureLog => {
      const nowIso = new Date().toISOString();
      const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newLog: PendingLectureLog = {
        id: localId,
        localId,
        date: logData.date,
        period: logData.period,
        courseCode: logData.courseCode,
        courseName: logData.courseName,
        section: logData.section,
        topic: logData.topic,
        presentCount: logData.presentCount,
        totalCount: logData.totalCount,
        roster: logData.roster,
        status: "pending",
        createdAt: nowIso,
        retryCount: 0,
      };

      const current = getStoredPendingLogs();
      const updated = [newLog, ...current];
      setStoredPendingLogs(updated);

      // Attempt immediate background sync if online
      setTimeout(() => {
        performSync();
      }, 100);

      return newLog;
    },
    [performSync]
  );

  // Retry an individual pending log
  const retryLog = useCallback(
    async (id: string) => {
      const current = getStoredPendingLogs();
      const item = current.find((i) => i.id === id);
      if (!item) return;

      const updated = current.map((i) =>
        i.id === id ? { ...i, status: "pending" as const, error: undefined } : i
      );
      setStoredPendingLogs(updated);
      await performSync(true);
    },
    [performSync]
  );

  // Delete a pending log from the queue
  const deletePendingLog = useCallback((id: string) => {
    const current = getStoredPendingLogs();
    const updated = current.filter((i) => i.id !== id);
    setStoredPendingLogs(updated);
  }, []);

  // Clear all pending logs
  const clearPendingQueue = useCallback(() => {
    setStoredPendingLogs([]);
  }, []);

  // Toggle simulated offline mode
  const toggleSimulatedOffline = useCallback(() => {
    const nextVal = !isSimulatedOffline();
    setSimulatedOffline(nextVal);
    setIsSimulated(nextVal);
    setIsOnline(navigator.onLine && !nextVal);
  }, []);

  // Mount effects & Background Sync loop
  useEffect(() => {
    reloadFromStorage();
    checkGoogleHealth();

    const handleOnline = () => {
      setIsOnline(!isSimulatedOffline());
      // On reconnect, immediately run background sync
      performSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    const handleSyncEvent = () => {
      reloadFromStorage();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener(SYNC_EVENT_NAME, handleSyncEvent);

    // Initial sync check
    performSync();

    // 1-second countdown ticker for visual transparency
    const ticker = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger background sync cycle
          performSync();
          return SYNC_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(SYNC_EVENT_NAME, handleSyncEvent);
      clearInterval(ticker);
    };
  }, [reloadFromStorage, checkGoogleHealth, performSync]);

  const effectiveOnline = isOnline && !isSimulated;

  const status: SyncEngineStatus = {
    isOnline: effectiveOnline,
    isSimulatedOffline: isSimulated,
    isSyncing,
    pendingCount: pendingLogs.length,
    syncedCount: syncedLogs.length,
    failedCount: pendingLogs.filter((l) => l.status === "failed").length,
    lastSyncTime,
    nextSyncCountdown: countdown,
    lastError,
    googleApiStatus,
  };

  return {
    status,
    pendingLogs,
    syncedLogs,
    queueLectureLog,
    syncNow: () => performSync(true),
    retryLog,
    deletePendingLog,
    clearPendingQueue,
    toggleSimulatedOffline,
    checkGoogleHealth,
  };
}
