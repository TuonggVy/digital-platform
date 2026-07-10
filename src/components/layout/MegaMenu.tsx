import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Cloud, ShieldCheck, Wifi } from 'lucide-react'
import { MEGA_MENU_GROUPS } from '@/constants/nav'
import { ROUTES } from '@/constants/routes'

const groupIcons = [Cloud, ShieldCheck, Wifi]

export function MegaMenu() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="absolute left-0 top-full z-40 mt-2 w-[min(900px,92vw)] rounded-2xl border border-border bg-background p-6 shadow-2xl"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {MEGA_MENU_GROUPS.map((group, idx) => {
          const Icon = groupIcons[idx]
          return (
            <div key={group.titleKey} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                {t(group.titleKey)}
              </div>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={ROUTES.PRODUCT_DETAIL(item.slug)}
                      className="block rounded-lg px-2.5 py-1.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={group.categoryPath}
                className="mt-1 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {idx === 0 && t('nav.megamenu.viewAllCloud')}
                {idx === 1 && t('nav.megamenu.viewAllKaspersky')}
                {idx === 2 && t('nav.megamenu.viewAllEsim')}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
