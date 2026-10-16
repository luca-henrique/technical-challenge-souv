import type { ReactNode } from 'react'

export type VarianteBadge = 'sucesso' | 'aviso' | 'erro' | 'info' | 'neutro'
export type TamanhoBadge = 'sm' | 'md'

export interface BadgeProps {
  variante?: VarianteBadge
  tamanho?: TamanhoBadge
  children: ReactNode
  className?: string
}
