import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Consulta } from '@bemviver/shared'
import { api } from '@/lib/api'

export function useConfirmarConsulta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api<Consulta>(`/consultas/${id}/confirmar`, {
        metodo: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
      queryClient.invalidateQueries({ queryKey: ['agenda'] })
    },
  })
}
