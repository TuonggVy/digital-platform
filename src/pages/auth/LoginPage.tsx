import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Boxes, Clock } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Checkbox } from '@/components/common/Checkbox'
import { Seo } from '@/components/common/Seo'
import { AuthLayout, type AuthTrustItem } from '@/components/auth/AuthLayout'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { ROUTES } from '@/constants/routes'

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
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const schema = useMemo(() => buildLoginSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const trustItems: AuthTrustItem[] = [
    {
      icon: ShieldCheck,
      title: t('auth.trust.secure.title'),
      description: t('auth.trust.secure.description'),
    },
    {
      icon: Boxes,
      title: t('auth.trust.reliable.title'),
      description: t('auth.trust.reliable.description'),
    },
    {
      icon: Clock,
      title: t('auth.trust.support.title'),
      description: t('auth.trust.support.description'),
    },
  ]

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

  return (
    <>
      <Seo title={t('auth.login.title')} description={t('auth.login.subtitle')} />

      <AuthLayout
        title={t('auth.login.title')}
        subtitle={t('auth.login.subtitle')}
        formError={formError}
        trustItems={trustItems}
        footer={
          <>
            {t('auth.login.noAccount')}{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-accent hover:underline">
              {t('auth.login.registerNow')}
            </Link>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <StaggerContainer className="flex flex-col gap-4">
            <StaggerItem>
              <Input
                tone="dark"
                label={t('auth.login.email')}
                type="email"
                autoComplete="email"
                placeholder={t('auth.login.emailPlaceholder')}
                leftIcon={<Mail className="size-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </StaggerItem>
            <StaggerItem>
              <Input
                tone="dark"
                label={t('auth.login.password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('auth.login.passwordPlaceholder')}
                leftIcon={<Lock className="size-4" />}
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
                    aria-pressed={showPassword}
                    className="flex items-center rounded-sm text-white/50 hover:text-white/80 focus-ring"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
                {...register('password')}
              />
            </StaggerItem>

            <StaggerItem>
              <div className="flex items-center justify-between gap-4">
                <Checkbox
                  tone="dark"
                  label={t('auth.login.remember')}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="whitespace-nowrap text-sm font-medium text-accent hover:underline"
                >
                  {t('auth.login.forgot')}
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <Button type="submit" size="lg" isLoading={isSubmitting} shine className="mt-2 w-full">
                {t('auth.login.submit')}
              </Button>
            </StaggerItem>
          </StaggerContainer>
        </form>
      </AuthLayout>
    </>
  )
}
