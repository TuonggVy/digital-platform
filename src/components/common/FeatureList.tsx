import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export function FeatureList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn('flex flex-col gap-2.5', className)}>
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
