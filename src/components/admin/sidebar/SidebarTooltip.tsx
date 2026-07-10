import { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface SidebarTooltipProps {
  /** Element the tooltip is anchored to — the tooltip attaches its own hover/focus listeners to it. */
  anchorRef: RefObject<HTMLElement | null>
  label: string
  /** Only collapsed sidebars need tooltips (labels are already visible when expanded). */
  enabled: boolean
}

/**
 * Renders via a portal to `document.body` and positions itself with `position: fixed` from a
 * measured bounding rect, so it can never be clipped by the sidebar's own `overflow-y-auto` nav
 * container. Shows on hover AND focus so keyboard users get the same affordance as mouse users.
 */
export function SidebarTooltip({ anchorRef, label, enabled }: SidebarTooltipProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const el = anchorRef.current
    if (!el || !enabled) return

    function open() {
      const rect = el!.getBoundingClientRect()
      setPosition({ top: rect.top + rect.height / 2, left: rect.right + 12 })
      setShow(true)
    }
    function close() {
      setShow(false)
    }

    el.addEventListener('mouseenter', open)
    el.addEventListener('mouseleave', close)
    el.addEventListener('focusin', open)
    el.addEventListener('focusout', close)
    return () => {
      el.removeEventListener('mouseenter', open)
      el.removeEventListener('mouseleave', close)
      el.removeEventListener('focusin', open)
      el.removeEventListener('focusout', close)
    }
  }, [anchorRef, enabled])

  useEffect(() => {
    if (!enabled) setShow(false)
  }, [enabled])

  if (!enabled) return null

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.span
          role="tooltip"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ position: 'fixed', top: position.top, left: position.left, transform: 'translateY(-50%)' }}
          className="pointer-events-none z-[60] whitespace-nowrap rounded-lg bg-[#111827] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>,
    document.body,
  )
}
