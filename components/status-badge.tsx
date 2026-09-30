import type { AttendanceStatus } from "@/lib/types";
import { STATUS_THEME } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className = "",
}: {
  status: AttendanceStatus;
  className?: string;
}) {
  const theme = STATUS_THEME[status] || STATUS_THEME.NOT_STARTED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
        theme.badgeClass,
        className
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: theme.ringColor }}
      />
      {theme.label}
    </span>
  );
}
