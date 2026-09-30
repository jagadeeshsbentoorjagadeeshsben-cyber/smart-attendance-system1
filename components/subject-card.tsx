import Link from "next/link";
import type { SubjectAttendance } from "@/lib/types";
import { StatusBadge } from "./status-badge";
import { formatPct } from "@/lib/utils";
import { STATUS_THEME } from "@/lib/status";
import { ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

export function SubjectCard({ subject }: { subject: SubjectAttendance }) {
  const theme = STATUS_THEME[subject.displayStatus];

  return (
    <Link
      href={`/subjects/${encodeURIComponent(subject.subject)}`}
      className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 transition-all hover:border-royal/50 hover:shadow-sm"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted">
              {subject.courseCode}
            </span>
            <h3 className="mt-1 font-semibold text-ink group-hover:text-royal transition-colors line-clamp-1">
              {subject.subject}
            </h3>
            {subject.teacher && (
              <p className="mt-0.5 text-xs text-muted line-clamp-1">{subject.teacher}</p>
            )}
          </div>
          <StatusBadge status={subject.displayStatus} />
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <div>
            <span className="text-2xl font-black tracking-tight" style={{ color: theme.ringColor }}>
              {formatPct(subject.percentage)}
            </span>
            <p className="text-xs text-muted mt-0.5">
              {subject.attended} / {subject.conducted} classes
            </p>
          </div>

          <div className="text-right">
            {subject.buffer.canMiss > 0 ? (
              <p className="flex items-center justify-end gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Can miss {subject.buffer.canMiss}</span>
              </p>
            ) : subject.recovery.needed > 0 ? (
              <p className="flex items-center justify-end gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Need {subject.recovery.needed} more</span>
              </p>
            ) : (
              <p className="text-xs text-muted font-medium">On boundary</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted group-hover:text-royal transition-colors">
        <span>View breakdown & prediction</span>
        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
