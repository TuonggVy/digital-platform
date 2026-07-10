import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Checkbox } from '@/components/common/Checkbox'
import { Seo } from '@/components/common/Seo'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { ROUTES } from '@/constants/routes'
import { DEMO_ACCOUNTS } from '@/constants/config'

function buildLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().min(1, t('validation.required')).email(t('validation.invalidEmail')),
    password: z
      .string()
      .min(1, t('validation.required'))
      .min(6, t('validation.minLength', { count: 6 })),
  })
}

type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>

interface LocationState {
  from?: string
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const showToast = useUiStore((s) => s.showToast)
  const [remember, setRemember] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const schema = useMemo(() => buildLoginSchema(t), [t])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginFormValues) {
    setFormError(null)
    try {
      const user = await login(data.email, data.password)
      showToast(t('toast.loginSuccess'), 'success')
      const from = (location.state as LocationState | null)?.from
      if (from) {
        navigate(from, { replace: true })
      } else {
        navigate(user.role === 'admin' ? ROUTES.ADMIN : ROUTES.HOME, { replace: true })
      }
    } catch {
      setFormError(t('auth.login.invalidCredentials'))
    }
  }

  function fillDemo(kind: 'customer' | 'admin') {
    const account = DEMO_ACCOUNTS[kind]
    setValue('email', account.email)
    setValue('password', account.password)
  }

  return (
    <div className="relative isolate overflow-hidden">
      <Seo title={t('auth.login.title')} description={t('auth.login.subtitle')} />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 -z-10 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 -z-10 size-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <RevealOnScroll>
          <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-text-primary">{t('auth.login.title')}</h1>
              <p className="mt-1 text-sm text-text-secondary">{t('auth.login.subtitle')}</p>
            </div>

            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label={t('auth.login.email')}
                type="email"
                autoComplete="email"
                leftIcon={<Mail className="size-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('auth.login.password')}
                type="password"
                autoComplete="current-password"
                leftIcon={<Lock className="size-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex items-center justify-between gap-4">
                <Checkbox
                  label={t('auth.login.remember')}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="whitespace-nowrap text-sm font-medium text-primary hover:underline"
                >
                  {t('auth.login.forgot')}
                </Link>
              </div>

              <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
                {t('auth.login.submit')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              {t('auth.login.noAccount')}{' '}
              <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
                {t('auth.login.registerNow')}
              </Link>
            </p>

            <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {t('demoLabel')} · {t('auth.login.demoAccounts')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('customer')}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-primary transition-colors hover:border-primary hover:text-primary"
                >
                  {t('auth.login.demoCustomer')}
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-primary transition-colors hover:border-primary hover:text-primary"
                >
                  {t('auth.login.demoAdmin')}
                </button>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}
