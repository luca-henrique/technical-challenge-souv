import type { TipoConsulta } from '@bemviver/shared'

export interface LembreteConsulta {
  consultaId: string
  data: string
  hora: string
  tipo: TipoConsulta
  pacienteNome: string
  pacienteEmail: string
  profissionalNome: string
  especialidade: string
}
