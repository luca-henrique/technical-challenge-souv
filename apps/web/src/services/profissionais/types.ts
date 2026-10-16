import type { Agenda, Profissional, TipoConsulta } from '@bemviver/shared'

export type { Agenda, Profissional, TipoConsulta }

export interface ListarProfissionaisParams {
  data?: string
  profissionalId?: string
  especialidade?: string
}

export interface BuscarAgendaParams {
  profissionalId: string
  data: string
}

export interface BuscarHorariosParams {
  profissionalId: string
  data: string
  tipo: TipoConsulta
}

export interface RespostaHorarios {
  horarios: string[]
}

export interface BloquearDiaParams {
  profissionalId: string
  data: string
}

export interface RespostaFolga {
  id: string
  profissionalId: string
  data: string
}
