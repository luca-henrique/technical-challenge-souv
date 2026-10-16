import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ItemListaEspera, TurnoListaEspera } from '@bemviver/shared'
import { api } from '@/lib/api'

export interface DadosInscricaoEspera {
  profissionalId: string
  data: string
  tipo: 'primeira' | 'retorno'
  turno: TurnoListaEspera
}

export function useMinhasEspera() {
  return useQuery<ItemListaEspera[]>({
    queryKey: ['lista-espera', 'minhas'],
    queryFn: () => api<ItemListaEspera[]>('/lista-espera/minhas'),
  })
}

export function useListaEsperaRecepcao(filtros?: { profissionalId?: string; data?: string; status?: string }) {
  const params = new URLSearchParams()
  if (filtros?.profissionalId) params.append('profissionalId', filtros.profissionalId)
  if (filtros?.data) params.append('data', filtros.data)
  if (filtros?.status) params.append('status', filtros.status)

  const queryString = params.toString() ? `?${params.toString()}` : ''

  return useQuery<ItemListaEspera[]>({
    queryKey: ['lista-espera', 'todos', filtros],
    queryFn: () => api<ItemListaEspera[]>(`/lista-espera${queryString}`),
  })
}

export function useInscreverEspera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dados: DadosInscricaoEspera) =>
      api<ItemListaEspera>('/lista-espera', {
        metodo: 'POST',
        corpo: dados,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lista-espera'] })
    },
  })
}

export function useCancelarEspera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api<{ sucesso: boolean }>(`/lista-espera/${id}`, {
        metodo: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lista-espera'] })
    },
  })
}
