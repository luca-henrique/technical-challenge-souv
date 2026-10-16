import type { TipoConsulta } from '@bemviver/shared'

export interface LembreteConsultaEntity {
  id: string
  consultaId: string
  data: string
  hora: string
  tipo: TipoConsulta
  pacienteNome: string
  pacienteEmail: string
  profissionalNome: string
  especialidade: string
}
