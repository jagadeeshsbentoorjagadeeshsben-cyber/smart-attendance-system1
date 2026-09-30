import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AttendanceRecovery, AttendanceBuffer, SubjectAttendance } from "@/lib/types";

export function RecoveryCard(props: {
  subject?: SubjectAttendance;
  recovery?: AttendanceRecovery;
  buffer?: AttendanceBuffer;
  percentage?: number;
}) {
  const rec = props.subject ? props.subject.recovery : props.recovery;
  const buf = props.subject ? props.subject.buffer : props.buffer;
  const isShort = (rec?.needed ?? 0) > 0;

  if (isShort) {
    return (
      <div className="flex items-start gap-3.5 rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
            Attendance Recovery Needed
          </h4>
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
            You must attend the next <strong>{rec?.needed}</strong> consecutive classes to reach the mandatory 75% minimum threshold.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
          Safe Margin Available
        </h4>
        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
          You currently have a safety buffer of <strong>{buf?.canMiss ?? 0}</strong> classes while remaining safely above 75%.
        </p>
      </div>
    </div>
  );
}
