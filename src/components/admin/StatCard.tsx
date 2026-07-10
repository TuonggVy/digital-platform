import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: string
  className?: string
}

export function StatCard({ icon, label, value, hint, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-background p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
    </div>
  )
}
