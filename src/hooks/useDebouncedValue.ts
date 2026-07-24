import { useEffect, useState } from 'react'

/** Returns `value`, delayed by `delayMs` after it stops changing. Extracted from the
 *  identical inline pattern previously duplicated in AdminOrdersPage/AdminCustomersPage. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(handle)
  }, [value, delayMs])

  return debounced
}
