export interface BotaoExportarPdfProps {
  className?: string
  rotulo?: string
  onExportar?: () => void
  tipo?: 'agenda' | 'absenteismo'
  filtros?: {
    data?: string
    profissionalId?: string
    dataInicio?: string
    dataFim?: string
    especialidade?: string
  }
}
