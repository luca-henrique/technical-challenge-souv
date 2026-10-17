'use client'

import { useQuery } from '@tanstack/react-query'
import { diaUtil, type TipoConsulta } from '@bemviver/shared'
import { CACHE_TIMES } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { profissionaisService } from '@/services/profissionais'

export function useHorarios(profissionalId?: string, data?: string, tipo?: TipoConsulta) {
  const dataValidaEDiaUtil = Boolean(data && diaUtil(data))

  return useQuery<string[], Error>({
    queryKey: queryKeys.professionals.slots(profissionalId, data, tipo),
    queryFn: () => {
      if (!profissionalId || !data || !tipo || !diaUtil(data)) return []
      return profissionaisService.buscarHorarios(profissionalId, data, tipo)
    },
    enabled: Boolean(profissionalId && dataValidaEDiaUtil && tipo),
    staleTime: CACHE_TIMES.DYNAMIC_STALE,
    gcTime: CACHE_TIMES.DYNAMIC_GC,
  })
}
