import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Checkbox } from '@/components/common/Checkbox'
import { Seo } from '@/components/common/Seo'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { ROUTES } from '@/constants/routes'

const PHONE_REGEX = /^[0-9+\s-]{8,15}$/

function buildRegisterSchema(t: TFunction) {
  return z
    .object({
      fullName: z
        .string()
        .min(1, t('validation.required'))
        .min(2, t('validation.minLength', { count: 2 })),
      email: z.string().min(1, t('validation.required')).email(t('validation.invalidEmail')),
      phone: z
        .string()
        .min(1, t('validation.required'))
        .regex(PHONE_REGEX, t('validation.invalidPhone')),
      password: z
        .string()
        .min(1, t('validation.required'))
        .min(8, t('validation.minLength', { count: 8 })),
      confirmPassword: z.string().min(1, t('validation.required')),
      agreeTerms: z
        .boolean()
        .refine((val) => val === true, { message: t('validation.mustAgreeTerms') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
}

type RegisterFormValues = z.infer<ReturnType<typeof buildRegisterSchema>>

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const registerUser = useAuthStore((s) => s.register)
  const showToast = useUiStore((s) => s.showToast)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const schema = useMemo(() => buildRegisterSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setFormError(null)
    try {
      await registerUser({
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      showToast(t('toast.registerSuccess'), 'success')
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
        setFormError(t('auth.register.emailExists'))
      } else {
        setFormError(t('toast.genericError'))
      }
    }
  }

  return (
    <>
      <Seo title={t('auth.register.title')} description={t('auth.register.subtitle')} />

      <AuthLayout
        title={t('auth.register.title')}
        subtitle={t('auth.register.subtitle')}
        formError={formError}
        backLink={{ label: t('auth.backToLogin'), to: ROUTES.LOGIN }}
        footer={
          <>
            {t('auth.register.haveAccount')}{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-accent hover:underline">
              {t('auth.register.loginNow')}
            </Link>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <StaggerContainer className="flex flex-col gap-4">
            <StaggerItem>
              <Input
                tone="dark"
                label={t('auth.register.fullName')}
                type="text"
                autoComplete="name"
                placeholder={t('auth.register.fullNamePlaceholder')}
                leftIcon={<User className="size-4" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />
            </StaggerItem>
            <StaggerItem>
              <Input
                tone="dark"
                label={t('auth.register.email')}
                type="email"
                autoComplete="email"
                placeholder={t('auth.register.emailPlaceholder')}
                leftIcon={<Mail className="size-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </StaggerItem>
            <StaggerItem>
              <Input
                tone="dark"
                label={t('auth.register.phone')}
                type="tel"
                autoComplete="tel"
                placeholder={t('auth.register.phonePlaceholder')}
                leftIcon={<Phone className="size-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />
            </StaggerItem>
            <StaggerItem>
              <Input
                tone="dark"
                label={t('auth.register.password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('auth.register.passwordPlaceholder')}
                leftIcon={<Lock className="size-4" />}
                hint={!errors.password ? t('validation.minLength', { count: 8 }) : undefined}
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
              <Input
                tone="dark"
                label={t('auth.register.confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                leftIcon={<Lock className="size-4" />}
                error={errors.confirmPassword?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={t(showConfirmPassword ? 'auth.hidePassword' : 'auth.showPassword')}
                    aria-pressed={showConfirmPassword}
                    className="flex items-center rounded-sm text-white/50 hover:text-white/80 focus-ring"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
                {...register('confirmPassword')}
              />
            </StaggerItem>

            <StaggerItem>
              <Checkbox
                tone="dark"
                label={
                  <span>
                    {t('auth.register.agreeTermsPrefix')}{' '}
                    <Link
                      to={ROUTES.TERMS}
                      className="font-medium text-accent underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('auth.register.agreeTermsLink')}
                    </Link>{' '}
                    {t('auth.register.agreeTermsAnd')}{' '}
                    <Link
                      to={ROUTES.PRIVACY}
                      className="font-medium text-accent underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('legal.privacyTitle')}
                    </Link>
                  </span>
                }
                error={errors.agreeTerms?.message}
                {...register('agreeTerms')}
              />
            </StaggerItem>

            <StaggerItem>
              <Button type="submit" size="lg" isLoading={isSubmitting} shine className="mt-2 w-full">
                {t('auth.register.submit')}
              </Button>
            </StaggerItem>
          </StaggerContainer>
        </form>
      </AuthLayout>
    </>
  )
}
