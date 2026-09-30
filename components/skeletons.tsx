export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 rounded-xl bg-surface-2" />
      <div className="h-44 rounded-xl bg-surface-2" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-32 rounded-xl bg-surface-2" />
        <div className="h-32 rounded-xl bg-surface-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 rounded-xl bg-surface-2" />
        <div className="h-40 rounded-xl bg-surface-2" />
        <div className="h-40 rounded-xl bg-surface-2" />
      </div>
    </div>
  );
}

export function SubjectSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-xl bg-surface-2" />
      <div className="h-48 rounded-xl bg-surface-2" />
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-20 rounded-xl bg-surface-2" />
      <div className="h-20 rounded-xl bg-surface-2" />
      <div className="h-20 rounded-xl bg-surface-2" />
      <div className="h-20 rounded-xl bg-surface-2" />
    </div>
  );
}
