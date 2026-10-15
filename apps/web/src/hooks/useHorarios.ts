'use client'

import { useQuery } from '@tanstack/react-query'
import type { TipoConsulta } from '@bemviver/shared'
import { profissionaisService } from '@/services/profissionais'

export function useHorarios(profissionalId?: string, data?: string, tipo?: TipoConsulta) {
  return useQuery<string[], Error>({
    queryKey: ['horarios', profissionalId, data, tipo],
    queryFn: () => {
      if (!profissionalId || !data || !tipo) return []
      return profissionaisService.buscarHorarios(profissionalId, data, tipo)
    },
    enabled: Boolean(profissionalId && data && tipo),
  })
}
