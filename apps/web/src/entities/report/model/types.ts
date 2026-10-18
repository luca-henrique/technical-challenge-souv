import type { RelatorioFaltas } from '@bemviver/shared'

export type AbsenceReport = RelatorioFaltas

export interface AbsenceReportFilters {
  dataInicio?: string
  dataFim?: string
  pagina?: number
  limite?: number
}
