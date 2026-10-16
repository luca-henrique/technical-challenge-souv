import type { ReactNode } from 'react'

export type VarianteEmptyState = 'dashed' | 'card' | 'inline'

export interface EmptyStateProps {
  titulo: string
  descricao?: string
  icone?: ReactNode
  acao?: ReactNode
  variante?: VarianteEmptyState
  className?: string
}

