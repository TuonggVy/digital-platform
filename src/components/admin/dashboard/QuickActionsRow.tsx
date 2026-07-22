import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface QuickAction {
  key: string
  label: string
  href: string
  icon: ReactNode
}

interface QuickActionsRowProps {
  title: string
  actions: QuickAction[]
}

/** A handful of high-value links to existing Admin routes — not a sidebar duplicate. */
export function QuickActionsRow({ title, actions }: QuickActionsRowProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h2 className="font-display text-base font-semibold text-text-primary">{title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.key}
            to={action.href}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-ring"
          >
            {action.icon}
            <span className="truncate">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
