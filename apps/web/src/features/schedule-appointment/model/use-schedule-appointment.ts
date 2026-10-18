'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { GRADE, gradePorTipo } from '@bemviver/shared'
import { useAgendaContext } from '@/providers/provedorAgenda'
import { usePacientes } from '@/hooks/usePacientes'
import { appointmentApi } from '@/entities/appointment/api/appointment-api'
import {
  scheduleAppointmentSchema,
  type ScheduleAppointmentFormData,
} from './schedule-schema'

export interface UseScheduleAppointmentProps {
  initialProfessionalId?: string
  initialDate?: string
  onSuccess?: () => void
}

export function useScheduleAppointment({
  initialProfessionalId = '',
  initialDate = '',
  onSuccess,
}: UseScheduleAppointmentProps = {}) {
  const context = useAgendaContext()
  const professionalId = initialProfessionalId || context?.profissionalId || ''
  const date = initialDate || context?.data || ''

  const { data: patients = [], isLoading: isLoadingPatients } = usePacientes()
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm<ScheduleAppointmentFormData>({
    resolver: zodResolver(scheduleAppointmentSchema),
    defaultValues: {
      profissionalId: professionalId,
      pacienteId: '',
      data: date,
      tipo: 'primeira',
      hora: GRADE[0],
    },
  })

  const {
    handleSubmit,
    setError,
    reset,
    control,
    formState: { isSubmitting },
  } = form

  const selectedType = useWatch({ control, name: 'tipo' })
  const availableSlots = gradePorTipo(selectedType ?? 'primeira')

  const onSubmit = handleSubmit(async (data) => {
    setSuccessMessage('')
    try {
      if (context?.agendarConsulta) {
        await context.agendarConsulta({
          profissionalId: professionalId || data.profissionalId,
          data: date || data.data,
          pacienteId: data.pacienteId,
          tipo: data.tipo,
          hora: data.hora,
        })
      } else {
        await appointmentApi.schedule({
          profissionalId: professionalId || data.profissionalId,
          data: date || data.data,
          pacienteId: data.pacienteId,
          tipo: data.tipo,
          hora: data.hora,
        })
      }

      setSuccessMessage('Consulta marcada com sucesso.')
      reset({
        profissionalId: professionalId,
        pacienteId: '',
        data: date,
        tipo: 'primeira',
        hora: GRADE[0],
      })
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao agendar consulta. Tente novamente.'
      setError('root', { message })
    }
  })

  return {
    form,
    onSubmit,
    isSubmitting,
    patients,
    isLoadingPatients,
    availableSlots,
    successMessage,
  }
}
