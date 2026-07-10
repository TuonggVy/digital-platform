import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Package, Server, LifeBuoy, UserCircle, ShieldCheck } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

const LINKS = [
  { to: ROUTES.ACCOUNT, key: 'account.sidebar.dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.ACCOUNT_ORDERS, key: 'account.sidebar.orders', icon: Package },
  { to: ROUTES.ACCOUNT_SERVICES, key: 'account.sidebar.services', icon: Server },
  { to: ROUTES.ACCOUNT_TICKETS, key: 'account.sidebar.tickets', icon: LifeBuoy },
  { to: ROUTES.ACCOUNT_PROFILE, key: 'account.sidebar.profile', icon: UserCircle },
  { to: ROUTES.ACCOUNT_SECURITY, key: 'account.sidebar.security', icon: ShieldCheck },
]

export function CustomerSidebar({
  orientation = 'vertical',
}: {
  orientation?: 'vertical' | 'horizontal'
}) {
  const { t } = useTranslation()
  return (
    <nav
      className={cn(
        'flex gap-1',
        orientation === 'vertical' ? 'flex-col' : 'flex-row overflow-x-auto',
      )}
    >
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface hover:text-text-primary',
            )
          }
        >
          <link.icon className="size-4 shrink-0" />
          {t(link.key)}
        </NavLink>
      ))}
    </nav>
  )
}
