import type { SpinnerProps, TamanhoSpinner } from './types'

const TAMANHOS: Record<TamanhoSpinner, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
}

export default function Spinner({
  tamanho = 'md',
  className = '',
  'aria-label': ariaLabel = 'Carregando...',
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`inline-block animate-spin rounded-full border-teal-600 border-t-transparent ${TAMANHOS[tamanho]} ${className}`}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}
