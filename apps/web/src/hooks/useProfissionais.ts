'use client'

import { useQuery } from '@tanstack/react-query'
import type { Profissional } from '@bemviver/shared'
import { profissionaisService } from '@/services/profissionais'
import type { ListarProfissionaisParams } from '@/services/profissionais/types'

export function useProfissionais(params?: ListarProfissionaisParams) {
  return useQuery<Profissional[], Error>({
    queryKey: ['profissionais', params],
    queryFn: () => profissionaisService.listarProfissionais(params),
  })
}
