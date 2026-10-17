'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Agenda } from '@bemviver/shared'
import { CACHE_TIMES } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import { consultasService } from '@/services/consultas'
import type { CriarConsultaParams } from '@/services/consultas/types'
import { profissionaisService } from '@/services/profissionais'

export function useAgenda(profissionalId: string, data: string) {
  const queryClient = useQueryClient()
  const chaveAgenda = queryKeys.professionals.agenda(profissionalId, data)

  const query = useQuery<Agenda, Error>({
    queryKey: chaveAgenda,
    queryFn: () => profissionaisService.buscarAgenda(profissionalId, data),
    enabled: Boolean(profissionalId && data),
    staleTime: CACHE_TIMES.DYNAMIC_STALE,
    gcTime: CACHE_TIMES.DYNAMIC_GC,
  })

  const cancelarMutation = useMutation({
    mutationFn: (consultaId: string) => consultasService.cancelarConsulta(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAgenda })
      queryClient.invalidateQueries({ queryKey: ['horarios', profissionalId, data] })
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.absences() })
    },
  })

  const faltaMutation = useMutation({
    mutationFn: (consultaId: string) => consultasService.registrarFalta(consultaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAgenda })
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.absences() })
    },
  })

  const agendarMutation = useMutation({
    mutationFn: (dados: CriarConsultaParams) => consultasService.agendarConsulta(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAgenda })
      queryClient.invalidateQueries({ queryKey: ['horarios', profissionalId, data] })
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.all })
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
