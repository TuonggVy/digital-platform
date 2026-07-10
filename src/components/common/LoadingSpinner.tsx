import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-10 text-text-secondary',
        className,
      )}
      role="status"
    >
      <Loader2 className="size-6 animate-spin text-primary" />
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  )
}
