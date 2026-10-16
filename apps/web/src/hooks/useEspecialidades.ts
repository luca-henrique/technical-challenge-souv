'use client'

import { useQuery } from '@tanstack/react-query'
import { listarEspecialidades } from '@/services/profissionais/profissionaisService'

export function useEspecialidades() {
  return useQuery<string[], Error>({
    queryKey: ['especialidades'],
    queryFn: () => listarEspecialidades(),
  })
}
