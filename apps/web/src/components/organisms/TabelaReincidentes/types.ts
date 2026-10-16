import type { Paginacao } from '@bemviver/shared'

export interface PacienteReincidente {
  pacienteId: string
  nome: string
  email: string
  totalFaltas: number
}

export interface TabelaReincidentesProps {
  reincidentes: PacienteReincidente[]
  paginacao?: Paginacao
  aoMudarPagina?: (novaPagina: number) => void
}

