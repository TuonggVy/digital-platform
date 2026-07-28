import { useEffect, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { ServiceSort } from '@/components/admin/services/ServiceFilterBar'
import type { CustomerService, ServiceStatus } from '@/types'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

/**
 * Search/status/sort/pagination over a service list already narrowed to the desired
 * type(s) by the caller. `resetKey` resets pagination to page 1 whenever it changes,
 * on top of the usual reset on search/status/sort change — used by the aggregate
 * services page to reset the page when the active tab switches.
 */
export function useServiceFilters<T extends CustomerService>(items: T[], resetKey?: unknown) {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const [status, setStatus] = useState<ServiceStatus | ''>('')
  const [sort, setSort] = useState<ServiceSort>('expiry_asc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search, status, sort, resetKey])

  const filtered = useMemo(() => {
    const rows = items.filter((s) => {
      if (status && s.status !== status) return false
      if (search) {
        const q = search.toLowerCase()
        const matches =
          s.orderCode.toLowerCase().includes(q) ||
          s.productName.toLowerCase().includes(q) ||
          s.packageName.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
    return [...rows].sort((a, b) => {
      const diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      return sort === 'expiry_asc' ? diff : -diff
    })
  }, [items, search, status, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = search !== '' || status !== ''
  function clearFilters() {
    setSearchInput('')
    setStatus('')
  }

  return {
    searchInput,
    setSearchInput,
    status,
    setStatus,
    sort,
    setSort,
    page,
    setPage,
    filtered,
    pageItems,
    totalPages,
    hasActiveFilters,
    clearFilters,
  }
}
