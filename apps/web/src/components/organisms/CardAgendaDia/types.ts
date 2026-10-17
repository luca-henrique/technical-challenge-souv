import type { ReactNode } from 'react'
import type { Agenda, Consulta } from '@bemviver/shared'

export interface CardAgendaDiaProps {
  agenda?: Agenda
  profissionalId?: string
  data?: string
  acoes?: (consulta: Consulta) => ReactNode
  erro?: string
  erroAcao?: string
  mensagemFolga?: string
  className?: string
}
