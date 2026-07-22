import type { Product, ProductPackage } from '@/types'

export interface ResolvedPackage {
  /** The package whose price, billing cycle and specs are shown together — always the same package. */
  pkg: ProductPackage
  /** Numeric price of the resolved package. Always sourced from `pkg.price`, never a different package. */
  price: number
  /** True when the product has more than one purchasable package, i.e. `price` is a "starting from" price rather than a fixed one. */
  isStartingPrice: boolean
}

/**
 * Deterministically picks the package a product card / pricing card represents,
 * so the displayed price, billing cycle, specs and any package-level badge all
 * come from the same package. Always the cheapest package by numeric price —
 * never `packages[0]` and never the `isPopular` package (popularity is a separate
 * signal from "starting from" pricing).
 */
export function resolveDisplayPackage(product: Pick<Product, 'packages'>): ResolvedPackage | null {
  const packages = product.packages ?? []
  if (packages.length === 0) return null

  const cheapest = packages.reduce((min, candidate) =>
    Number(candidate.price) < Number(min.price) ? candidate : min,
  )

  return {
    pkg: cheapest,
    price: Number(cheapest.price),
    isStartingPrice: packages.length > 1,
  }
}
