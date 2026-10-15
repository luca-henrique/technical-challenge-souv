'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Consulta } from '@bemviver/shared'
import { consultasService } from '@/services/consultas'

export function useMinhasConsultas() {
  const queryClient = useQueryClient()
  const chaveMinhasConsultas = ['consultas', 'minhas']

  const query = useQuery<Consulta[], Error>({
    queryKey: chaveMinhasConsultas,
    queryFn: () => consultasService.listarMinhasConsultas(),
  })

  const cancelarMutation = useMutation({
    mutationFn: (consultaId: string) => consultasService.cancelarConsulta(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveMinhasConsultas })
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
