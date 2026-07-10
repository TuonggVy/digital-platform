import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface AccordionItemData {
  id: string
  question: ReactNode
  answer: ReactNode
}

interface AccordionProps {
  items: AccordionItemData[]
  className?: string
  allowMultiple?: boolean
}

export function Accordion({ items, className, allowMultiple = false }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([])

  function toggle(id: string) {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id)
      if (isOpen) return prev.filter((i) => i !== id)
      return allowMultiple ? [...prev, id] : [id]
    })
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id)
        return (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-surface/50 overflow-hidden"
          >
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-text-primary focus-ring"
            >
              {item.question}
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-text-secondary transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 text-sm leading-relaxed text-text-secondary">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
