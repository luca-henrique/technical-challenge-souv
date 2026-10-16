import type { ReactNode } from 'react'

export interface CardMetricaProps {
  rotulo: string
  valor: number | string
  badge?: ReactNode
  valorClassName?: string
  className?: string
}
