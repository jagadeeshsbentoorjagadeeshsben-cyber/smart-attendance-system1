import { BookOpen, type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = BookOpen,
  title = "No records found",
  description = "No attendance information is currently registered.",
}: {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-muted max-w-xs">{description}</p>
    </div>
  );
}
