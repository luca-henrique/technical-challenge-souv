'use client'

import { useQuery } from '@tanstack/react-query'
import type { Profissional } from '@bemviver/shared'
import { CACHE_TIMES } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { profissionaisService } from '@/services/profissionais'
import type { ListarProfissionaisParams } from '@/services/profissionais/types'

export function useProfissionais(params?: ListarProfissionaisParams) {
  return useQuery<Profissional[], Error>({
    queryKey: queryKeys.professionals.list(params),
    queryFn: () => profissionaisService.listarProfissionais(params),
    staleTime: CACHE_TIMES.STATIC_STALE,
    gcTime: CACHE_TIMES.STATIC_GC,
  })
}
