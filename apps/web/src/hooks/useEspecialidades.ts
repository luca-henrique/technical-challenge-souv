'use client'

import { useQuery } from '@tanstack/react-query'
import { listarEspecialidades } from '@/services/profissionais/profissionaisService'

export function useEspecialidades() {
  return useQuery<string[], Error>({
    queryKey: ['especialidades'],
    queryFn: async () => {
      const res = await listarEspecialidades()
      if (Array.isArray(res)) {
        return res
          .map((item) => (typeof item === 'string' ? item : (item as unknown as { especialidade?: string })?.especialidade ?? ''))
          .filter(Boolean)
      }
      return []
    },
  })
}
