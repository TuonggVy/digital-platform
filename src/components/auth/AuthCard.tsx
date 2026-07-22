import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface AuthCardProps {
  title: string
  subtitle: string
  formError?: string | null
  footer: ReactNode
  children: ReactNode
}

export function AuthCard({ title, subtitle, formError, footer, children }: AuthCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduced = prefersReducedMotion ?? false

  return (
    <motion.div
      className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8"
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-white/60">{subtitle}</p>
      </div>

      {formError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <div className="mt-6">{children}</div>

      <p className="mt-6 text-center text-sm text-white/60">{footer}</p>
    </motion.div>
  )
}
