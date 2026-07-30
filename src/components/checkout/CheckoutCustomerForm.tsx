import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Input, Textarea } from '@/components/common/Input'

export interface CustomerInfoFormValues {
  fullName: string
  email: string
  phone: string
  company?: string
  taxCode?: string
  note?: string
}

interface CheckoutCustomerFormProps {
  register: UseFormRegister<CustomerInfoFormValues>
  errors: FieldErrors<CustomerInfoFormValues>
}

/** Pure presentation — CheckoutPage owns the form state, validation, and submit handling. */
export function CheckoutCustomerForm({ register, errors }: CheckoutCustomerFormProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{t('checkout.customerInfo.title')}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t('checkout.customerInfo.description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t('checkout.customerInfo.fullName')}
          required
          className="h-12"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label={t('checkout.customerInfo.phone')}
          required
          type="tel"
          className="h-12"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <Input
        label={t('checkout.customerInfo.email')}
        required
        type="email"
        className="h-12"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t('checkout.customerInfo.company')}
          className="h-12"
          {...register('company')}
        />
        <Input
          label={t('checkout.customerInfo.taxCode')}
          className="h-12"
          {...register('taxCode')}
        />
      </div>

      <Textarea label={t('checkout.customerInfo.note')} rows={2} {...register('note')} />
    </div>
  )
}
