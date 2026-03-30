interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700/50 ${className}`}
    />
  );
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function SkeletonExpenseList({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-4 py-3 ${
            i > 0 ? "border-t border-gray-100 dark:border-gray-800" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonSpendingCard() {
  return (
    <div className="rounded-2xl p-6 bg-gray-200 dark:bg-gray-700/30 animate-pulse">
      <Skeleton className="h-3 w-28 mb-3 bg-gray-300 dark:bg-gray-600" />
      <Skeleton className="h-10 w-48 mb-2 bg-gray-300 dark:bg-gray-600" />
      <Skeleton className="h-3 w-24 bg-gray-300 dark:bg-gray-600" />
    </div>
  );
}

export function SkeletonBudgetProgress() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-[250px] w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonAccountCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-32" />
    </div>
  );
}

export function SkeletonSettingsRow() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-4 w-4" />
    </div>
  );
}

export function SkeletonInsightCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex gap-3">
        <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}
