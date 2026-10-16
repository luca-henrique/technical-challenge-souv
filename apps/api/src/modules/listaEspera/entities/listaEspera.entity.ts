import type { TipoConsulta } from '@bemviver/shared'

export type TurnoListaEspera = 'manha' | 'tarde' | 'qualquer'
export type StatusListaEspera = 'aguardando' | 'notificado' | 'cancelado'

export interface ItemListaEsperaEntity {
  id: string
  profissionalId: string
  pacienteId: string
  data: string
  tipo: TipoConsulta
  turno: TurnoListaEspera
  status: string
  criadaEm: Date
  notificadoEm?: Date | null
}

export interface ItemListaEsperaDetalhadoEntity extends ItemListaEsperaEntity {
  profissionalNome: string
  especialidade: string
  pacienteNome?: string
  pacienteEmail?: string
}

export interface FiltroListaEspera {
  profissionalId?: string
  data?: string
  status?: string
}

export interface PacienteNotificadoListaEspera {
  id: string
  pacienteId: string
  pacienteNome: string
  pacienteEmail: string
  profissionalNome: string
  data: string
  turno: string
  notificadoEm: string | null
}
