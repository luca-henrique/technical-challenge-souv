'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Consulta } from '@bemviver/shared'
import { consultasService } from '@/services/consultas'

export function useMinhasConsultas(opcoes?: { historico?: boolean }) {
  const queryClient = useQueryClient()
  const historico = opcoes?.historico ?? false
  const chaveMinhasConsultas = ['consultas', 'minhas', { historico }]

  const query = useQuery<Consulta[], Error>({
    queryKey: chaveMinhasConsultas,
    queryFn: () => consultasService.listarMinhasConsultas(historico),
  })

  const cancelarMutation = useMutation({
    mutationFn: (consultaId: string) => consultasService.cancelarConsulta(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas', 'minhas'] })
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
    },
  })

  return {
    consultas: query.data ?? [],
    carregando: query.isLoading,
    erro: query.error?.message ?? '',
    cancelarConsulta: cancelarMutation.mutateAsync,
    cancelando: cancelarMutation.isPending,
    erroCancelar: cancelarMutation.error?.message,
    refetch: query.refetch,
  }
}
