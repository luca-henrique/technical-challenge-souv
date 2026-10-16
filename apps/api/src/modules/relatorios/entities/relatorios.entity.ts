import type { RelatorioFaltas } from '@bemviver/shared'

export type { RelatorioFaltas }

export interface FiltroRelatorioFaltas {
  dataInicio?: string
  dataFim?: string
  profissionalId?: string
}

export interface ConsultaRelatorioEntity {
  id: string
  pacienteId: string
  profissionalId: string
  data: string
  status: string
  paciente: {
    id: string
    nome: string
    email: string
  }
  profissional: {
    id: string
    especialidade: string
    usuario: {
      nome: string
    }
  }
}
