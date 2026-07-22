import { Check, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ComparisonRow {
  label: string
  values: (string | boolean)[]
}

interface ComparisonTableProps {
  columns: string[]
  rows: ComparisonRow[]
  highlightColumnIndex?: number
}

export function ComparisonTable({ columns, rows, highlightColumnIndex }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-surface">
            <th className="sticky left-0 z-10 bg-surface p-4 text-left font-medium text-text-secondary">
              &nbsp;
            </th>
            {columns.map((col, idx) => (
              <th
                key={col}
                className={cn(
                  'p-4 text-left font-semibold text-text-primary',
                  idx === highlightColumnIndex && 'bg-primary/[0.07]',
                )}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-border">
              <td className="sticky left-0 z-10 bg-background p-4 font-medium text-text-primary">
                {row.label}
              </td>
              {row.values.map((value, idx) => (
                <td
                  key={idx}
                  className={cn(
                    'p-4 text-text-secondary',
                    idx === highlightColumnIndex && 'bg-primary/[0.04]',
                  )}
                >
                  {typeof value === 'boolean' ? (
                    value ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <Minus className="size-4 text-text-secondary/40" />
                    )
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
