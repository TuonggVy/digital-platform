import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { useLocale } from '@/hooks/useLocale'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { localize } from '@/utils/localize'
import { formatCurrency } from '@/utils/formatters'
import { Button } from '@/components/common/Button'
import { cn } from '@/utils/cn'

const cycleLabelKey: Record<string, string> = {
  monthly: 'common.perMonth',
  yearly: 'common.perYear',
  one_time: 'common.oneTime',
}

export function PackageSelector({ product }: { product: Product }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const addItem = useCartStore((s) => s.addItem)
  const showToast = useUiStore((s) => s.showToast)

  const [selectedPackageId, setSelectedPackageId] = useState(
    () => (product.packages.find((p) => p.isPopular) ?? product.packages[0])?.id,
  )
  const [quantity, setQuantity] = useState(1)

  const selectedPackage = useMemo(
    () => product.packages.find((p) => p.id === selectedPackageId) ?? product.packages[0],
    [product.packages, selectedPackageId],
  )

  const totalPrice = (selectedPackage?.price ?? 0) * quantity

  function buildOptionsSummary(): string[] {
    if (!selectedPackage) return []
    if (selectedPackage.cloud) {
      const { regions, cpu, ram, ssd } = selectedPackage.cloud
      return [regions.join('/'), cpu, ram, ssd].filter((v) => v && v !== '-')
    }
    if (selectedPackage.kaspersky) {
      const { devices, duration } = selectedPackage.kaspersky
      return [`${devices} ${t('productDetail.devices').toLowerCase()}`, duration]
    }
    if (selectedPackage.esim) {
      const { dataAmount, days } = selectedPackage.esim
      return [dataAmount, `${days} ${t('productDetail.days').toLowerCase()}`]
    }
    return []
  }

  function handleAddToCart() {
    if (!selectedPackage) return
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: localize(product.name, locale),
      category: product.category,
      packageId: selectedPackage.id,
      packageName: localize(selectedPackage.name, locale),
      billingCycle: selectedPackage.billingCycle,
      unitPrice: selectedPackage.price,
      quantity,
      optionsSummary: buildOptionsSummary(),
    })
    showToast(t('productDetail.addedToCart'), 'success')
  }

  if (!selectedPackage) return null

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <h3 className="text-base font-semibold text-text-primary">
        {t('productDetail.selectPackage')}
      </h3>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {product.packages.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setSelectedPackageId(pkg.id)}
            className={cn(
              'relative rounded-xl border p-4 text-left transition-colors',
              selectedPackageId === pkg.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-surface',
            )}
          >
            {pkg.isPopular && (
              <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                {t('pricingPage.mostPopular')}
              </span>
            )}
            <p className="text-sm font-semibold text-text-primary">{localize(pkg.name, locale)}</p>
            <p className="mt-1 text-lg font-bold text-text-primary">
              {formatCurrency(pkg.price, locale)}
              <span className="text-xs font-normal text-text-secondary">
                {t(cycleLabelKey[pkg.billingCycle])}
              </span>
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl bg-background p-4 sm:grid-cols-2">
        {selectedPackage.cloud && (
          <>
            <SpecRow
              label={t('productDetail.region')}
              value={selectedPackage.cloud.regions.join(', ')}
            />
            {selectedPackage.cloud.cpu !== '-' && (
              <SpecRow label={t('productDetail.cpu')} value={selectedPackage.cloud.cpu} />
            )}
            {selectedPackage.cloud.ram !== '-' && (
              <SpecRow label={t('productDetail.ram')} value={selectedPackage.cloud.ram} />
            )}
            {selectedPackage.cloud.ssd !== '-' && (
              <SpecRow label={t('productDetail.ssd')} value={selectedPackage.cloud.ssd} />
            )}
            {selectedPackage.cloud.os.length > 0 && (
              <SpecRow label={t('productDetail.os')} value={selectedPackage.cloud.os.join(', ')} />
            )}
            <SpecRow
              label={t('productDetail.billingCycle')}
              value={t(cycleLabelKey[selectedPackage.billingCycle])}
            />
          </>
        )}
        {selectedPackage.kaspersky && (
          <>
            <SpecRow
              label={t('productDetail.devices')}
              value={String(selectedPackage.kaspersky.devices)}
            />
            <SpecRow
              label={t('productDetail.duration')}
              value={selectedPackage.kaspersky.duration}
            />
            <SpecRow
              label={t('productDetail.userType')}
              value={t(`kasperskyPage.${selectedPackage.kaspersky.userType}`)}
            />
            <SpecRow
              label={t('productDetail.supportedOs')}
              value={selectedPackage.kaspersky.supportedOS.join(', ')}
            />
          </>
        )}
        {selectedPackage.esim && (
          <>
            <SpecRow
              label={t('productDetail.country')}
              value={localize(selectedPackage.esim.country, locale)}
            />
            <SpecRow
              label={t('productDetail.dataAmount')}
              value={selectedPackage.esim.dataAmount}
            />
            <SpecRow label={t('productDetail.days')} value={String(selectedPackage.esim.days)} />
            <SpecRow
              label={t('productDetail.hotspot')}
              value={selectedPackage.esim.hotspot ? t('common.yes') : t('common.no')}
            />
            <SpecRow
              label={t('productDetail.networkType')}
              value={selectedPackage.esim.networkType}
            />
            <SpecRow
              label={t('productDetail.activationTime')}
              value={t('productDetail.activationOnArrival')}
            />
          </>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">{t('common.quantity')}</span>
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 text-text-secondary hover:text-text-primary"
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-text-primary">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 text-text-secondary hover:text-text-primary"
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-text-secondary">{t('productDetail.totalPrice')}</p>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(totalPrice, locale)}
            </p>
          </div>
          <Button
            size="lg"
            leftIcon={<ShoppingCart className="size-4" />}
            onClick={handleAddToCart}
          >
            {t('common.addToCart')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5 text-sm last:border-b-0">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  )
}
