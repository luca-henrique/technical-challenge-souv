import type { RelatorioFaltas } from '@bemviver/shared'
import { api } from '@/lib/api'
import type { FiltrosRelatorioFaltas } from './types'

export async function buscarRelatorioFaltas(filtros?: FiltrosRelatorioFaltas): Promise<RelatorioFaltas> {
  const params = new URLSearchParams()
  if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio)
  if (filtros?.dataFim) params.append('dataFim', filtros.dataFim)
  if (filtros?.profissionalId) params.append('profissionalId', filtros.profissionalId)

  const query = params.toString() ? `?${params.toString()}` : ''
  return api<RelatorioFaltas>(`/relatorios/faltas${query}`)
}

export const relatoriosService = {
  buscarRelatorioFaltas,
}
