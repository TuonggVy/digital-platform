import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'

export interface AttentionGroup {
  key: string
  label: string
  count: number
  href: string
  actionLabel: string
  items?: string[]
}

interface AttentionPanelProps {
  title: string
  groups: AttentionGroup[]
  emptyLabel: string
}

/** Combines real, already-supported attention conditions (low stock, expiring or
 *  suspended services) into one panel. Always renders — a calm, restrained empty
 *  state when nothing needs action, never a large warning block. */
export function AttentionPanel({ title, groups, emptyLabel }: AttentionPanelProps) {
  const active = groups.filter((group) => group.count > 0)

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h2 className="font-display text-base font-semibold text-text-primary">{title}</h2>

      {active.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
          <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
          {emptyLabel}
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {active.map((group) => (
            <li key={group.key} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0 text-amber-500" aria-hidden="true" />
                  <span className="text-sm text-text-primary">{group.label}</span>
                  <span className="font-data text-sm font-semibold text-text-primary">{group.count}</span>
                </div>
                {group.items && group.items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {group.items.map((item) => (
                      <Badge key={item} variant="warning">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to={group.href}
                className="text-sm font-medium text-primary hover:underline focus-ring sm:shrink-0"
              >
                {group.actionLabel}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
