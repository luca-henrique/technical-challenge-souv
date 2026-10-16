import type { TamanhoBotao } from '@/components/atoms/Button/types'

export interface BotaoExportarPdfProps {
  className?: string
  rotulo?: string
  onExportar?: () => void
  tamanho?: TamanhoBotao
  tipo?: 'agenda' | 'absenteismo'
  filtros?: {
    data?: string
    profissionalId?: string
    dataInicio?: string
    dataFim?: string
    especialidade?: string
  }
}
