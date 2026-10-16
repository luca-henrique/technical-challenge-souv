import type { HTMLAttributes, ReactNode } from 'react'

export type NivelHeading = 'h1' | 'h2' | 'h3' | 'h4'
export type VarianteHeading = 'pagina' | 'secao' | 'card' | 'modal'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: NivelHeading
  variante?: VarianteHeading
  children: ReactNode
  className?: string
}
