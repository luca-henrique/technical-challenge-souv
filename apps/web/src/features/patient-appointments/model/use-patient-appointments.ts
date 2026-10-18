'use client'

import { useState } from 'react'
import type { Consulta } from '@bemviver/shared'
import { useToast } from '@/shared/ui/toast/toast'
import { useMinhasConsultas } from '@/hooks/useMinhasConsultas'

export type AppointmentTab = 'upcoming' | 'history'

export function usePatientAppointments() {
  const [activeTab, setActiveTab] = useState<AppointmentTab>('upcoming')
  const [selectedForCancel, setSelectedForCancel] = useState<Consulta | null>(null)
  const toast = useToast()

  const {
    consultas: appointments,
    carregando: isLoading,
    erro: errorMessage,
    cancelarConsulta,
    cancelando: isCancelling,
  } = useMinhasConsultas({ historico: activeTab === 'history' })

  async function handleConfirmCancel() {
    if (!selectedForCancel) return
    try {
      await cancelarConsulta(selectedForCancel.id)
      toast.success(
        'Consulta cancelada com sucesso',
        `A consulta de ${selectedForCancel.data} às ${selectedForCancel.hora} foi desmarcada.`,
      )
      setSelectedForCancel(null)
    } catch (err) {
      const msg = (err as Error).message
      toast.error('Erro ao cancelar consulta', msg)
    }
  }

  return {
    activeTab,
    setActiveTab,
    appointments,
    isLoading,
    errorMessage,
    selectedForCancel,
    setSelectedForCancel,
    isCancelling,
    handleConfirmCancel,
  }
}
