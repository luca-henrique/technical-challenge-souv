'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hojeEmRecife, type Agenda } from '@bemviver/shared'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { useSessao } from '@/hooks/useSessao'
import { useToast } from '@/shared/ui/toast/toast'

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

export function useDoctorSchedule(initialDate?: string) {
  const session = useSessao()
  const doctorId = session?.usuario?.id
  const toast = useToast()
  const queryClient = useQueryClient()

  const [selectedDate, setSelectedDate] = useState(() => initialDate ?? hojeEmRecife())
  const [isConfirmingDayOff, setIsConfirmingDayOff] = useState(false)
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)

  const { data: agenda, isLoading, error, refetch } = useQuery<Agenda>({
    queryKey: queryKeys.professionals.agenda(doctorId ?? '', selectedDate),
    queryFn: () => api<Agenda>(`/profissionais/${doctorId}/agenda?data=${selectedDate}`),
    enabled: Boolean(doctorId && selectedDate),
  })

  const blockDayMutation = useMutation({
    mutationFn: async (dateToBlock: string) => {
      if (!doctorId) throw new Error('Profissional não identificado')
      return api(`/profissionais/${doctorId}/folgas`, {
        metodo: 'POST',
        corpo: { data: dateToBlock },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.professionals.agenda(doctorId ?? '', selectedDate),
      })
      setIsConfirmingDayOff(false)
      toast.success('Dia bloqueado como folga com sucesso.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao bloquear dia')
    },
  })

  const blockPeriodMutation = useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
      if (!doctorId) throw new Error('Profissional não identificado')
      return api(`/profissionais/${doctorId}/folgas/periodo`, {
        metodo: 'POST',
        corpo: { dataInicio: startDate, dataFim: endDate },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['agenda', doctorId],
      })
      setIsPeriodModalOpen(false)
      toast.success('Período de folga bloqueado com sucesso.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao bloquear período de folga')
    },
  })

  return {
    doctorId,
    selectedDate,
    setSelectedDate: (date: string) => {
      setSelectedDate(date)
      setIsConfirmingDayOff(false)
    },
    goToPreviousDay: () => {
      setSelectedDate((d) => addDays(d, -1))
      setIsConfirmingDayOff(false)
    },
    goToNextDay: () => {
      setSelectedDate((d) => addDays(d, 1))
      setIsConfirmingDayOff(false)
    },
    goToToday: () => {
      setSelectedDate(hojeEmRecife())
      setIsConfirmingDayOff(false)
    },
    agenda: agenda ?? null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    isConfirmingDayOff,
    setIsConfirmingDayOff,
    isPeriodModalOpen,
    setIsPeriodModalOpen,
    blockDay: () => blockDayMutation.mutate(selectedDate),
    isBlockingDay: blockDayMutation.isPending,
    blockPeriod: (dates: { startDate: string; endDate: string }) => blockPeriodMutation.mutate(dates),
    isBlockingPeriod: blockPeriodMutation.isPending,
  }
}
