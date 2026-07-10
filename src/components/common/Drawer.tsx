import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  side?: 'left' | 'right'
  widthClassName?: string
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  widthClassName = 'max-w-md',
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const isRight = side === 'right'

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative z-10 flex h-full w-full flex-col bg-background shadow-2xl',
              widthClassName,
              isRight ? 'ml-auto' : 'mr-auto',
            )}
            initial={{ x: isRight ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRight ? '100%' : '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto rounded-lg p-1.5 text-text-secondary hover:bg-surface focus-ring"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
