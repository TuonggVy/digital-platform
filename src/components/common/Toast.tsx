import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/utils/cn'

const iconMap = {
  success: <CheckCircle2 className="size-5 text-emerald-500" />,
  error: <AlertCircle className="size-5 text-red-500" />,
  info: <Info className="size-5 text-primary" />,
}

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts)
  const dismissToast = useUiStore((s) => s.dismissToast)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-xl',
            )}
          >
            {iconMap[toast.type]}
            <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss"
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
