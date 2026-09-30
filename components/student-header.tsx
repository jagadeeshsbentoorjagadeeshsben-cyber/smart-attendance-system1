"use client";

import type { StudentInfo } from "@/lib/types";
import { ProfileAvatar } from "./profile-avatar";

export function StudentHeader({ student }: { student: StudentInfo }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-6">
      <div className="flex items-center gap-4">
        <ProfileAvatar name={student.name} size="lg" />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {student.name}
          </h1>
          <p className="text-xs text-muted font-medium mt-0.5">
            USN: <span className="font-mono text-ink font-semibold">{student.usn}</span> · Section:{" "}
            <span className="font-semibold text-royal">{student.section}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
