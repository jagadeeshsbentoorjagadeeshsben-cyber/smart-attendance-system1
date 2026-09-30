"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Bell,
  Search,
  CheckCircle2,
  Calendar,
  Send,
  Filter,
} from "lucide-react";
import {
  DEPARTMENT_SECTIONS,
  FACULTY_AUDIT,
  DEPARTMENT_DEFAULTERS,
  DEPARTMENT_CIRCULARS,
  type SectionSummary,
  type FacultyAuditItem,
  type DefaulterStudent,
  type DepartmentCircular,
} from "@/lib/department-data";
import { cn } from "@/lib/utils";

export default function HodPage() {
  const [activeTab, setActiveTab] = useState<"sections" | "faculty" | "detention" | "circulars">("sections");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Circular broadcast state
  const [circulars, setCirculars] = useState<DepartmentCircular[]>(DEPARTMENT_CIRCULARS);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "ROUTINE">("ROUTINE");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const filteredSections = DEPARTMENT_SECTIONS.filter((sec) => {
    if (semesterFilter === "ALL") return true;
    return sec.semester.toLowerCase().includes(semesterFilter.toLowerCase());
  });

  const filteredDefaulters = DEPARTMENT_DEFAULTERS.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePublishCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const circular: DepartmentCircular = {
      id: `circ-${Date.now()}`,
      refNo: `GMIT/CSE/CIR/${new Date().getFullYear()}/${circulars.length + 10}`,
      date: new Date().toISOString().split("T")[0],
      title: newTitle.trim(),
      issuedBy: "Dr. Shanthala C. P. (HOD - CSE)",
      priority,
      content: newContent.trim(),
    };

    setCirculars([circular, ...circulars]);
    setNewTitle("");
    setNewContent("");
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  const handleDownloadCSV = () => {
    const headers = "USN,Name,Section,Subject Code,Subject Name,Attended,Conducted,Percentage,Shortage Classes\n";
    const rows = DEPARTMENT_DEFAULTERS.map(
      (d) =>
        `"${d.usn}","${d.name}","${d.section}","${d.subjectCode}","${d.subjectName}",${d.attended},${d.conducted},${d.percentage},${d.shortageClasses}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GMIT_CSE_Attendance_Shortage_List_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Header */}
      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-royal" />
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                Head of Department (HOD) Desk
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted">
              Academic & Attendance Governance · Department of Computer Science & Engineering
            </p>
          </div>
          <div className="text-xs text-muted sm:text-right">
            <p className="font-semibold text-ink">Dr. Shanthala C. P., Ph.D.</p>
            <p className="text-[11px] text-muted">Professor & Head of Department</p>
          </div>
        </div>
      </header>

      {/* Department KPI Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Dept Attendance</p>
          <p className="tnum mt-1 text-2xl font-bold text-ink">86.8%</p>
          <p className="mt-0.5 text-[11px] text-success">Across 6 sections</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Total Students</p>
          <p className="tnum mt-1 text-2xl font-bold text-ink">362</p>
          <p className="mt-0.5 text-[11px] text-muted">3rd, 5th, 7th Semesters</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Faculty Conduction</p>
          <p className="tnum mt-1 text-2xl font-bold text-ink">96.4%</p>
          <p className="mt-0.5 text-[11px] text-success">Syllabus on track</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Defaulters (&lt;75%)</p>
          <p className="tnum mt-1 text-2xl font-bold text-danger">26</p>
          <p className="mt-0.5 text-[11px] text-danger">Shortage compliance</p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("sections")}
          className={cn(
            "border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "sections"
              ? "border-royal text-royal font-semibold"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          Section Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("faculty")}
          className={cn(
            "border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "faculty"
              ? "border-royal text-royal font-semibold"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          Faculty Audit ({FACULTY_AUDIT.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("detention")}
          className={cn(
            "border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "detention"
              ? "border-royal text-royal font-semibold"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          VTU Detention List ({DEPARTMENT_DEFAULTERS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("circulars")}
          className={cn(
            "border-b-2 px-4 py-2.5 transition-colors",
            activeTab === "circulars"
              ? "border-royal text-royal font-semibold"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          Circulars & Directives ({circulars.length})
        </button>
      </div>

      {/* TAB 1: Section Performance Matrix */}
      {activeTab === "sections" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Section Attendance Breakdown</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted">Semester:</span>
              {(["ALL", "3rd", "5th", "7th"] as const).map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSemesterFilter(sem)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                    semesterFilter === sem
                      ? "bg-royal text-white"
                      : "bg-surface-2 text-muted hover:text-ink"
                  )}
                >
                  {sem === "ALL" ? "All" : `${sem} Sem`}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-2/60 text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">Section</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">Advisor / Mentor</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Students</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Classes Held</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Avg Attendance</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Defaulters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSections.map((sec) => (
                  <tr key={sec.section} className="transition-colors hover:bg-surface-2/40">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-ink text-sm">Section {sec.section}</div>
                      <div className="text-[11px] text-muted">{sec.semester}</div>
                    </td>
                    <td className="px-4 py-3.5 text-ink font-medium">{sec.advisor}</td>
                    <td className="tnum px-4 py-3.5 text-right font-medium text-ink">{sec.totalStudents}</td>
                    <td className="tnum px-4 py-3.5 text-right font-medium text-ink">{sec.classesConducted}</td>
                    <td className="tnum px-4 py-3.5 text-right font-bold">
                      <span className={sec.averageAttendance >= 85 ? "text-success" : sec.averageAttendance >= 75 ? "text-royal" : "text-danger"}>
                        {sec.averageAttendance}%
                      </span>
                    </td>
                    <td className="tnum px-4 py-3.5 text-right font-semibold">
                      <span className={sec.defaultersCount > 4 ? "text-danger" : "text-muted"}>
                        {sec.defaultersCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: Faculty Audit */}
      {activeTab === "faculty" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Faculty Syllabus & Conduction Tracking</h2>
            <span className="text-xs text-muted">Audited weekly against academic calendar</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-2/60 text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">Faculty Member</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">Subject & Section</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Scheduled</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Conducted</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Syllabus Progress</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Last Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {FACULTY_AUDIT.map((item, idx) => {
                  const variance = item.conductedClasses - item.scheduledClasses;
                  return (
                    <tr key={idx} className="transition-colors hover:bg-surface-2/40">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-ink">{item.facultyName}</div>
                        <div className="text-[11px] text-muted">{item.designation}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-ink">{item.courseName}</div>
                        <div className="tnum text-[11px] text-muted">{item.courseCode} · Sec {item.section}</div>
                      </td>
                      <td className="tnum px-4 py-3.5 text-right font-medium text-ink">{item.scheduledClasses}</td>
                      <td className="tnum px-4 py-3.5 text-right font-medium text-ink">
                        {item.conductedClasses}
                        {variance < 0 && (
                          <span className="tnum ml-1 text-danger">({variance})</span>
                        )}
                      </td>
                      <td className="tnum px-4 py-3.5 text-right font-bold text-ink">
                        <div className="flex items-center justify-end gap-2">
                          <span>{item.syllabusProgressPct}%</span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full bg-royal"
                              style={{ width: `${item.syllabusProgressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="tnum px-4 py-3.5 text-right text-muted">{item.lastConductedDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: VTU Detention List */}
      {activeTab === "detention" && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink">Official VTU Shortage & Detention Register</h2>
              <p className="mt-0.5 text-xs text-muted">
                Students with aggregate or course attendance below the mandatory 75% VTU threshold.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 rounded-md bg-royal px-3.5 py-2 text-xs font-semibold text-white shadow-subtle hover:bg-royal/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export VTU Condonation (CSV)
            </button>
          </div>

          {downloadSuccess && (
            <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3.5 py-2.5 text-xs font-medium text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>VTU Attendance Shortage CSV downloaded successfully.</span>
            </div>
          )}

          {/* Search filter */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, USN, or section..."
              className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-xs text-ink placeholder:text-muted focus:border-royal focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-2/60 text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">USN</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">Student Name</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">Section</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider">Shortage Course</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Attended / Total</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Percentage</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Shortfall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDefaulters.map((d) => (
                  <tr key={`${d.usn}-${d.subjectCode}`} className="transition-colors hover:bg-danger/[0.03]">
                    <td className="tnum px-4 py-3.5 font-bold text-ink">{d.usn}</td>
                    <td className="px-4 py-3.5 font-semibold text-ink">{d.name}</td>
                    <td className="px-4 py-3.5 text-muted">{d.section}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-ink">{d.subjectName}</div>
                      <div className="tnum text-[11px] text-muted">{d.subjectCode}</div>
                    </td>
                    <td className="tnum px-4 py-3.5 text-right text-muted">{d.attended} / {d.conducted}</td>
                    <td className="tnum px-4 py-3.5 text-right font-bold text-danger">{d.percentage}%</td>
                    <td className="tnum px-4 py-3.5 text-right font-semibold text-danger">
                      -{d.shortageClasses} classes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 4: Circulars & Directives */}
      {activeTab === "circulars" && (
        <section className="space-y-6">
          {/* Broadcast New Circular */}
          <form onSubmit={handlePublishCircular} className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">Broadcast Department Attendance Directive</h2>
            <p className="mt-0.5 text-xs text-muted">
              Published circulars are instantly broadcast to student and faculty portals.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Subject / Heading
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Condonation submission deadline for odd semester 2026"
                  className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-xs text-ink focus:border-royal focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "HIGH" | "ROUTINE")}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-xs text-ink focus:border-royal focus:outline-none"
                >
                  <option value="ROUTINE">Routine Directive</option>
                  <option value="HIGH">High Priority / Urgent</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                Circular Text
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                placeholder="Enter detailed instruction for students and faculty regarding attendance compliance..."
                className="mt-1 w-full rounded-md border border-border bg-surface p-3 text-xs text-ink focus:border-royal focus:outline-none"
                required
              />
            </div>

            {broadcastSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3.5 py-2 text-xs font-medium text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Circular published and dispatched to student and faculty portals.</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-royal px-4 py-2 text-xs font-semibold text-white shadow-subtle hover:bg-royal/90 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              Publish Circular
            </button>
          </form>

          {/* List of Published Circulars */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Published Circular Archive
            </h3>

            {circulars.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-royal/30"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-ink">{c.refNo}</span>
                    <span aria-hidden="true" className="text-muted">·</span>
                    <span className="tnum text-muted">{c.date}</span>
                  </div>
                  {c.priority === "HIGH" && (
                    <span className="text-[11px] font-bold text-danger">Urgent / Strict</span>
                  )}
                </div>
                <h4 className="mt-2 text-sm font-semibold text-ink">{c.title}</h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">{c.content}</p>
                <div className="mt-3 text-[11px] text-muted">
                  Issued by: <span className="font-medium text-ink">{c.issuedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
