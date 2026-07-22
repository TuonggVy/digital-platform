import { Skeleton } from '@/components/common/Skeleton'

/** Reserves the exact footprint of the metrics row so it can swap in for real
 *  MetricCards without any layout shift once each fetch resolves. */
export function MetricsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-xl" />
          </div>
          <Skeleton className="mt-4 h-7 w-16" />
        </div>
      ))}
    </div>
  )
}

/** Placeholder shaped like the service overview panel's column layout, while the
 *  shared services/inventory fetch is still in flight. */
export function ServiceOverviewSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <Skeleton className="h-5 w-40" />
      <div
        className="mt-4 grid grid-cols-1 gap-6"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Placeholder shaped like the attention panel's row layout, while the shared
 *  services/inventory fetch is still in flight. */
export function AttentionPanelSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <Skeleton className="h-5 w-32" />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
