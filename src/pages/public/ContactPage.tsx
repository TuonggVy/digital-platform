import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, Clock, MapPin, Map, CheckCircle2 } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { Input, Textarea } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { contentService } from '@/services/contentService'

const contactSchema = z.object({
  fullName: z.string().min(1, 'validation.required'),
  email: z.string().min(1, 'validation.required').email('validation.invalidEmail'),
  phone: z.string().min(1, 'validation.required'),
  company: z.string().optional(),
  subject: z.string().min(1, 'validation.required'),
  message: z.string().min(10, 'validation.minLength'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function ContactPage() {
  const { t } = useTranslation()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) })

  async function onSubmit(values: ContactFormValues) {
    await contentService.submitContactForm({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      company: values.company,
      subject: values.subject,
      message: values.message,
    })
    setIsSubmitted(true)
  }

  function errorMessage(key?: string) {
    if (!key) return undefined
    return key === 'validation.minLength' ? t(key, { count: 10 }) : t(key)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title={t('contactPage.title')} description={t('contactPage.subtitle')} />

      <RevealOnScroll className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {t('contactPage.title')}
        </h1>
        <p className="mt-3 text-text-secondary">{t('contactPage.subtitle')}</p>
      </RevealOnScroll>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <RevealOnScroll className="lg:col-span-3" direction="left">
          <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
            {isSubmitted ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="size-7" />
                </span>
                <h2 className="text-xl font-semibold text-text-primary">
                  {t('contactPage.successTitle')}
                </h2>
                <p className="max-w-sm text-sm text-text-secondary">
                  {t('contactPage.successDesc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label={t('contactPage.form.fullName')}
                    placeholder={t('contactPage.form.fullName')}
                    error={errorMessage(errors.fullName?.message)}
                    {...register('fullName')}
                  />
                  <Input
                    type="email"
                    label={t('contactPage.form.email')}
                    placeholder={t('contactPage.form.email')}
                    error={errorMessage(errors.email?.message)}
                    {...register('email')}
                  />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label={t('contactPage.form.phone')}
                    placeholder={t('contactPage.form.phone')}
                    error={errorMessage(errors.phone?.message)}
                    {...register('phone')}
                  />
                  <Input
                    label={t('contactPage.form.company')}
                    placeholder={t('contactPage.form.company')}
                    error={errorMessage(errors.company?.message)}
                    {...register('company')}
                  />
                </div>
                <Input
                  label={t('contactPage.form.subject')}
                  placeholder={t('contactPage.form.subject')}
                  error={errorMessage(errors.subject?.message)}
                  {...register('subject')}
                />
                <Textarea
                  label={t('contactPage.form.message')}
                  placeholder={t('contactPage.form.message')}
                  error={errorMessage(errors.message?.message)}
                  {...register('message')}
                />
                <Button type="submit" size="lg" isLoading={isSubmitting} className="self-start">
                  {t('contactPage.form.submit')}
                </Button>
              </form>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="lg:col-span-2" direction="right" delay={0.1}>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('contactPage.info.email')}
                </p>
                <p className="text-sm text-text-secondary">support@novadigital.vn</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('contactPage.info.hotline')}
                </p>
                <p className="text-sm text-text-secondary">1900 6868 (Demo)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('contactPage.info.hours')}
                </p>
                <p className="text-sm text-text-secondary">{t('contactPage.info.hoursValue')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {t('contactPage.info.address')}
                </p>
                <p className="text-sm text-text-secondary">{t('contactPage.info.addressValue')}</p>
              </div>
            </div>

            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/50 text-text-secondary">
              <Map className="size-6" />
              <p className="text-sm">{t('contactPage.info.mapPlaceholder')}</p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}
