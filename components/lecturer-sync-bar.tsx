"use client";

import { useState } from "react";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Wifi,
  WifiOff,
  Trash2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SyncEngineStatus, PendingLectureLog } from "@/lib/lecturer-sync-types";

interface LecturerSyncBarProps {
  status: SyncEngineStatus;
  pendingLogs: PendingLectureLog[];
  syncedLogs: PendingLectureLog[];
  onSyncNow: () => void;
  onToggleSimulatedOffline: () => void;
  onRetryLog: (id: string) => void;
  onDeleteLog: (id: string) => void;
  onClearQueue: () => void;
}

export function LecturerSyncBar({
  status,
  pendingLogs,
  syncedLogs,
  onSyncNow,
  onToggleSimulatedOffline,
  onRetryLog,
  onDeleteLog,
  onClearQueue,
}: LecturerSyncBarProps) {
  const [showQueueModal, setShowQueueModal] = useState(false);

  return (
    <>
      <div
        className={cn(
          "rounded-lg border px-4 py-3 transition-all",
          status.isSimulatedOffline
            ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
            : status.isSyncing
            ? "border-royal/40 bg-royal/5 text-ink"
            : status.pendingCount > 0
            ? "border-amber-400/40 bg-surface text-ink"
            : "border-border bg-surface text-ink"
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Online / Offline status */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                status.isOnline
                  ? "bg-success/15 text-success"
                  : "bg-danger/15 text-danger"
              )}
            >
              {status.isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>{status.isSimulatedOffline ? "Offline (Simulated)" : "Offline"}</span>
                </>
              )}
            </div>

            {/* Google API status badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
              <Cloud className={cn("h-3.5 w-3.5", status.googleApiStatus === "online" ? "text-royal" : "text-muted")} />
              <span>Google API:</span>
              <span
                className={cn(
                  "font-semibold",
                  status.googleApiStatus === "online"
                    ? "text-success"
                    : status.googleApiStatus === "checking"
                    ? "text-muted"
                    : "text-danger"
                )}
              >
                {status.googleApiStatus === "online" ? "Connected" : status.googleApiStatus}
              </span>
            </div>

            {/* Pending queue badge */}
            {status.pendingCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowQueueModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-colors"
              >
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                <span>{status.pendingCount} pending offline sync</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>All lecture logs synced</span>
              </div>
            )}

            {/* Next sync countdown */}
            <span className="hidden text-[11px] text-muted md:inline">
              Auto-sync in {status.nextSyncCountdown}s
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Offline Simulation toggle */}
            <button
              type="button"
              onClick={onToggleSimulatedOffline}
              title="Simulate offline classroom conditions to test offline queueing"
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                status.isSimulatedOffline
                  ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                  : "border-border bg-surface-2 text-muted hover:text-ink hover:border-royal/40"
              )}
            >
              {status.isSimulatedOffline ? "Exit Offline Mode" : "Simulate Offline"}
            </button>

            {/* Sync Now button */}
            <button
              type="button"
              onClick={onSyncNow}
              disabled={status.isSyncing || (!status.isOnline && status.pendingCount === 0)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold shadow-subtle transition-all",
                status.isSyncing
                  ? "bg-royal/70 text-white cursor-wait"
                  : "bg-royal text-white hover:bg-royal/90 active:scale-[0.98]"
              )}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", status.isSyncing && "animate-spin")} />
              <span>{status.isSyncing ? "Syncing with Google API…" : "Sync Now"}</span>
            </button>

            {/* Queue viewer button */}
            {status.pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setShowQueueModal(true)}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface-2 transition-colors"
              >
                Queue ({status.pendingCount})
              </button>
            )}
          </div>
        </div>

        {/* Error notification if sync failed */}
        {status.lastError && (
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger">
            <div className="flex items-center gap-2 truncate">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{status.lastError}</span>
            </div>
            <button
              type="button"
              onClick={onSyncNow}
              className="shrink-0 font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Pending Sync Queue Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-lift animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Offline Sync Queue</h3>
                <p className="text-xs text-muted">
                  Lectures recorded locally waiting for transmission to Google Attendance API.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQueueModal(false)}
                className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
              {pendingLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
                  <p>Queue is empty! All lecture registers are in sync with Google API.</p>
                </div>
              ) : (
                pendingLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-border bg-surface-2/60 p-3.5 text-xs transition-colors hover:border-royal/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{log.courseCode}</span>
                          <span className="text-muted">· Section {log.section}</span>
                          <span className="rounded bg-royal/10 px-1.5 py-0.5 font-medium text-royal">
                            {log.period}
                          </span>
                        </div>
                        <p className="mt-1 font-medium text-ink">{log.topic}</p>
                        <div className="mt-1 text-[11px] text-muted">
                          <span>Date: {log.date}</span>
                          <span className="mx-1.5">·</span>
                          <span className="font-semibold text-ink">
                            {log.presentCount} / {log.totalCount} present
                          </span>
                          {log.retryCount > 0 && (
                            <>
                              <span className="mx-1.5">·</span>
                              <span className="text-amber-600 dark:text-amber-400">
                                Retried {log.retryCount}x
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onRetryLog(log.id)}
                          title="Sync this log now"
                          className="rounded-md border border-royal/30 bg-royal/10 p-1.5 text-royal hover:bg-royal/20 transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          title="Remove from queue"
                          className="rounded-md border border-danger/30 bg-danger/10 p-1.5 text-danger hover:bg-danger/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
              {pendingLogs.length > 0 ? (
                <button
                  type="button"
                  onClick={onClearQueue}
                  className="text-xs font-semibold text-danger hover:underline"
                >
                  Clear All Pending
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-2"
                >
                  Close
                </button>
                {pendingLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onSyncNow();
                      setShowQueueModal(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-royal px-3.5 py-1.5 text-xs font-semibold text-white shadow-subtle hover:bg-royal/90"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Sync All Now</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
