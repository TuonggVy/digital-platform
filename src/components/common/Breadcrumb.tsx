import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1.5 text-sm text-text-secondary"
    >
      <Link to={ROUTES.HOME} className="flex items-center hover:text-primary focus-ring rounded">
        <Home className="size-3.5" />
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5" />
          {item.href ? (
            <Link to={item.href} className="hover:text-primary focus-ring rounded">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
