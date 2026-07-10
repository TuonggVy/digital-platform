import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { User, Building2, FileText, MapPin } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { Seo } from '@/components/common/Seo'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

function buildProfileSchema(t: TFunction) {
  return z.object({
    fullName: z.string().min(1, t('validation.required')),
    phone: z.string().optional(),
    company: z.string().optional(),
    taxCode: z.string().optional(),
    address: z.string().optional(),
  })
}

type ProfileFormValues = z.infer<ReturnType<typeof buildProfileSchema>>

export function ProfilePage() {
  const { t } = useTranslation()
  const currentUser = useAuthStore((s) => s.currentUser)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const showToast = useUiStore((s) => s.showToast)

  const schema = useMemo(() => buildProfileSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: currentUser?.name ?? '',
      phone: currentUser?.phone ?? '',
      company: currentUser?.company ?? '',
      taxCode: currentUser?.taxCode ?? '',
      address: currentUser?.address ?? '',
    },
  })

  useEffect(() => {
    if (!currentUser) return
    reset({
      fullName: currentUser.name,
      phone: currentUser.phone ?? '',
      company: currentUser.company ?? '',
      taxCode: currentUser.taxCode ?? '',
      address: currentUser.address ?? '',
    })
  }, [currentUser, reset])

  if (!currentUser) return null

  async function onSubmit(data: ProfileFormValues) {
    await updateProfile({
      name: data.fullName,
      phone: data.phone,
      company: data.company,
      taxCode: data.taxCode,
      address: data.address,
    })
    showToast(t('account.profile.success'), 'success')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Seo title={t('account.profile.title')} />

      <RevealOnScroll>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          {t('account.profile.title')}
        </h1>
      </RevealOnScroll>

      <RevealOnScroll>
        <form
          className="flex flex-col gap-4 rounded-2xl border border-border p-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Input
            label={t('account.profile.fullName')}
            leftIcon={<User className="size-4" />}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input label={t('account.profile.email')} value={currentUser.email} disabled readOnly />
          <Input label={t('account.profile.phone')} type="tel" {...register('phone')} />
          <Input
            label={t('account.profile.company')}
            leftIcon={<Building2 className="size-4" />}
            {...register('company')}
          />
          <Input
            label={t('account.profile.taxCode')}
            leftIcon={<FileText className="size-4" />}
            {...register('taxCode')}
          />
          <Input
            label={t('account.profile.address')}
            leftIcon={<MapPin className="size-4" />}
            {...register('address')}
          />

          <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
            {t('common.save')}
          </Button>
        </form>
      </RevealOnScroll>
    </div>
  )
}
