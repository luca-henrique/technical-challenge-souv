'use client'

import { useQuery } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { pacientesService } from '@/services/pacientes'

export function usePacientes() {
  return useQuery({
    queryKey: queryKeys.patients.all,
    queryFn: () => pacientesService.listarPacientes(),
    staleTime: CACHE_TIMES.STATIC_STALE,
    gcTime: CACHE_TIMES.STATIC_GC,
  })
}
