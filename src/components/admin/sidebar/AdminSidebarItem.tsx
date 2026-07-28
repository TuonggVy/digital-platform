import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
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
  const shouldReduceMotion = useReducedMotion()
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
            'relative flex h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors focus-ring',
            collapsed ? 'justify-center' : 'gap-3',
            isActive
              ? 'text-admin-text'
              : 'text-admin-text-muted hover:bg-black/[0.03] hover:text-admin-text',
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                aria-hidden="true"
                layoutId="admin-active-navigation"
                className="absolute inset-0 rounded-xl bg-admin-surface shadow-admin-nav-active ring-1 ring-black/[0.035]"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 430, damping: 38, mass: 0.45 }
                }
              />
            )}

            <span className="relative z-10 flex shrink-0 items-center justify-center">
              <Icon
                aria-hidden="true"
                className={cn(
                  'size-[18px] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5',
                  isActive ? 'text-admin-primary' : 'opacity-70 group-hover:opacity-100',
                )}
              />
              {item.badge && collapsed ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -right-1 -top-1 size-2 rounded-full ring-2 ring-admin-app-bg',
                    badgeDotClasses[variant],
                  )}
                />
              ) : null}
            </span>

            {/* Label stays in the DOM (as sr-only) when collapsed so the link always has an
                accessible name — the tooltip is a visual aid, not the only way to identify it. */}
            <span
              className={cn(
                'relative z-10 min-w-0 flex-1 truncate transition-opacity duration-200',
                collapsed && 'sr-only',
              )}
            >
              {label}
            </span>

            {!collapsed && item.badge ? (
              <span
                className={cn(
                  'relative z-10 ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
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
