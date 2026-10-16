import type { ReactNode } from 'react'

export interface EmptyStateProps {
  titulo: string
  descricao?: string
  icone?: ReactNode
  acao?: ReactNode
  className?: string
}
