import { useTranslation } from 'react-i18next'
import type { Product, ProductPackage } from '@/types'
import { useLocale } from '@/hooks/useLocale'
import { localize } from '@/utils/localize'

interface SpecItem {
  label: string
  value: string
}

function buildSpecs(product: Product, pkg: ProductPackage | undefined, t: (key: string) => string, locale: 'vi' | 'en'): SpecItem[] {
  if (!pkg) return []

  if (product.category === 'cloud' && pkg.cloud) {
    const { cpu, ram, ssd } = pkg.cloud
    return [
      cpu !== '-' && { label: t('productDetail.cpu'), value: cpu },
      ram !== '-' && { label: t('productDetail.ram'), value: ram },
      ssd !== '-' && { label: t('productDetail.ssd'), value: ssd },
    ].filter(Boolean) as SpecItem[]
  }

  if (product.category === 'kaspersky' && pkg.kaspersky) {
    const { devices, duration, userType } = pkg.kaspersky
    return [
      { label: t('productDetail.devices'), value: String(devices) },
      { label: t('productDetail.duration'), value: duration },
      { label: t('productDetail.userType'), value: t(`kasperskyPage.${userType}`) },
    ]
  }

  if (product.category === 'esim' && pkg.esim) {
    const { country, dataAmount, days } = pkg.esim
    return [
      { label: t('productDetail.country'), value: localize(country, locale) },
      { label: t('productDetail.dataAmount'), value: dataAmount },
      { label: t('productDetail.days'), value: String(days) },
    ]
  }

  return []
}

export function ProductSpecList({
  product,
  pkg,
  className,
}: {
  product: Product
  pkg: ProductPackage | undefined
  className?: string
}) {
  const { t } = useTranslation()
  const locale = useLocale()
  const specs = buildSpecs(product, pkg, t, locale)

  if (specs.length === 0) return null

  return (
    <dl className={className}>
      <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-3">
        {specs.map((spec) => (
          <div key={spec.label} className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-text-secondary">{spec.label}</dt>
            <dd className="truncate text-sm font-medium text-text-primary" title={spec.value}>
              {spec.value}
            </dd>
          </div>
        ))}
      </div>
    </dl>
  )
}
