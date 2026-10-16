'use client'

import { useQuery } from '@tanstack/react-query'
import type { RelatorioFaltas } from '@bemviver/shared'
import { relatoriosService } from '@/services/relatorios'
import type { FiltrosRelatorioFaltas } from '@/services/relatorios/types'

export function useRelatorioFaltas(filtros?: FiltrosRelatorioFaltas) {
  const chave = [
    'relatorio-faltas',
    filtros?.dataInicio,
    filtros?.dataFim,
    filtros?.profissionalId,
    filtros?.pagina,
    filtros?.limite,
  ]

  const query = useQuery<RelatorioFaltas, Error>({
    queryKey: chave,
    queryFn: () => relatoriosService.buscarRelatorioFaltas(filtros),
  })

  return {
    relatorio: query.data ?? null,
    carregando: query.isLoading,
    erro: query.error?.message ?? '',
    refetch: query.refetch,
  }
}
