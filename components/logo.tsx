import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#002147] text-white shadow-sm dark:bg-royal">
        <GraduationCap className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-sm tracking-tight text-ink leading-none">
          GMIT Attend
        </span>
        <span className="text-[10px] uppercase font-semibold tracking-wider text-muted mt-0.5 leading-none">
          Smart Portal
        </span>
      </div>
    </Link>
  );
}
