'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Agenda } from '@bemviver/shared'
import { consultasService } from '@/services/consultas'
import type { CriarConsultaParams } from '@/services/consultas/types'
import { profissionaisService } from '@/services/profissionais'

export function useAgenda(profissionalId: string, data: string) {
  const queryClient = useQueryClient()
  const chaveAgenda = ['agenda', profissionalId, data]

  const query = useQuery<Agenda, Error>({
    queryKey: chaveAgenda,
    queryFn: () => profissionaisService.buscarAgenda(profissionalId, data),
    enabled: Boolean(profissionalId && data),
  })

  const cancelarMutation = useMutation({
    mutationFn: (consultaId: string) => consultasService.cancelarConsulta(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAgenda })
      queryClient.invalidateQueries({ queryKey: ['horarios', profissionalId, data] })
    },
  })

  const faltaMutation = useMutation({
    mutationFn: (consultaId: string) => consultasService.registrarFalta(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAgenda })
    },
  })

  const agendarMutation = useMutation({
    mutationFn: (dados: CriarConsultaParams) => consultasService.agendarConsulta(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAgenda })
    },
  })

  return {
    agenda: query.data ?? null,
    carregando: query.isLoading,
    erro: query.error?.message ?? '',
    refetch: query.refetch,
    cancelarConsulta: cancelarMutation.mutateAsync,
    cancelando: cancelarMutation.isPending,
    erroCancelar: cancelarMutation.error?.message,
    registrarFalta: faltaMutation.mutateAsync,
    registrandoFalta: faltaMutation.isPending,
    erroFalta: faltaMutation.error?.message,
    agendarConsulta: agendarMutation.mutateAsync,
    agendando: agendarMutation.isPending,
    erroAgendar: agendarMutation.error?.message,
  }
}
