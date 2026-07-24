import type { ReactNode } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { cn } from '@/utils/cn'

interface AdminMobileListProps<T> {
  data: T[]
  rowKey: (row: T) => string
  renderCard: (row: T) => ReactNode
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

/** Card-list counterpart to DataTable for small screens — same loading/empty contract,
 *  but each page controls its own card content via `renderCard` since the fields worth
 *  showing on a narrow card differ per data type. */
export function AdminMobileList<T>({
  data,
  rowKey,
  renderCard,
  isLoading,
  emptyTitle = 'No data',
  emptyDescription,
  className,
}: AdminMobileListProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border p-4">
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {data.map((row) => (
        <div key={rowKey(row)} className="rounded-2xl border border-border p-4">
          {renderCard(row)}
        </div>
      ))}
    </div>
  )
}
