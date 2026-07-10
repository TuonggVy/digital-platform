import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer'
import { ProductCardSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { PackageSearch } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  view?: 'grid' | 'list'
}

export function ProductGrid({
  products,
  isLoading,
  emptyTitle,
  emptyDescription,
  view = 'grid',
}: ProductGridProps) {
  const { t } = useTranslation()
  const gridClass =
    view === 'list'
      ? 'grid grid-cols-1 gap-4 max-w-3xl mx-auto'
      : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="size-6" />}
        title={emptyTitle ?? t('productsPage.emptyTitle')}
        description={emptyDescription ?? t('productsPage.emptyDesc')}
      />
    )
  }

  return (
    <StaggerContainer className={gridClass}>
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
