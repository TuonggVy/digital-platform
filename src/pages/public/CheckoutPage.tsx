import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { useLocale } from '@/hooks/useLocale'
import { ROUTES } from '@/constants/routes'
import { orderApiService } from '@/services/orderApiService'
import type { CreateOrderRequest } from '@/services/orderApiService'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { CheckoutLayout } from '@/components/checkout/CheckoutLayout'
import { CheckoutReviewCard } from '@/components/checkout/CheckoutReviewCard'
import { CheckoutProductReview } from '@/components/checkout/CheckoutProductReview'
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary'
import { CheckoutCustomerForm, type CustomerInfoFormValues } from '@/components/checkout/CheckoutCustomerForm'
import { CheckoutSecurityNotice } from '@/components/checkout/CheckoutSecurityNotice'
import { MobileOrderSummary } from '@/components/checkout/MobileOrderSummary'

const phoneRegex = /^[0-9+()\-\s]{8,15}$/

function buildCustomerInfoSchema(t: (key: string) => string) {
  return z.object({
    fullName: z.string().min(1, t('validation.required')),
    email: z.string().min(1, t('validation.required')).email(t('validation.invalidEmail')),
    phone: z
      .string()
      .min(1, t('validation.required'))
      .regex(phoneRegex, t('validation.invalidPhone')),
    company: z.string().optional(),
    taxCode: z.string().optional(),
    note: z.string().optional(),
  })
}

/**
 * The "Information" step of checkout only — collect + validate customer info,
 * create the order, then hand off to PaymentPage. Payment-method selection no
 * longer lives here (see PaymentPage): creating an order only reserves it
 * (status PENDING/AWAITING_PAYMENT), it is never treated as "paid".
 */
export function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)

  const currentUser = useAuthStore((s) => s.currentUser)
  const cartItems = useCartStore((s) => s.items)
  // Preview only — computed client-side from the cart for a responsive summary
  // while typing. The order actually created below carries no price fields at
  // all; `orderApiService.createOrder`'s response (and PaymentPage after it)
  // is what reflects the backend's authoritative subtotal/discount/total.
  const subtotal = useCartStore((s) => s.subtotal)
  const discount = useCartStore((s) => s.discount)
  const total = useCartStore((s) => s.total)
  const appliedCoupon = useCartStore((s) => s.appliedCoupon)
  const clearCart = useCartStore((s) => s.clearCart)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const schema = buildCustomerInfoSchema(t)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
      company: currentUser?.company ?? '',
      taxCode: currentUser?.taxCode ?? '',
      note: '',
    },
  })

  useEffect(() => {
    if (!currentUser) {
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.CHECKOUT }, replace: true })
    }
  }, [currentUser, navigate])

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      navigate(ROUTES.CART, { replace: true })
    }
  }, [cartItems.length, orderPlaced, navigate])

  if (!currentUser || (cartItems.length === 0 && !orderPlaced)) {
    return null
  }

  async function onSubmit(values: CustomerInfoFormValues) {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      // Backend is the sole source of truth for pricing — only productId/packageId/
      // quantity and customer info are sent, never unitPrice/subtotal/discount/total.
      const payload: CreateOrderRequest = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          packageId: item.packageId,
          quantity: item.quantity,
        })),
        customerName: values.fullName,
        customerEmail: values.email,
        customerPhone: values.phone,
        note: values.note || undefined,
      }
      const order = await orderApiService.createOrder(payload)
      setOrderPlaced(true)
      // Only clear the cart once the order is confirmed created, never before.
      clearCart()
      // Creating the order only reserves it (status PENDING/AWAITING_PAYMENT) —
      // it does not mean payment succeeded. That's PaymentPage's job next.
      navigate(ROUTES.CHECKOUT_PAYMENT(order.id), { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.genericError')
      showToast(message, 'error')
      setIsSubmitting(false)
    }
  }

  const summary = (
    <CheckoutOrderSummary
      variant="embedded"
      subtotal={subtotal}
      discount={discount}
      total={total}
      locale={locale}
      couponCode={appliedCoupon?.code}
    />
  )

  const coupon = appliedCoupon ? (
    <p className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700">
      {t('checkout.couponNotAppliedYet')}
    </p>
  ) : undefined

  return (
    <>
      <Seo title={t('checkout.title')} />
      <CheckoutLayout
        backTo={ROUTES.CART}
        backLabel={t('checkout.layout.backToCart')}
        currentStep={1}
        left={
          <CheckoutReviewCard coupon={coupon} summary={summary}>
            <CheckoutProductReview items={cartItems} locale={locale} />
          </CheckoutReviewCard>
        }
        mobileSummary={
          <MobileOrderSummary total={total} locale={locale}>
            <CheckoutProductReview items={cartItems} locale={locale} />
            {summary}
          </MobileOrderSummary>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
          <CheckoutCustomerForm register={register} errors={errors} />

          <CheckoutSecurityNotice />

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            aria-busy={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="size-4" aria-hidden="true" /> : undefined}
            className="w-full sm:w-auto sm:self-end"
          >
            {t('checkout.customerInfo.continue')}
          </Button>
        </form>
      </CheckoutLayout>
    </>
  )
}
