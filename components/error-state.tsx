import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  message = "Failed to load data.",
  onRetry,
  retrying = false,
}: {
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">Connection Issue</h3>
      <p className="mt-1 text-xs text-muted max-w-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-royal px-4 py-2 text-xs font-semibold text-white shadow hover:bg-royal/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} />
          <span>{retrying ? "Retrying..." : "Try Again"}</span>
        </button>
      )}
    </div>
  );
}
