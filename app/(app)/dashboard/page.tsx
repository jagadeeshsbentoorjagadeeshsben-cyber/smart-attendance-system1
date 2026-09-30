"use client";

import { useAttendance } from "@/components/attendance-provider";
import { StudentHeader } from "@/components/student-header";
import { RefreshControl } from "@/components/refresh-control";
import { AttendanceRing } from "@/components/attendance-ring";
import { StatusBadge } from "@/components/status-badge";
import { SubjectCard } from "@/components/subject-card";
import { DashboardSkeleton } from "@/components/skeletons";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { STATUS_THEME, healthMessage } from "@/lib/status";
import { formatPct } from "@/lib/utils";
import { BookOpen, Users, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data, loading, error, refresh, refreshing } = useAttendance();

  if (loading && !data) return <DashboardSkeleton />;
  if (error && !data)
    return <ErrorState message={error} onRetry={refresh} retrying={refreshing} />;
  if (!data) return null;

  const { student, overall, subjects } = data;
  const theme = STATUS_THEME[overall.displayStatus];

  return (
    <div className="space-y-8 animate-fade-up">
      <StudentHeader student={student} />
      <RefreshControl />

      {/* Role Switcher Shortcuts */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/lecturer"
          className="group flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-royal/50 hover:bg-surface-2"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-royal/10 text-royal">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink group-hover:text-royal transition-colors">
                Lecturer Portal
              </h3>
              <p className="text-xs text-muted">Daily roll call & lecture logger</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted group-hover:text-royal group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/hod"
          className="group flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-royal/50 hover:bg-surface-2"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-royal/10 text-royal">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink group-hover:text-royal transition-colors">
                HOD Desk
              </h3>
              <p className="text-xs text-muted">Department oversight & VTU audit</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted group-hover:text-royal group-hover:translate-x-0.5 transition-all" />
        </Link>
      </section>

      {/* Hero */}

      <section className="flex flex-col items-center pt-2 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Overall Attendance
        </p>
        <AttendanceRing
          percentage={overall.percentage}
          hex={theme.hex}
          size={228}
        >
          <span
            className="tnum text-[44px] font-bold leading-none tracking-tight text-ink"
            data-testid="overall-percentage"
          >
            {formatPct(overall.percentage)}
          </span>
          <span className="tnum mt-2 text-sm text-muted">
            {overall.attended} / {overall.conducted} classes
          </span>
          <div className="mt-3">
            <StatusBadge status={overall.displayStatus} />
          </div>
        </AttendanceRing>

        <p className="mt-6 max-w-sm text-[15px] text-ink">
          {healthMessage(overall.percentage, overall.isStarted)}
        </p>
        <p className="tnum mt-1 text-xs text-muted">
          Minimum required · {overall.minimumRequired}%
        </p>
      </section>

      {/* Subjects */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Subjects
          </h2>
          <span className="tnum text-xs text-muted">{subjects.length} total</span>
        </div>
        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects available"
            description="Your subjects will appear here once they are added."
          />
        ) : (
          <div className="space-y-3">
            {subjects.map((s) => (
              <SubjectCard key={`${s.subject}-${s.courseCode}`} subject={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
