import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Seo } from '@/components/common/Seo'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { authService } from '@/services/authService'
import { useUiStore } from '@/stores/uiStore'
import { ROUTES } from '@/constants/routes'

function buildResetPasswordSchema(t: TFunction) {
  return z
    .object({
      newPassword: z
        .string()
        .min(1, t('validation.required'))
        .min(8, t('validation.minLength', { count: 8 })),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
}

type ResetPasswordFormValues = z.infer<ReturnType<typeof buildResetPasswordSchema>>

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showToast = useUiStore((s) => s.showToast)
  const token = searchParams.get('token')
  const [tokenError, setTokenError] = useState(false)

  const schema = useMemo(() => buildResetPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) return
    setTokenError(false)
    try {
      await authService.resetPassword({ token, newPassword: data.newPassword })
      showToast(t('auth.resetPassword.success'), 'success')
      navigate(ROUTES.LOGIN, { replace: true })
    } catch {
      setTokenError(true)
    }
  }

  const showInvalidLink = !token || tokenError

  return (
    <div className="relative isolate overflow-hidden">
      <Seo title={t('auth.resetPassword.title')} description={t('auth.resetPassword.subtitle')} />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 -z-10 size-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 -z-10 size-72 rounded-full bg-primary/20 blur-3xl" />

      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <RevealOnScroll>
          <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
            {showInvalidLink ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <AlertTriangle className="size-7" />
                </span>
                <h1 className="text-xl font-semibold text-text-primary">
                  {t('auth.resetPassword.invalidLinkTitle')}
                </h1>
                <p className="text-sm text-text-secondary">
                  {!token
                    ? t('auth.resetPassword.invalidLinkMessage')
                    : t('auth.resetPassword.tokenErrorMessage')}
                </p>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {t('auth.resetPassword.requestNewLink')}
                </Link>
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  {t('auth.resetPassword.backToLogin')}
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h1 className="text-2xl font-semibold text-text-primary">
                    {t('auth.resetPassword.title')}
                  </h1>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('auth.resetPassword.subtitle')}
                  </p>
                </div>

                <form
                  className="mt-8 flex flex-col gap-4"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <Input
                    label={t('auth.resetPassword.newPassword')}
                    type="password"
                    autoComplete="new-password"
                    leftIcon={<Lock className="size-4" />}
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                  />
                  <Input
                    label={t('auth.resetPassword.confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    leftIcon={<Lock className="size-4" />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
                    {t('auth.resetPassword.submit')}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-text-secondary">
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    <ArrowLeft className="size-4" />
                    {t('auth.resetPassword.backToLogin')}
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
