'use client'

import { useQuery } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { listarEspecialidades } from '@/services/profissionais/profissionaisService'

export function useEspecialidades() {
  return useQuery<string[], Error>({
    queryKey: queryKeys.professionals.specialties,
    queryFn: async () => {
      const res = await listarEspecialidades()
      if (Array.isArray(res)) {
        return res
          .map((item) => (typeof item === 'string' ? item : (item as unknown as { especialidade?: string })?.especialidade ?? ''))
          .filter(Boolean)
      }
      return []
    },
    staleTime: CACHE_TIMES.STATIC_STALE,
    gcTime: CACHE_TIMES.STATIC_GC,
  })
}
