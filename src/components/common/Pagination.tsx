import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

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
      {pages.map((page) => (
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
      ))}
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
