import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Seo } from '@/components/common/Seo'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { authService } from '@/services/authService'
import { ROUTES } from '@/constants/routes'

function buildForgotPasswordSchema(t: TFunction) {
  return z.object({
    email: z.string().min(1, t('validation.required')).email(t('validation.invalidEmail')),
  })
}

type ForgotPasswordFormValues = z.infer<ReturnType<typeof buildForgotPasswordSchema>>

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)

  const schema = useMemo(() => buildForgotPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    await authService.requestPasswordReset(data.email)
    setSubmitted(true)
  }

  return (
    <div className="relative isolate overflow-hidden">
      <Seo title={t('auth.forgotPassword.title')} description={t('auth.forgotPassword.subtitle')} />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 -z-10 size-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 -z-10 size-72 rounded-full bg-secondary/20 blur-3xl" />

      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <RevealOnScroll>
          <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-7" />
                </span>
                <h1 className="text-xl font-semibold text-text-primary">
                  {t('auth.forgotPassword.title')}
                </h1>
                <p className="text-sm text-text-secondary">{t('auth.forgotPassword.success')}</p>
                <Link
                  to={ROUTES.LOGIN}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  {t('auth.forgotPassword.backToLogin')}
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h1 className="text-2xl font-semibold text-text-primary">
                    {t('auth.forgotPassword.title')}
                  </h1>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('auth.forgotPassword.subtitle')}
                  </p>
                </div>

                <form
                  className="mt-8 flex flex-col gap-4"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <Input
                    label={t('auth.forgotPassword.email')}
                    type="email"
                    autoComplete="email"
                    leftIcon={<Mail className="size-4" />}
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
                    {t('auth.forgotPassword.submit')}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-text-secondary">
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    <ArrowLeft className="size-4" />
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </p>
              </>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}
