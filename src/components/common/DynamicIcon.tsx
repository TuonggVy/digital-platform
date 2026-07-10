import { icons, HelpCircle } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

interface DynamicIconProps extends LucideProps {
  name: string
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? HelpCircle
  return <Icon {...props} />
}
