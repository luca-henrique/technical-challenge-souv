import { QueryClient } from '@tanstack/react-query'

/**
 * Cache configuration constants in milliseconds
 */
export const CACHE_TIMES = {
  DEFAULT_STALE: 60 * 1000, // 1 minute
  DEFAULT_GC: 15 * 60 * 1000, // 15 minutes
  STATIC_STALE: 5 * 60 * 1000, // 5 minutes for stable lists (specialties, professionals, patients)
  STATIC_GC: 30 * 60 * 1000, // 30 minutes
  DYNAMIC_STALE: 30 * 1000, // 30 seconds for fast-changing agendas & available slots
  DYNAMIC_GC: 5 * 60 * 1000, // 5 minutes
} as const

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_TIMES.DEFAULT_STALE,
        gcTime: CACHE_TIMES.DEFAULT_GC,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
