import type { QueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { listarEspecialidades } from '@/services/profissionais/profissionaisService'
import { profissionaisService } from '@/services/profissionais'

/**
 * Prefetches high-traffic static datasets into React Query cache
 * to ensure instantaneous navigation and avoid loading spinners on initial render.
 */
export async function prefetchCommonData(queryClient: QueryClient): Promise<void> {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: queryKeys.professionals.list(),
      queryFn: () => profissionaisService.listarProfissionais(),
      staleTime: CACHE_TIMES.STATIC_STALE,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.professionals.specialties,
      queryFn: async () => {
        const res = await listarEspecialidades()
        if (Array.isArray(res)) {
          return res
            .map((item) =>
              typeof item === 'string'
                ? item
                : (item as unknown as { especialidade?: string })?.especialidade ?? '',
            )
            .filter(Boolean)
        }
        return []
      },
      staleTime: CACHE_TIMES.STATIC_STALE,
    }),
  ])
}
