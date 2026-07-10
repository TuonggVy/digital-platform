import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'
import { Drawer } from '@/components/common/Drawer'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { CartItemRow } from './CartItemRow'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { useLocale } from '@/hooks/useLocale'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/constants/routes'

export function CartDrawer() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const locale = useLocale()
  const isOpen = useUiStore((s) => s.isCartDrawerOpen)
  const closeCartDrawer = useUiStore((s) => s.closeCartDrawer)
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)

  function goToCheckout() {
    closeCartDrawer()
    navigate(ROUTES.CART)
  }

  return (
    <Drawer isOpen={isOpen} onClose={closeCartDrawer} title={t('cart.title')}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="size-6" />}
              title={t('cart.emptyTitle')}
              description={t('cart.emptyDesc')}
            />
          ) : (
            items.map((item) => <CartItemRow key={item.cartItemId} item={item} compact />)
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-4 flex items-center justify-between text-sm font-semibold text-text-primary">
              <span>{t('cart.total')}</span>
              <span>{formatCurrency(total, locale)}</span>
            </div>
            <Button className="w-full" onClick={goToCheckout}>
              {t('cart.checkout')}
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  )
}
