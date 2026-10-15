import type { TipoConsulta } from '@bemviver/shared'

export interface OpcaoTipoConsultaItem {
  valor: TipoConsulta
  rotulo: string
}

export type OpcaoTipoConsulta = TipoConsulta | OpcaoTipoConsultaItem

export interface SeletorTipoConsultaProps {
  valor?: TipoConsulta
  selecionado?: TipoConsulta
  onChange?: (tipo: TipoConsulta) => void
  onSelecionar?: (tipo: TipoConsulta) => void
  opcoes?: readonly OpcaoTipoConsulta[]
  label?: string
  erro?: string
  className?: string
  disabled?: boolean
}
