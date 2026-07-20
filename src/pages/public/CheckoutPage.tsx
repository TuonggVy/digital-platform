import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { useLocale } from '@/hooks/useLocale'
import { ROUTES } from '@/constants/routes'
import type { PaymentMethod } from '@/types'
import { orderApiService } from '@/services/orderApiService'
import type { CreateOrderRequest } from '@/services/orderApiService'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/common/Button'
import { Input, Textarea } from '@/components/common/Input'
import { RadioGroup } from '@/components/common/RadioGroup'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard'
import { StepIndicator } from '@/components/checkout/StepIndicator'
import { PaymentQrPanel } from '@/components/checkout/PaymentQrPanel'

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

type CustomerInfoFormValues = z.infer<ReturnType<typeof buildCustomerInfoSchema>>

export function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const locale = useLocale()
  const showToast = useUiStore((s) => s.showToast)

  const currentUser = useAuthStore((s) => s.currentUser)
  const cartItems = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal)
  const discount = useCartStore((s) => s.discount)
  const total = useCartStore((s) => s.total)
  const appliedCoupon = useCartStore((s) => s.appliedCoupon)
  const clearCart = useCartStore((s) => s.clearCart)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vietqr')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const schema = buildCustomerInfoSchema(t)
  const {
    register,
    handleSubmit,
    control,
    getValues,
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
  const customerInfo = useWatch({ control })

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

  const paymentOptions = [
    { value: 'vietqr', label: t('checkout.paymentMethod.vietqr') },
    { value: 'bank_transfer', label: t('checkout.paymentMethod.bank_transfer') },
    { value: 'e_wallet', label: t('checkout.paymentMethod.e_wallet') },
    { value: 'international_card', label: t('checkout.paymentMethod.international_card') },
  ]

  function goToStep2() {
    setStep(2)
  }

  async function handlePlaceOrder() {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const values = getValues()
      // Backend is the sole source of truth for pricing — only productId/packageId/quantity
      // and customer info are sent, never unitPrice/subtotal/total/discount/paymentMethod.
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
      clearCart()
      navigate(ROUTES.CHECKOUT_SUCCESS(order.id), { replace: true, state: { order } })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('toast.genericError')
      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('checkout.title')} />

      <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
        {t('checkout.title')}
      </h1>

      <div className="mt-8">
        <StepIndicator
          steps={[
            t('checkout.steps.info'),
            t('checkout.steps.review'),
            t('checkout.steps.payment'),
          ]}
          currentStep={step}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface/40 p-5 sm:p-8 lg:col-span-2">
          {step === 1 && (
            <RevealOnScroll direction="none">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('checkout.steps.info')}
              </h2>
              <form onSubmit={handleSubmit(goToStep2)} className="mt-5 flex flex-col gap-4">
                <Input
                  label={t('checkout.customerInfo.fullName')}
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Input
                  type="email"
                  label={t('checkout.customerInfo.email')}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label={t('checkout.customerInfo.phone')}
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label={t('checkout.customerInfo.company')} {...register('company')} />
                  <Input label={t('checkout.customerInfo.taxCode')} {...register('taxCode')} />
                </div>
                <Textarea label={t('checkout.customerInfo.note')} rows={3} {...register('note')} />

                <div className="mt-2 flex justify-end">
                  <Button type="submit" size="lg">
                    {t('common.continue')}
                  </Button>
                </div>
              </form>
            </RevealOnScroll>
          )}

          {step === 2 && (
            <RevealOnScroll direction="none">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('checkout.steps.review')}
              </h2>
              <div className="mt-5 divide-y divide-border rounded-xl border border-border px-4">
                {cartItems.map((item) => (
                  <CartItemRow key={item.cartItemId} item={item} compact />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  {t('checkout.steps.info')}
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {t('common.back')}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-text-secondary">
                    {t('checkout.customerInfo.fullName')}:{' '}
                  </span>
                  <span className="text-text-primary">{customerInfo.fullName}</span>
                </p>
                <p>
                  <span className="text-text-secondary">{t('checkout.customerInfo.email')}: </span>
                  <span className="text-text-primary">{customerInfo.email}</span>
                </p>
                <p>
                  <span className="text-text-secondary">{t('checkout.customerInfo.phone')}: </span>
                  <span className="text-text-primary">{customerInfo.phone}</span>
                </p>
                {customerInfo.company && (
                  <p>
                    <span className="text-text-secondary">
                      {t('checkout.customerInfo.company')}:{' '}
                    </span>
                    <span className="text-text-primary">{customerInfo.company}</span>
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button size="lg" onClick={() => setStep(3)}>
                  {t('common.continue')}
                </Button>
              </div>
            </RevealOnScroll>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {t('checkout.paymentMethod.title')}
              </h2>
              <RadioGroup
                name="paymentMethod"
                value={paymentMethod}
                onChange={(value) => setPaymentMethod(value as PaymentMethod)}
                options={paymentOptions}
                className="mt-4"
              />

              {(paymentMethod === 'vietqr' || paymentMethod === 'bank_transfer') && (
                <div className="mt-4">
                  <PaymentQrPanel method={paymentMethod} />
                </div>
              )}

              {paymentMethod === 'international_card' && (
                <p className="mt-4 rounded-xl border border-dashed border-border bg-surface/40 p-4 text-sm text-text-secondary">
                  {t('checkout.internationalCardNote')}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>
                  {t('common.back')}
                </Button>
                <Button size="lg" onClick={handlePlaceOrder} isLoading={isSubmitting}>
                  {isSubmitting ? t('checkout.processingOrder') : t('checkout.placeOrder')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24">
          <OrderSummaryCard
            subtotal={subtotal}
            discount={discount}
            total={total}
            locale={locale}
            title={t('checkout.orderSummary')}
          />
          {appliedCoupon && (
            <p className="mt-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700">
              {t('checkout.couponNotAppliedYet')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
