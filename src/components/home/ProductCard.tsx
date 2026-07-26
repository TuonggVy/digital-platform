import { Link } from 'react-router-dom'
import { motion, type MotionStyle } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ScrollHeroProduct {
  id: string
  name: string
  tagline: string
  image: string
  href: string
}

type ProductCardVariant = 'scroll' | 'reveal'

interface ProductCardProps {
  product: ScrollHeroProduct
  /** Raises the card slightly and gives it a stronger shadow so it reads as the featured pick. */
  featured?: boolean
  /** 'scroll' drives the card from an external scroll-linked `motionStyle`; 'reveal' plays a
   *  self-contained whileInView fade — used by the simplified mobile/reduced-motion layout. */
  variant?: ProductCardVariant
  motionStyle?: MotionStyle
  revealDelay?: number
  className?: string
  /** Overrides the image container's sizing. Scroll cards use a viewport-height clamp so the
   *  whole card fits inside the sticky panel; the reveal (mobile) layout keeps a fixed aspect. */
  imageClassName?: string
  /** Whether the card stretches to fill its grid/flex row (`h-full`, the default — every card
   *  matches the row's height). Set to `false` for a row that center-aligns cards of genuinely
   *  different heights (e.g. a taller featured card next to it): `h-full` resolves against the
   *  row's own height, which would otherwise stretch this card back out to match its sibling. */
  fillHeight?: boolean
}

export function ProductCard({
  product,
  featured = false,
  variant = 'scroll',
  motionStyle,
  revealDelay = 0,
  className,
  imageClassName,
  fillHeight = true,
}: ProductCardProps) {
  const variantProps =
    variant === 'scroll'
      ? { style: motionStyle }
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.55, delay: revealDelay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <motion.div
      className={cn(
        'transform-gpu [backface-visibility:hidden]',
        fillHeight ? 'h-full' : 'h-auto self-center',
        featured && 'lg:-mt-5 lg:z-10',
        className,
      )}
      {...variantProps}
    >
      <Link
        to={product.href}
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-home-line/70 transition-shadow duration-300',
          fillHeight && 'h-full',
          featured
            ? 'shadow-[0_20px_44px_-26px_rgba(5,27,51,0.38)] hover:shadow-[0_24px_50px_-24px_rgba(5,27,51,0.44)]'
            : 'shadow-[0_14px_32px_-22px_rgba(5,27,51,0.28)] hover:shadow-[0_18px_38px_-20px_rgba(5,27,51,0.32)]',
        )}
      >
        <div className={cn('relative w-full shrink-0 overflow-hidden', imageClassName ?? 'aspect-[4/5]')}>
          <img
            src={product.image}
            alt={product.name}
            width={640}
            height={800}
            loading={variant === 'scroll' ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-home-ink/60 via-home-ink/0 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4 lg:p-5">
          <h3 className="font-display text-base font-semibold text-home-graphite lg:text-lg">
            {product.name}
          </h3>
          <p className="line-clamp-2 flex-1 text-sm leading-6 text-home-graphite-soft">{product.tagline}</p>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-home-beacon transition-[gap] group-hover:gap-2.5">
            Tìm hiểu thêm
            <ArrowRight className="size-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
