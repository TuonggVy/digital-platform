import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-5">
      <Skeleton className="size-12 rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-8 w-1/2" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  )
}
