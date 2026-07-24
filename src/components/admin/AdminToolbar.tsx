import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface AdminToolbarProps {
  /** Search input / filter selects / sort select — laid out in a wrapping row. */
  children: ReactNode
  /** Already-formatted "N kết quả" / "N of M" string — the page owns the i18n interpolation. */
  resultText: string
  hasActiveFilters: boolean
  onClearFilters: () => void
  clearLabel: string
}

/** Shared filter-row shell for Admin list pages: wraps the search/filter/sort controls,
 *  and renders a "clear filters" action + result count beneath them once a filter is active. */
export function AdminToolbar({
  children,
  resultText,
  hasActiveFilters,
  onClearFilters,
  clearLabel,
}: AdminToolbarProps) {
  return (
    <div className="mb-5 flex flex-col gap-2.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary focus-ring"
          >
            <X className="size-3.5" />
            {clearLabel}
          </button>
        )}
      </div>
      <p className="text-xs text-text-secondary">{resultText}</p>
    </div>
  )
}
