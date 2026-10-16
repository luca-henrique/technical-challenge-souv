import type { TipoConsulta } from '@bemviver/shared'

export interface PacienteEntity {
  id: string
  nome: string
  email: string
}

export interface ConsultaPacienteEntity {
  id: string
  profissionalId: string
  pacienteId: string
  data: string
  hora: string
  tipo: TipoConsulta
  status: string
  inicio: Date
  fim: Date
  confirmadaEm: Date | null
  canceladaEm: Date | null
  profissionalNome: string
  especialidade: string
}
