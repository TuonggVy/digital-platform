import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { SidebarTooltip } from './SidebarTooltip'
import type { SidebarBadgeVariant, SidebarItem } from './adminSidebar.config'

const badgePillClasses: Record<SidebarBadgeVariant, string> = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-amber-500/15 text-amber-600',
  danger: 'bg-red-500/15 text-red-600',
}

const badgeDotClasses: Record<SidebarBadgeVariant, string> = {
  default: 'bg-primary',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

interface AdminSidebarItemProps {
  item: SidebarItem
  collapsed: boolean
  onNavigate?: () => void
}

export function AdminSidebarItem({ item, collapsed, onNavigate }: AdminSidebarItemProps) {
  const { t } = useTranslation()
  const itemRef = useRef<HTMLLIElement>(null)
  const Icon = item.icon
  const label = t(item.key)
  const variant = item.badgeVariant ?? 'default'

  return (
    <li ref={itemRef} className="group relative">
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'relative flex h-11 items-center rounded-xl px-3 text-sm font-medium transition-all duration-200 focus-ring',
            collapsed ? 'justify-center' : 'gap-3',
            isActive
              ? 'bg-primary/10 text-primary shadow-sm'
              : 'text-text-secondary hover:bg-surface hover:text-text-primary',
          )
        }
      >
        {({ isActive }) => (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200 ease-out',
                isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
              )}
            />
            <span className="relative flex shrink-0 items-center justify-center">
              <Icon
                aria-hidden="true"
                className="size-[18px] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              />
              {item.badge && collapsed ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -right-1 -top-1 size-2 rounded-full ring-2 ring-background',
                    badgeDotClasses[variant],
                  )}
                />
              ) : null}
            </span>

            {/* Label stays in the DOM (as sr-only) when collapsed so the link always has an
                accessible name — the tooltip is a visual aid, not the only way to identify it. */}
            <span className={cn('min-w-0 flex-1 truncate transition-opacity duration-200', collapsed && 'sr-only')}>
              {label}
            </span>

            {!collapsed && item.badge ? (
              <span
                className={cn(
                  'ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                  badgePillClasses[variant],
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </>
        )}
      </NavLink>

      <SidebarTooltip anchorRef={itemRef} label={label} enabled={collapsed} />
    </li>
  )
}
