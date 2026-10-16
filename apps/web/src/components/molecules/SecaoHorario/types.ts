import type { ReactNode } from 'react'

export interface SecaoHorarioProps {
  label?: string
  horarios: string[]
  selecionado: string
  onSelecionar: (hora: string) => void
  carregando?: boolean
  erro?: string
  slotVazio?: ReactNode
  className?: string
}
