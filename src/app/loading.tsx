import { ProductCardSkeleton } from '@/components/common/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Sidebar Skeleton */}
        <div className="shrink-0 sm:w-64 space-y-6">
          <div className="h-10 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800 sm:hidden" />
          <div className="hidden sm:block space-y-6 rounded-2xl border border-neutral-150 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
            <div className="h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2.5">
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            </div>
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-4" />
            <div className="h-6 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex gap-2">
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-8 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            </div>
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-4" />
            <div className="h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-12 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="flex-1 space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-32 rounded bg-neutral-150 dark:bg-neutral-800" />
            </div>
            <div className="h-8 w-36 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
