"use client";

import { useAttendance } from "./attendance-provider";
import { RefreshCw } from "lucide-react";

export function RefreshControl() {
  const { refreshing, refresh, data } = useAttendance();

  const formattedTime = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex items-center justify-between text-xs text-muted">
      <div>
        {formattedTime ? (
          <span>Last synchronized at {formattedTime}</span>
        ) : (
          <span>Real-time attendance view</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => refresh()}
        disabled={refreshing}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-ink hover:bg-surface-2 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-royal" : ""}`} />
        <span>{refreshing ? "Syncing..." : "Sync"}</span>
      </button>
    </div>
  );
}
