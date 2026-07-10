import type { ReactNode } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { cn } from '@/utils/cn'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyTitle = 'No data',
  emptyDescription,
}: DataTableProps<T>) {
  if (isLoading) return <LoadingSpinner />
  if (data.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/60 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 font-semibold', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-border last:border-0 hover:bg-surface/40"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3 align-middle text-text-primary', col.className)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
