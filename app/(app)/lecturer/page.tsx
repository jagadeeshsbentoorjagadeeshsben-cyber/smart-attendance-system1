"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Check,
  RotateCcw,
  Trash2,
  Cloud,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  FACULTY_COURSES,
  INITIAL_STUDENT_ROSTER,
  INITIAL_LECTURE_LOGS,
  type FacultyCourse,
  type StudentRollItem,
  type LectureLog,
} from "@/lib/department-data";
import { cn } from "@/lib/utils";
import { useLecturerSync } from "@/lib/lecturer-sync-service";
import { LecturerSyncBar } from "@/components/lecturer-sync-bar";

export default function LecturerPage() {
  const [selectedCourse, setSelectedCourse] = useState<FacultyCourse>(FACULTY_COURSES[0]);
  const [activeTab, setActiveTab] = useState<"rollcall" | "history" | "defaulters" | "sync_queue">("rollcall");

  // Background sync engine hook
  const {
    status: syncStatus,
    pendingLogs,
    syncedLogs,
    queueLectureLog,
    syncNow,
    retryLog,
    deletePendingLog,
    clearPendingQueue,
    toggleSimulatedOffline,
  } = useLecturerSync();

  // Daily attendance state
  const [lectureDate, setLectureDate] = useState<string>("2026-09-30");
  const [period, setPeriod] = useState<string>("Period 3 (11:15 - 12:15 PM)");
  const [topic, setTopic] = useState<string>("Distance Vector vs Link State Routing: Comparative Efficiency");
  const [students, setStudents] = useState<StudentRollItem[]>(() => {
    return INITIAL_STUDENT_ROSTER[FACULTY_COURSES[0].code] ?? INITIAL_STUDENT_ROSTER["21CS52"];
  });
  const [logs, setLogs] = useState<LectureLog[]>(INITIAL_LECTURE_LOGS);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [sentAlertUsn, setSentAlertUsn] = useState<Record<string, boolean>>({});

  const handleCourseChange = (course: FacultyCourse) => {
    setSelectedCourse(course);
    const roster = INITIAL_STUDENT_ROSTER[course.code] ?? INITIAL_STUDENT_ROSTER["21CS52"];
    setStudents(roster.map((s) => ({ ...s, status: "PRESENT" })));
    setSubmitSuccess(null);
  };

  const setAllStatus = (status: "PRESENT" | "ABSENT") => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const toggleStudentStatus = (usn: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.usn !== usn) return s;
        const next: Record<"PRESENT" | "ABSENT" | "ON_DUTY", "PRESENT" | "ABSENT" | "ON_DUTY"> = {
          PRESENT: "ABSENT",
          ABSENT: "ON_DUTY",
          ON_DUTY: "PRESENT",
        };
        return { ...s, status: next[s.status] };
      })
    );
  };

  const presentCount = students.filter((s) => s.status === "PRESENT" || s.status === "ON_DUTY").length;
  const attendanceRate = students.length > 0 ? (presentCount / students.length) * 100 : 0;

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();

    const topicClean = topic.trim() || "Regular Lecture & Discussion";

    // 1. Queue into the background sync engine (which persists to storage & auto-syncs)
    const queuedItem = queueLectureLog({
      date: lectureDate,
      period,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      section: selectedCourse.section,
      topic: topicClean,
      presentCount,
      totalCount: students.length,
      roster: students.map((s) => ({
        usn: s.usn,
        name: s.name,
        status: s.status,
      })),
    });

    // 2. Add to in-memory conduction log
    const newLog: LectureLog = {
      id: queuedItem.id,
      date: lectureDate,
      period,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      section: selectedCourse.section,
      topic: topicClean,
      presentCount,
      totalCount: students.length,
    };
    setLogs([newLog, ...logs]);

    // 3. Update cumulative statistics for students
    setStudents((prev) =>
      prev.map((s) => {
        const isPres = s.status === "PRESENT" || s.status === "ON_DUTY";
        return {
          ...s,
          cumulativeConducted: s.cumulativeConducted + 1,
          cumulativeAttended: isPres ? s.cumulativeAttended + 1 : s.cumulativeAttended,
        };
      })
    );

    if (syncStatus.isOnline) {
      setSubmitSuccess(
        `Attendance recorded! Background sync initiated with Google Attendance API for ${selectedCourse.code} (${presentCount}/${students.length} present).`
      );
    } else {
      setSubmitSuccess(
        `Offline: Attendance saved to local device. The background service will periodically sync with Google Attendance API once connected.`
      );
    }

    setTimeout(() => setSubmitSuccess(null), 6000);
  };

  const handleSendWarning = (usn: string) => {
    setSentAlertUsn((prev) => ({ ...prev, [usn]: true }));
    setTimeout(() => {
      setSentAlertUsn((prev) => ({ ...prev, [usn]: false }));
    }, 4000);
  };

  const defaulters = students.filter((s) => {
    const pct = (s.cumulativeAttended / s.cumulativeConducted) * 100;
    return pct < 75;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Lecturer Portal
            </h1>
            <p className="mt-1 text-sm text-muted">
              Faculty Attendance Register & Offline Sync Engine · Department of Computer Science & Engineering
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted sm:mt-0">
            <span className="font-semibold text-ink">Prof. Anitha M.</span>
            <span aria-hidden="true">·</span>
            <span>Emp ID: GMIT-CS-042</span>
          </div>
        </div>

        {/* Course Switcher Chips */}
        <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FACULTY_COURSES.map((course) => {
            const isSelected = selectedCourse.id === course.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => handleCourseChange(course)}
                className={cn(
                  "shrink-0 rounded-lg border px-3.5 py-2 text-left text-xs transition-all",
                  isSelected
                    ? "border-royal bg-royal text-white shadow-subtle"
                    : "border-border bg-surface text-ink hover:bg-surface-2"
                )}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <span>{course.code}</span>
                  <span className={isSelected ? "text-white/80" : "text-muted"}>
                    Section {course.section}
                  </span>
                </div>
                <div className={cn("mt-0.5 truncate text-[11px]", isSelected ? "text-white/90" : "text-muted")}>
                  {course.name}
                </div>
              </button>
            );
          })}
        </div>
      </header>

      {/* Background Service Status Bar */}
      <LecturerSyncBar
        status={syncStatus}
        pendingLogs={pendingLogs}
        syncedLogs={syncedLogs}
        onSyncNow={syncNow}
        onToggleSimulatedOffline={toggleSimulatedOffline}
        onRetryLog={retryLog}
        onDeleteLog={deletePendingLog}
        onClearQueue={clearPendingQueue}
      />

      {/* Course Snapshot Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Lectures Conducted</p>
          <p className="tnum mt-1 text-2xl font-bold text-ink">{selectedCourse.conducted + (logs.length - INITIAL_LECTURE_LOGS.length)}</p>
          <p className="mt-0.5 text-[11px] text-muted">{selectedCourse.room}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Avg Attendance</p>
          <p className="tnum mt-1 text-2xl font-bold text-ink">{selectedCourse.avgAttendance}%</p>
          <p className="mt-0.5 text-[11px] text-success">Target: ≥ 75%</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Enrolled Students</p>
          <p className="tnum mt-1 text-2xl font-bold text-ink">{selectedCourse.totalStudents}</p>
          <p className="mt-0.5 text-[11px] text-muted">{selectedCourse.semester}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Shortage (&lt;75%)</p>
          <p className="tnum mt-1 text-2xl font-bold text-danger">{defaulters.length}</p>
          <p className="mt-0.5 text-[11px] text-danger">Action required</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm font-medium overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("rollcall")}
          className={cn(
            "border-b-2 px-4 py-2.5 transition-colors whitespace-nowrap",
            activeTab === "rollcall"
              ? "border-royal text-royal font-semibold"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          Daily Roll Call
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "border-b-2 px-4 py-2.5 transition-colors whitespace-nowrap",
            activeTab === "history"
              ? "border-royal text-royal font-semibold"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          Conduction History ({logs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("defaulters")}
          className={cn(
            "border-b-2 px-4 py-2.5 transition-colors whitespace-nowrap",
            activeTab === "defaulters"
              ? "border-royal text-royal font-semibold"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          Shortage Radar ({defaulters.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sync_queue")}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition-colors whitespace-nowrap",
            activeTab === "sync_queue"
              ? "border-royal text-royal font-semibold"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          <span>Offline Sync Queue</span>
          {pendingLogs.length > 0 && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {pendingLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Roll Call */}
      {activeTab === "rollcall" && (
        <section className="space-y-5">
          <form onSubmit={handleSubmitAttendance} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Mark Lecture Attendance</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Select date, period, and click students to toggle status (Present / Absent / On Duty).
                </p>
              </div>
              <span className="text-xs text-muted">
                {syncStatus.isOnline ? "🟢 Direct Auto-Sync" : "🟡 Local Offline Queue"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Date
                </label>
                <input
                  type="date"
                  value={lectureDate}
                  onChange={(e) => setLectureDate(e.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink focus:border-royal focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Time Slot & Period
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink focus:border-royal focus:outline-none"
                >
                  <option value="Period 1 (09:00 - 10:00 AM)">Period 1 (09:00 - 10:00 AM)</option>
                  <option value="Period 2 (10:15 - 11:15 AM)">Period 2 (10:15 - 11:15 AM)</option>
                  <option value="Period 3 (11:15 - 12:15 PM)">Period 3 (11:15 - 12:15 PM)</option>
                  <option value="Period 4 (12:15 - 01:15 PM)">Period 4 (12:15 - 01:15 PM)</option>
                  <option value="Period 5 (02:00 - 03:00 PM)">Period 5 (02:00 - 03:00 PM)</option>
                  <option value="Period 6 (03:00 - 04:00 PM)">Period 6 (03:00 - 04:00 PM)</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                Lecture Topic / Unit Coverage
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Unit 3: Bellman-Ford algorithm derivation & count-to-infinity"
                className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink focus:border-royal focus:outline-none"
                required
              />
            </div>

            {/* Quick Actions & Tally */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllStatus("PRESENT")}
                  className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink hover:border-royal/50 hover:text-royal"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => setAllStatus("ABSENT")}
                  className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink hover:border-danger/50 hover:text-danger"
                >
                  Mark All Absent
                </button>
              </div>

              <div className="text-right">
                <span className="tnum text-sm font-semibold text-ink">
                  {presentCount} / {students.length} Present
                </span>
                <span className="tnum ml-2 text-xs text-muted">
                  ({attendanceRate.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Student List */}
            <div className="mt-4 divide-y divide-border rounded-md border border-border max-h-[460px] overflow-y-auto">
              {students.map((student) => {
                const cumPct = Math.round((student.cumulativeAttended / student.cumulativeConducted) * 1000) / 10;
                const isShortage = cumPct < 75;

                return (
                  <div
                    key={student.usn}
                    className="flex items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-surface-2/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="tnum text-xs font-bold text-ink">{student.usn}</span>
                        <span className="text-sm font-medium text-ink">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>Cumulative: {student.cumulativeAttended}/{student.cumulativeConducted}</span>
                        <span aria-hidden="true">·</span>
                        <span className={cn("tnum font-semibold", isShortage ? "text-danger" : "text-success")}>
                          {cumPct}%
                        </span>
                        {isShortage && (
                          <span className="text-[11px] font-semibold text-danger">Shortage alert</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleStudentStatus(student.usn)}
                        className={cn(
                          "tnum min-w-[76px] rounded-md px-3 py-1.5 text-xs font-bold transition-all",
                          student.status === "PRESENT" && "bg-success/15 text-success border border-success/30",
                          student.status === "ABSENT" && "bg-danger/15 text-danger border border-danger/30",
                          student.status === "ON_DUTY" && "bg-royal/15 text-royal border border-royal/30"
                        )}
                      >
                        {student.status}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {submitSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3.5 py-2.5 text-xs font-medium text-success">
                <Check className="h-4 w-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-royal px-4 py-2.5 text-sm font-semibold text-white shadow-subtle hover:bg-royal/90 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save & Sync Attendance Register</span>
            </button>
          </form>
        </section>
      )}

      {/* TAB 2: History */}
      {activeTab === "history" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recorded Lectures ({selectedCourse.code})</h2>
            <span className="tnum text-xs text-muted">{logs.length} sessions logged</span>
          </div>

          <div className="space-y-2.5">
            {logs.map((log) => {
              const rate = Math.round((log.presentCount / log.totalCount) * 1000) / 10;
              const isPending = pendingLogs.some((p) => p.id === log.id || p.localId === log.id);

              return (
                <div
                  key={log.id}
                  className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-royal/30"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2">
                      <span className="tnum text-xs font-bold text-ink">{log.date}</span>
                      <span aria-hidden="true" className="text-muted">·</span>
                      <span className="text-xs text-muted">{log.period}</span>
                    </div>
                    <span className="tnum text-sm font-bold text-ink">
                      {log.presentCount} / {log.totalCount} ({rate}%)
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">{log.topic}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted">
                    <span>Course: {log.courseCode} ({log.section})</span>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3 animate-pulse" />
                        Queued for Sync
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Synced to Google API
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: Defaulter Radar */}
      {activeTab === "defaulters" && (
        <section className="space-y-4">
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-danger shrink-0" />
              <div>
                <p className="text-sm font-semibold text-danger">VTU 75% Attendance Compliance Warning</p>
                <p className="mt-0.5 text-xs text-muted">
                  Students below 75% require immediate academic counseling. Parents receive automatic notification upon trigger.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border bg-surface">
            {defaulters.length === 0 ? (
              <p className="p-5 text-center text-xs text-muted">No students currently below the 75% attendance threshold.</p>
            ) : (
              defaulters.map((d) => {
                const pct = Math.round((d.cumulativeAttended / d.cumulativeConducted) * 1000) / 10;
                const needed = Math.ceil((0.75 * d.cumulativeConducted - d.cumulativeAttended) / 0.25);
                const isSent = sentAlertUsn[d.usn];

                return (
                  <div key={d.usn} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="tnum text-xs font-bold text-ink">{d.usn}</span>
                        <span className="text-sm font-semibold text-ink">{d.name}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <span>Attended {d.cumulativeAttended} of {d.cumulativeConducted}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tnum font-bold text-danger">{pct}%</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-muted">Need {needed} consecutive classes to reach 75%</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendWarning(d.usn)}
                      disabled={isSent}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                        isSent
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-surface-2 border border-border text-ink hover:border-royal hover:text-royal"
                      )}
                    >
                      {isSent ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Notice Sent
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Issue Counseling Notice
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* TAB 4: Offline Sync Queue & Diagnostics */}
      {activeTab === "sync_queue" && (
        <section className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Periodic Background Sync Diagnostics</h2>
                <p className="text-xs text-muted">
                  Pending lecture logs queued offline automatically sync every {15} seconds when the device is connected.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSimulatedOffline}
                  className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface transition-colors"
                >
                  {syncStatus.isSimulatedOffline ? "Restore Online" : "Simulate Offline"}
                </button>
                <button
                  type="button"
                  onClick={syncNow}
                  disabled={syncStatus.isSyncing}
                  className="rounded-md bg-royal px-3.5 py-1.5 text-xs font-semibold text-white shadow-subtle hover:bg-royal/90 transition-colors"
                >
                  {syncStatus.isSyncing ? "Syncing…" : "Force Sync Now"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-md border border-border bg-surface-2/60 p-3 text-xs">
                <span className="text-muted">Network Status</span>
                <p className={cn("mt-1 text-sm font-bold", syncStatus.isOnline ? "text-success" : "text-danger")}>
                  {syncStatus.isOnline ? "Online" : "Offline"}
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-2/60 p-3 text-xs">
                <span className="text-muted">Google API Health</span>
                <p className={cn("mt-1 text-sm font-bold", syncStatus.googleApiStatus === "online" ? "text-success" : "text-amber-500")}>
                  {syncStatus.googleApiStatus === "online" ? "Connected" : syncStatus.googleApiStatus}
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-2/60 p-3 text-xs">
                <span className="text-muted">Pending In Queue</span>
                <p className="mt-1 text-sm font-bold text-ink">{pendingLogs.length}</p>
              </div>
              <div className="rounded-md border border-border bg-surface-2/60 p-3 text-xs">
                <span className="text-muted">Next Periodic Run</span>
                <p className="mt-1 text-sm font-bold text-royal">{syncStatus.nextSyncCountdown}s</p>
              </div>
            </div>
          </div>

          {/* Pending items list */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-ink">Pending Offline Logs ({pendingLogs.length})</h3>
              {pendingLogs.length > 0 && (
                <button
                  type="button"
                  onClick={clearPendingQueue}
                  className="text-xs font-medium text-danger hover:underline"
                >
                  Clear Queue
                </button>
              )}
            </div>

            <div className="mt-3 divide-y divide-border">
              {pendingLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
                  <p>All lecture logs are synchronized with the Google Attendance API!</p>
                  <p className="mt-1 text-[11px] text-muted/70">
                    Switch to &quot;Daily Roll Call&quot; to take attendance, or click &quot;Simulate Offline&quot; to test offline classroom queueing.
                  </p>
                </div>
              ) : (
                pendingLogs.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">{item.courseCode}</span>
                        <span className="text-xs text-muted">Section {item.section}</span>
                        <span className="rounded bg-royal/10 px-1.5 py-0.5 text-[11px] font-medium text-royal">
                          {item.period}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-ink">{item.topic}</p>
                      <div className="mt-1 text-[11px] text-muted">
                        <span>Date: {item.date}</span>
                        <span className="mx-1.5">·</span>
                        <span>{item.presentCount}/{item.totalCount} Present</span>
                        <span className="mx-1.5">·</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          Status: {item.status} (attempted {item.retryCount}x)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => retryLog(item.id)}
                        className="rounded-md border border-royal/30 bg-royal/10 px-2.5 py-1 text-xs font-medium text-royal hover:bg-royal/20 transition-colors"
                      >
                        Sync
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePendingLog(item.id)}
                        className="rounded-md border border-danger/30 bg-danger/10 p-1 text-danger hover:bg-danger/20 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recently Synced items list */}
          {syncedLogs.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="text-sm font-bold text-ink border-b border-border pb-3">
                Recently Synchronized Logs ({syncedLogs.length})
              </h3>
              <div className="mt-3 divide-y divide-border">
                {syncedLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{log.courseCode}</span>
                        <span className="text-muted">Section {log.section}</span>
                        <span className="text-muted">· {log.date}</span>
                      </div>
                      <p className="mt-0.5 text-muted">{log.topic}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed
                      </span>
                      <p className="text-[10px] text-muted">{log.receiptId}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
