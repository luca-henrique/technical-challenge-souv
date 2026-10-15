'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Consulta } from '@bemviver/shared'
import { consultasService } from '@/services/consultas'
import type { CriarConsultaParams } from '@/services/consultas/types'

export function useAgendarConsulta() {
  const queryClient = useQueryClient()

  return useMutation<Consulta, Error, CriarConsultaParams>({
    mutationFn: (dados: CriarConsultaParams) => consultasService.agendarConsulta(dados),
    onSuccess: (_, variaveis) => {
      queryClient.invalidateQueries({ queryKey: ['consultas', 'minhas'] })
      queryClient.invalidateQueries({ queryKey: ['agenda', variaveis.profissionalId, variaveis.data] })
      queryClient.invalidateQueries({ queryKey: ['horarios', variaveis.profissionalId, variaveis.data] })
    },
  })
}
