import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Tag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { useLocale } from '@/hooks/useLocale'
import { ROUTES } from '@/constants/routes'
import { Seo } from '@/components/common/Seo'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard'

export function CartPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)

  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal)
  const discount = useCartStore((s) => s.discount)
  const total = useCartStore((s) => s.total)
  const appliedCoupon = useCartStore((s) => s.appliedCoupon)
  const applyCoupon = useCartStore((s) => s.applyCoupon)

  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  // CartItemRow removes items directly against the store, so we detect the drop in
  // item count here to surface the "removed" toast without touching that component.
  const prevCountRef = useRef(items.length)
  useEffect(() => {
    if (items.length < prevCountRef.current) {
      showToast(t('toast.removedFromCart'))
    }
    prevCountRef.current = items.length
  }, [items.length, showToast, t])

  async function handleApplyCoupon() {
    const code = couponCode.trim()
    if (!code) return
    setIsApplying(true)
    setCouponError('')
    try {
      await applyCoupon(code)
      showToast(t('toast.couponApplied'), 'success')
      setCouponCode('')
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setCouponError(
        message === 'COUPON_NOT_APPLICABLE'
          ? t('cart.couponNotApplicable')
          : t('cart.couponInvalid'),
      )
    } finally {
      setIsApplying(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Seo title={t('cart.title')} />
        <EmptyState
          icon={<ShoppingCart className="size-6" />}
          title={t('cart.emptyTitle')}
          description={t('cart.emptyDesc')}
          action={
            <Button onClick={() => navigate(ROUTES.PRODUCTS)}>{t('cart.continueShopping')}</Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('cart.title')} />

      <RevealOnScroll>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">{t('cart.title')}</h1>
      </RevealOnScroll>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <RevealOnScroll className="lg:col-span-2" delay={0.05}>
          <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-6">
            {items.map((item) => (
              <CartItemRow key={item.cartItemId} item={item} compact={false} />
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <OrderSummaryCard
            subtotal={subtotal}
            discount={discount}
            total={total}
            locale={locale}
            title={t('checkout.orderSummary')}
            className="lg:sticky lg:top-24"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value)
                    setCouponError('')
                  }}
                  placeholder={t('cart.couponPlaceholder')}
                  className="flex-1"
                  aria-label={t('cart.couponPlaceholder')}
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  isLoading={isApplying}
                  disabled={!couponCode.trim()}
                >
                  {t('cart.applyCoupon')}
                </Button>
              </div>
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
              {appliedCoupon && !couponError && (
                <p className="text-xs font-medium text-emerald-600">
                  {appliedCoupon.code.toUpperCase()} — {t('toast.couponApplied')}
                </p>
              )}
              <p className="mt-1 flex items-start gap-1.5 text-xs text-text-secondary">
                <Tag className="mt-0.5 size-3 shrink-0" />
                {t('cart.couponHint')}
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={() => navigate(ROUTES.CHECKOUT)}>
              {t('cart.checkout')}
            </Button>
          </OrderSummaryCard>
        </RevealOnScroll>
      </div>
    </div>
  )
}
