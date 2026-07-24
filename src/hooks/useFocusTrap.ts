import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Traps Tab/Shift+Tab within `containerRef` while `isOpen`, focuses the first
 *  focusable element on open, and returns focus to whatever was focused before
 *  opening once it closes. Shared by Modal and Drawer so both dialog-like
 *  surfaces behave the same way for keyboard users. */
export function useFocusTrap(isOpen: boolean, containerRef: RefObject<HTMLElement | null>) {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const container = containerRef.current
    const raf = requestAnimationFrame(() => {
      const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ;(focusable?.[0] ?? container)?.focus()
    })

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !container) return
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [isOpen, containerRef])
}
