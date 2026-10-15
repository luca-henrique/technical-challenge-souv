'use client'

import { useQuery } from '@tanstack/react-query'
import { pacientesService } from '@/services/pacientes'

export function usePacientes() {
  return useQuery({
    queryKey: ['pacientes'],
    queryFn: () => pacientesService.listarPacientes(),
  })
}
