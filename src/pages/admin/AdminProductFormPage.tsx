import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { productService } from '@/services/productService'
import type { BillingCycle, Product, ProductCategory } from '@/types'
import { Seo } from '@/components/common/Seo'
import { PageHeader } from '@/components/admin/PageHeader'
import { Input, Textarea } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Checkbox } from '@/components/common/Checkbox'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useUiStore } from '@/stores/uiStore'
import { ROUTES } from '@/constants/routes'

interface FeatureRow {
  vi: string
  en: string
}

interface PackageRow {
  id: string
  nameVi: string
  nameEn: string
  price: number
  billingCycle: BillingCycle
}

interface ProductFormValues {
  nameVi: string
  nameEn: string
  slug: string
  category: ProductCategory
  subCategory: string
  shortDescVi: string
  shortDescEn: string
  descriptionVi: string
  descriptionEn: string
  startingPrice: number
  badgeVi: string
  badgeEn: string
  isActive: boolean
  isFeatured: boolean
  features: FeatureRow[]
  packages: PackageRow[]
}

const DEFAULT_ICON_BY_CATEGORY: Record<ProductCategory, string> = {
  cloud: 'Server',
  kaspersky: 'ShieldCheck',
  esim: 'Wifi',
}

let packageIdCounter = 0
function nextPackageId(): string {
  packageIdCounter += 1
  return `pkg-form-${Date.now()}-${packageIdCounter}`
}

function emptyValues(): ProductFormValues {
  return {
    nameVi: '',
    nameEn: '',
    slug: '',
    category: 'cloud',
    subCategory: '',
    shortDescVi: '',
    shortDescEn: '',
    descriptionVi: '',
    descriptionEn: '',
    startingPrice: 0,
    badgeVi: '',
    badgeEn: '',
    isActive: true,
    isFeatured: false,
    features: [],
    packages: [],
  }
}

function toFormValues(product: Product): ProductFormValues {
  return {
    nameVi: product.name.vi,
    nameEn: product.name.en,
    slug: product.slug,
    category: product.category,
    subCategory: product.subCategory,
    shortDescVi: product.shortDescription.vi,
    shortDescEn: product.shortDescription.en,
    descriptionVi: product.description.vi,
    descriptionEn: product.description.en,
    startingPrice: product.startingPrice,
    badgeVi: product.badge?.vi ?? '',
    badgeEn: product.badge?.en ?? '',
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    features: product.features.map((f) => ({ vi: f.vi, en: f.en })),
    packages: product.packages.map((p) => ({
      id: p.id,
      nameVi: p.name.vi,
      nameEn: p.name.en,
      price: p.price,
      billingCycle: p.billingCycle,
    })),
  }
}

export function AdminProductFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const showToast = useUiStore((s) => s.showToast)
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id

  const [existingProduct, setExistingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({ defaultValues: emptyValues() })

  const featureFields = useFieldArray({ control, name: 'features' })
  const packageFields = useFieldArray({ control, name: 'packages' })

  useEffect(() => {
    if (!isEditMode || !id) return
    setIsLoading(true)
    productService
      .getAllForAdmin()
      .then((all) => {
        const found = all.find((p) => p.id === id) ?? null
        setExistingProduct(found)
        if (found) reset(toFormValues(found))
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditMode, reset])

  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true)
    try {
      const existingPackagesById = new Map((existingProduct?.packages ?? []).map((p) => [p.id, p]))

      const packages = values.packages.map((row) => {
        const original = existingPackagesById.get(row.id)
        return {
          id: row.id,
          name: { vi: row.nameVi, en: row.nameEn || row.nameVi },
          price: Number(row.price),
          billingCycle: row.billingCycle,
          ...(original?.isPopular !== undefined ? { isPopular: original.isPopular } : {}),
          ...(original?.cloud ? { cloud: original.cloud } : {}),
          ...(original?.kaspersky ? { kaspersky: original.kaspersky } : {}),
          ...(original?.esim ? { esim: original.esim } : {}),
        }
      })

      const billingCycleSet = new Set(packages.map((p) => p.billingCycle))
      const billingCycles =
        billingCycleSet.size > 0 ? Array.from(billingCycleSet) : (['monthly'] as BillingCycle[])

      const features = values.features
        .filter((f) => f.vi.trim().length > 0)
        .map((f) => ({ vi: f.vi, en: f.en || f.vi }))

      const input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: values.slug.trim(),
        category: values.category,
        subCategory: values.subCategory.trim(),
        name: { vi: values.nameVi, en: values.nameEn || values.nameVi },
        shortDescription: { vi: values.shortDescVi, en: values.shortDescEn || values.shortDescVi },
        description: { vi: values.descriptionVi, en: values.descriptionEn || values.descriptionVi },
        icon: existingProduct?.icon ?? DEFAULT_ICON_BY_CATEGORY[values.category],
        badge: values.badgeVi
          ? { vi: values.badgeVi, en: values.badgeEn || values.badgeVi }
          : undefined,
        startingPrice: Number(values.startingPrice),
        currency: 'VND',
        billingCycles,
        features,
        benefits: existingProduct?.benefits ?? [],
        howItWorks: existingProduct?.howItWorks ?? [],
        suitableFor: existingProduct?.suitableFor ?? [],
        faqs: existingProduct?.faqs ?? [],
        rating: existingProduct?.rating ?? 0,
        reviewCount: existingProduct?.reviewCount ?? 0,
        isFeatured: values.isFeatured,
        isActive: values.isActive,
        packages,
        relatedProductIds: existingProduct?.relatedProductIds ?? [],
      }

      if (isEditMode && id) {
        await productService.updateProduct(id, input)
        showToast(t('admin.products.form.updated'), 'success')
      } else {
        await productService.createProduct(input)
        showToast(t('admin.products.form.created'), 'success')
      }
      navigate(ROUTES.ADMIN_PRODUCTS)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <Seo title={t('admin.products.form.editTitle')} />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <Seo
        title={
          isEditMode ? t('admin.products.form.editTitle') : t('admin.products.form.createTitle')
        }
      />
      <PageHeader
        title={
          isEditMode ? t('admin.products.form.editTitle') : t('admin.products.form.createTitle')
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.products.form.nameVi')}
              {...register('nameVi', { required: true })}
              error={errors.nameVi ? t('validation.required') : undefined}
            />
            <Input label={t('admin.products.form.nameEn')} {...register('nameEn')} />
            <Input
              label={t('admin.products.form.slug')}
              {...register('slug', { required: true })}
              error={errors.slug ? t('validation.required') : undefined}
            />
            <Select
              label={t('admin.products.form.category')}
              {...register('category', { required: true })}
              options={[
                { value: 'cloud', label: t('nav.megamenu.cloud') },
                { value: 'kaspersky', label: t('nav.megamenu.kaspersky') },
                { value: 'esim', label: t('nav.megamenu.esim') },
              ]}
            />
            <Input
              label={t('admin.products.form.subCategory')}
              {...register('subCategory', { required: true })}
            />
            <Input
              type="number"
              step="1"
              label={t('admin.products.form.startingPrice')}
              {...register('startingPrice', { required: true, valueAsNumber: true })}
            />
            <Input
              label={t('admin.products.form.badge')}
              placeholder="vi"
              {...register('badgeVi')}
            />
            <Input
              label={`${t('admin.products.form.badge')} (EN)`}
              placeholder="en"
              {...register('badgeEn')}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Textarea
              label={t('admin.products.form.shortDescVi')}
              {...register('shortDescVi', { required: true })}
            />
            <Textarea label={t('admin.products.form.shortDescEn')} {...register('shortDescEn')} />
            <Textarea
              label={t('admin.products.form.descriptionVi')}
              {...register('descriptionVi', { required: true })}
            />
            <Textarea
              label={t('admin.products.form.descriptionEn')}
              {...register('descriptionEn')}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
            <Checkbox label={t('admin.products.form.status')} {...register('isActive')} />
            <Checkbox label={t('admin.products.form.isFeatured')} {...register('isFeatured')} />
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">
              {t('admin.products.form.features')}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="size-4" />}
              onClick={() => featureFields.append({ vi: '', en: '' })}
            >
              {t('admin.products.form.addFeature')}
            </Button>
          </div>
          {featureFields.fields.length === 0 && (
            <p className="text-sm text-text-secondary">{t('admin.products.form.noFeatures')}</p>
          )}
          <div className="flex flex-col gap-3">
            {featureFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
              >
                <Input
                  placeholder={t('admin.products.form.featureVi')}
                  {...register(`features.${index}.vi` as const)}
                />
                <Input
                  placeholder={t('admin.products.form.featureEn')}
                  {...register(`features.${index}.en` as const)}
                />
                <button
                  type="button"
                  onClick={() => featureFields.remove(index)}
                  aria-label={t('common.delete')}
                  className="justify-self-start rounded-lg p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-500 sm:justify-self-center"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">
              {t('admin.products.form.packages')}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="size-4" />}
              onClick={() =>
                packageFields.append({
                  id: nextPackageId(),
                  nameVi: '',
                  nameEn: '',
                  price: 0,
                  billingCycle: 'monthly',
                })
              }
            >
              {t('admin.products.form.addPackage')}
            </Button>
          </div>
          {packageFields.fields.length === 0 && (
            <p className="text-sm text-text-secondary">{t('admin.products.form.noPackages')}</p>
          )}
          <div className="flex flex-col gap-3">
            {packageFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_140px_160px_auto] sm:items-center"
              >
                <Input
                  placeholder={t('admin.products.form.packageNameVi')}
                  {...register(`packages.${index}.nameVi` as const, { required: true })}
                />
                <Input
                  placeholder={t('admin.products.form.packageNameEn')}
                  {...register(`packages.${index}.nameEn` as const)}
                />
                <Input
                  type="number"
                  step="1"
                  placeholder={t('admin.products.form.packagePrice')}
                  {...register(`packages.${index}.price` as const, {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
                <Select
                  {...register(`packages.${index}.billingCycle` as const)}
                  options={[
                    { value: 'monthly', label: t('common.monthly') },
                    { value: 'yearly', label: t('common.yearly') },
                    { value: 'one_time', label: t('common.oneTime') },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => packageFields.remove(index)}
                  aria-label={t('common.delete')}
                  className="justify-self-start rounded-lg p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-500 sm:justify-self-center"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {t('admin.products.form.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
