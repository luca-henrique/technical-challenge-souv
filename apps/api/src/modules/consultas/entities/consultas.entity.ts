import type { TipoConsulta } from '@bemviver/shared'

export interface ConsultaEntity {
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
}

export interface ConsultaComProfissionalEntity extends ConsultaEntity {
  profissionalNome: string
  especialidade: string
}

export interface CriarConsultaDados {
  profissionalId: string
  pacienteId: string
  data: string
  hora: string
  tipo: TipoConsulta
}

export interface RemarcarConsultaDados {
  novaData: string
  novaHora: string
}
