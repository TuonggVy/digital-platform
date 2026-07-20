import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Checkbox } from '@/components/common/Checkbox'
import { Seo } from '@/components/common/Seo'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'
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
    <div className="relative isolate overflow-hidden">
      <Seo title={t('auth.register.title')} description={t('auth.register.subtitle')} />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 -z-10 size-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 -z-10 size-72 rounded-full bg-primary/20 blur-3xl" />

      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <RevealOnScroll>
          <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-text-primary">
                {t('auth.register.title')}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">{t('auth.register.subtitle')}</p>
            </div>

            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label={t('auth.register.fullName')}
                type="text"
                autoComplete="name"
                leftIcon={<User className="size-4" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input
                label={t('auth.register.email')}
                type="email"
                autoComplete="email"
                leftIcon={<Mail className="size-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('auth.register.phone')}
                type="tel"
                autoComplete="tel"
                leftIcon={<Phone className="size-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label={t('auth.register.password')}
                type="password"
                autoComplete="new-password"
                leftIcon={<Lock className="size-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label={t('auth.register.confirmPassword')}
                type="password"
                autoComplete="new-password"
                leftIcon={<Lock className="size-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Checkbox
                label={
                  <span>
                    {t('auth.register.agreeTermsPrefix')}{' '}
                    <Link
                      to={ROUTES.TERMS}
                      className="font-medium text-primary underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('auth.register.agreeTermsLink')}
                    </Link>
                  </span>
                }
                error={errors.agreeTerms?.message}
                {...register('agreeTerms')}
              />

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
                {t('auth.register.submit')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              {t('auth.register.haveAccount')}{' '}
              <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                {t('auth.register.loginNow')}
              </Link>
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}
