import type { ReactNode } from 'react'

export interface AlertProps {
  variante?: 'erro' | 'aviso' | 'sucesso'
  children: ReactNode
}
