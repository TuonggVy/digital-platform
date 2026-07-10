import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Paperclip } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { serviceService } from '@/services/serviceService'
import { ticketService } from '@/services/ticketService'
import type { CustomerService, SupportTicket } from '@/types'
import { Seo } from '@/components/common/Seo'
import { Input, Textarea } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { ROUTES } from '@/constants/routes'

const SERVICE_TYPES = ['cloud', 'kaspersky', 'esim', 'billing', 'account'] as const
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

function buildTicketSchema(t: TFunction) {
  return z.object({
    serviceType: z.enum(SERVICE_TYPES),
    relatedServiceId: z.string().optional(),
    subject: z.string().min(1, t('validation.required')),
    priority: z.enum(PRIORITIES),
    message: z
      .string()
      .min(1, t('validation.required'))
      .min(10, t('validation.minLength', { count: 10 })),
  })
}

type TicketFormValues = z.infer<ReturnType<typeof buildTicketSchema>>

interface NavigationState {
  serviceId?: string
  category?: SupportTicket['category']
}

export function TicketNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useAuthStore((s) => s.currentUser)
  const showToast = useUiStore((s) => s.showToast)

  const navState = (location.state as NavigationState | null) ?? null
  const [userServices, setUserServices] = useState<CustomerService[]>([])
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined)

  const schema = useMemo(() => buildTicketSchema(t), [t])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceType: navState?.category ?? 'cloud',
      relatedServiceId: navState?.serviceId ?? '',
      subject: '',
      priority: 'MEDIUM',
      message: '',
    },
  })

  const serviceType = useWatch({ control, name: 'serviceType' })

  useEffect(() => {
    if (!currentUser) return
    serviceService.getServicesByUser(currentUser.id).then(setUserServices)
  }, [currentUser])

  const relatedServiceOptions =
    serviceType === 'cloud' || serviceType === 'kaspersky' || serviceType === 'esim'
      ? userServices
          .filter((s) => s.type === serviceType)
          .map((s) => ({ value: s.id, label: `${s.productName} - ${s.packageName}` }))
      : []

  async function onSubmit(data: TicketFormValues) {
    if (!currentUser) return
    await ticketService.createTicket({
      userId: currentUser.id,
      category: data.serviceType,
      relatedServiceId: data.relatedServiceId || undefined,
      subject: data.subject,
      priority: data.priority,
      message: data.message,
      attachmentName,
    })
    showToast(t('account.tickets.form.success'), 'success')
    navigate(ROUTES.ACCOUNT_TICKETS)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Seo title={t('account.tickets.newTicket')} />

      <RevealOnScroll>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          {t('account.tickets.newTicket')}
        </h1>
      </RevealOnScroll>

      <RevealOnScroll>
        <form
          className="flex flex-col gap-4 rounded-2xl border border-border p-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Select
            label={t('account.tickets.form.serviceType')}
            error={errors.serviceType?.message}
            options={SERVICE_TYPES.map((value) => ({
              value,
              label:
                value === 'billing' || value === 'account'
                  ? t(`supportPage.categories.${value}`)
                  : t(`nav.megamenu.${value}`),
            }))}
            {...register('serviceType', { onChange: () => setValue('relatedServiceId', '') })}
          />

          {relatedServiceOptions.length > 0 && (
            <Select
              label={t('account.tickets.form.relatedService')}
              placeholder={t('common.optional')}
              error={errors.relatedServiceId?.message}
              options={relatedServiceOptions}
              {...register('relatedServiceId')}
            />
          )}

          <Input
            label={t('account.tickets.form.subject')}
            error={errors.subject?.message}
            {...register('subject')}
          />

          <Select
            label={t('account.tickets.form.priority')}
            error={errors.priority?.message}
            options={PRIORITIES.map((value) => ({
              value,
              label: t(`account.tickets.priorities.${value}`),
            }))}
            {...register('priority')}
          />

          <Textarea
            label={t('account.tickets.form.message')}
            error={errors.message?.message}
            {...register('message')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">
              {t('account.tickets.form.attachment')}
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-text-secondary transition-colors hover:bg-surface">
              <Paperclip className="size-4 shrink-0" />
              <span className="truncate">
                {attachmentName ?? t('account.tickets.form.attachment')}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setAttachmentName(e.target.files?.[0]?.name)}
              />
            </label>
            <p className="text-xs text-text-secondary">
              {t('account.tickets.form.attachmentHint')}
            </p>
          </div>

          <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
            {t('account.tickets.form.submit')}
          </Button>
        </form>
      </RevealOnScroll>
    </div>
  )
}
