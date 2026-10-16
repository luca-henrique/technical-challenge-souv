import type { BadgeProps, TamanhoBadge, VarianteBadge } from './types'

const VARIANTES: Record<VarianteBadge, string> = {
  sucesso: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  aviso: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  erro: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800',
  info: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
  neutro: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
}

const TAMANHOS: Record<TamanhoBadge, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs font-medium',
}

export default function Badge({
  variante = 'neutro',
  tamanho = 'sm',
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium transition-colors ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
    >
      {children}
    </span>
  )
}
