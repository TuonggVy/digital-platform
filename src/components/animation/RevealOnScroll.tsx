import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface RevealOnScrollProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none' | 'scale'
  className?: string
  once?: boolean
}

const offsets = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
  scale: { scale: 0.92 },
}

export function RevealOnScroll({
  children,
  delay = 0,
  direction = 'up',
  className,
  once = true,
}: RevealOnScrollProps) {
  const prefersReducedMotion = useReducedMotion()

  // Even with reduced-motion preferred, keep a gentle opacity-only fade (no
  // translate/scale) so content still feels like it's "appearing" on scroll,
  // instead of disabling the effect entirely.
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...(prefersReducedMotion ? {} : offsets[direction]) }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration: prefersReducedMotion ? 0.4 : 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
