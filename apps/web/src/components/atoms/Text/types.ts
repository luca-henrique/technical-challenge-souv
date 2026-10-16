import type { HTMLAttributes, ReactNode } from 'react'

export type VarianteTexto = 'corpo' | 'suporte' | 'legenda' | 'destaque'
export type CorTexto = 'padrao' | 'secundario' | 'erro' | 'sucesso' | 'aviso'

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div'
  variante?: VarianteTexto
  cor?: CorTexto
  children: ReactNode
  className?: string
}
