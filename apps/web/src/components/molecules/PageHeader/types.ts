import type { ReactNode } from 'react'

export interface PageHeaderProps {
  titulo: string
  subtitulo?: string
  acoes?: ReactNode
  className?: string
}
