import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function ParallaxSection({ children, className, strength = 60 }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength])

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={cn(className)}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
