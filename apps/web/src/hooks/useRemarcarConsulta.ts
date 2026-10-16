import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Consulta } from '@bemviver/shared'
import { api } from '@/lib/api'

export interface DadosRemarcarConsulta {
  id: string
  novaData: string
  novaHora: string
}

export function useRemarcarConsulta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, novaData, novaHora }: DadosRemarcarConsulta) =>
      api<Consulta>(`/consultas/${id}/remarcar`, {
        metodo: 'PATCH',
        corpo: { novaData, novaHora },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
      queryClient.invalidateQueries({ queryKey: ['agenda'] })
    },
  })
}
