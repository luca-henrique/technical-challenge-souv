'use client'

import { useQuery } from '@tanstack/react-query'
import type { Profissional } from '@bemviver/shared'
import { profissionaisService } from '@/services/profissionais'

export function useProfissionais() {
  return useQuery<Profissional[], Error>({
    queryKey: ['profissionais'],
    queryFn: () => profissionaisService.listarProfissionais(),
  })
}
