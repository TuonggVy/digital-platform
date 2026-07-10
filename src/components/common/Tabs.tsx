import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

export interface TabItem {
  value: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
}

export function Tabs({ tabs, value, defaultValue, onChange, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? tabs[0]?.value)
  const activeValue = value ?? internalValue

  function handleClick(v: string) {
    setInternalValue(v)
    onChange?.(v)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1',
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={activeValue === tab.value}
          onClick={() => handleClick(tab.value)}
          className={cn(
            'relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-ring',
            activeValue === tab.value
              ? 'text-white'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {activeValue === tab.value && (
            <motion.span
              layoutId="tabs-active-pill"
              className="absolute inset-0 rounded-lg bg-primary"
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}
