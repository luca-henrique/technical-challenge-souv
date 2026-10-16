import type { BadgeTaxaProps } from './types'

export default function BadgeTaxa({ taxa, className = '' }: BadgeTaxaProps) {
  let corClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'

  if (taxa > 15) {
    corClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800'
  } else if (taxa > 5) {
    corClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${corClasses} ${className}`}
    >
      {taxa.toFixed(1)}%
    </span>
  )
}
