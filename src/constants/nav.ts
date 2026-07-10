import { ROUTES } from './routes'

export interface MegaMenuItem {
  labelKey: string
  slug: string
}

export interface MegaMenuGroup {
  titleKey: string
  categoryPath: string
  items: MegaMenuItem[]
}

export const MEGA_MENU_GROUPS: MegaMenuGroup[] = [
  {
    titleKey: 'nav.megamenu.cloud',
    categoryPath: ROUTES.PRODUCTS_CLOUD,
    items: [
      { labelKey: 'products.cloud.server', slug: 'cloud-server' },
      { labelKey: 'products.cloud.kubernetes', slug: 'managed-kubernetes' },
      { labelKey: 'products.cloud.storage', slug: 'cloud-storage' },
      { labelKey: 'products.cloud.backup', slug: 'cloud-backup' },
      { labelKey: 'products.cloud.loadbalancer', slug: 'load-balancer' },
    ],
  },
  {
    titleKey: 'nav.megamenu.kaspersky',
    categoryPath: ROUTES.PRODUCTS_KASPERSKY,
    items: [
      { labelKey: 'products.kaspersky.standard', slug: 'kaspersky-standard' },
      { labelKey: 'products.kaspersky.plus', slug: 'kaspersky-plus' },
      { labelKey: 'products.kaspersky.premium', slug: 'kaspersky-premium' },
      { labelKey: 'products.kaspersky.soho', slug: 'kaspersky-small-office-security' },
    ],
  },
  {
    titleKey: 'nav.megamenu.esim',
    categoryPath: ROUTES.PRODUCTS_ESIM,
    items: [
      { labelKey: 'products.esim.asia', slug: 'esim-asia-regional' },
      { labelKey: 'products.esim.europe', slug: 'esim-europe' },
      { labelKey: 'products.esim.namerica', slug: 'esim-usa-unlimited' },
      { labelKey: 'products.esim.global', slug: 'esim-global' },
    ],
  },
]
