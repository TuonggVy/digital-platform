import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageEntry = number | 'ellipsis'

/** First page, last page, current page ± 1 neighbor, with an ellipsis for any gap —
 *  avoids rendering one button per page for large result sets. */
function buildPageList(current: number, total: number): PageEntry[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: PageEntry[] = [1]
  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let page = start; page <= end; page++) pages.push(page)

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = buildPageList(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex size-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 focus-ring"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="flex size-9 items-center justify-center text-text-secondary">
            &hellip;
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={cn(
              'flex size-9 items-center justify-center rounded-lg text-sm font-medium focus-ring',
              currentPage === page ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex size-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 focus-ring"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
