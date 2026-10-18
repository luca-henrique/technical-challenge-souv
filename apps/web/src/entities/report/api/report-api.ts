import type { RelatorioFaltas } from '@bemviver/shared'
import { httpClient } from '@/shared/api/http-client'
import type { AbsenceReportFilters } from '../model/types'

export const reportApi = {
  getAbsenceReport(filters?: AbsenceReportFilters): Promise<RelatorioFaltas> {
    return httpClient.get<RelatorioFaltas>('/relatorios/faltas', filters as Record<string, string | number | boolean | undefined>)
  },
}
