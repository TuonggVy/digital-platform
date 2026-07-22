import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** 'dark' renders the trail for a dark/navy surface (e.g. a category header). */
  tone?: 'light' | 'dark'
}

export function Breadcrumb({ items, tone = 'light' }: BreadcrumbProps) {
  const isDark = tone === 'dark'

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center flex-wrap gap-1.5 text-sm',
        isDark ? 'text-white/50' : 'text-text-secondary',
      )}
    >
      <Link
        to={ROUTES.HOME}
        className={cn(
          'flex items-center focus-ring rounded',
          isDark ? 'hover:text-white' : 'hover:text-primary',
        )}
      >
        <Home className="size-3.5" />
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5" />
          {item.href ? (
            <Link
              to={item.href}
              className={cn('focus-ring rounded', isDark ? 'hover:text-white' : 'hover:text-primary')}
            >
              {item.label}
            </Link>
          ) : (
            <span className={isDark ? 'text-white/80' : 'text-text-primary'} aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
