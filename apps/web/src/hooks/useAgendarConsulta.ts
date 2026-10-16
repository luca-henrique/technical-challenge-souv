'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cabeNoExpediente, diaUtil, type Consulta } from '@bemviver/shared'
import { consultasService } from '@/services/consultas'
import type { CriarConsultaParams } from '@/services/consultas/types'

export function useAgendarConsulta() {
  const queryClient = useQueryClient()

  return useMutation<Consulta, Error, CriarConsultaParams>({
    mutationFn: async (dados: CriarConsultaParams) => {
      if (!diaUtil(dados.data)) {
        throw new Error('A clínica só atende de segunda a sexta')
      }
      if (!cabeNoExpediente({ hora: dados.hora, tipo: dados.tipo })) {
        throw new Error('A consulta precisa terminar antes do almoço ou do fim do expediente')
      }
      return consultasService.agendarConsulta(dados)
    },
    onSuccess: (_, variaveis) => {
      queryClient.invalidateQueries({ queryKey: ['consultas', 'minhas'] })
      queryClient.invalidateQueries({ queryKey: ['agenda', variaveis.profissionalId, variaveis.data] })
      queryClient.invalidateQueries({ queryKey: ['horarios', variaveis.profissionalId, variaveis.data] })
    },
  })
}
