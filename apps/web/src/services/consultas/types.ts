import type { Consulta, StatusConsulta, TipoConsulta } from '@bemviver/shared'

export type { Consulta, StatusConsulta, TipoConsulta }

export interface CriarConsultaParams {
  profissionalId: string
  pacienteId?: string
  data: string
  hora: string
  tipo: TipoConsulta
}
