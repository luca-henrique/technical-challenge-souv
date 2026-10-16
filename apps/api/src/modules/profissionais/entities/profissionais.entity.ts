import type { TipoConsulta } from '@bemviver/shared'

export interface ProfissionalEntity {
  id: string
  nome: string
  especialidade: string
  folga?: boolean
}

export interface FolgaEntity {
  id: string
  profissionalId: string
  data: string
}

export interface ConsultaAgendaEntity {
  id: string
  profissionalId: string
  pacienteId: string
  pacienteNome: string
  data: string
  hora: string
  tipo: TipoConsulta
  status: string
  inicio: Date
  fim: Date
  confirmadaEm: Date | null
  canceladaEm: Date | null
}

export interface AgendaProfissionalEntity {
  data: string
  folga: boolean
  consultas: ConsultaAgendaEntity[]
}

export interface FiltroProfissionais {
  data?: string
  profissionalId?: string
  especialidade?: string
}

export interface BloqueioPeriodoResultado {
  totalDiasBloqueados: number
  periodo: {
    dataInicio: string
    dataFim: string
  }
  dias: string[]
}
