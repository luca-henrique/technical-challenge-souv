import type { TipoConsulta } from '@bemviver/shared'

export interface CardEntrarListaEsperaProps {
  profissionalId: string
  data: string
  tipo: TipoConsulta
  onSucesso?: () => void
  className?: string
}
