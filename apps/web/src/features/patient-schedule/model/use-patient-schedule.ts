'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useToast } from '@/shared/ui/toast/toast'
import { useAgendarConsulta } from '@/hooks/useAgendarConsulta'
import { useEspecialidades } from '@/hooks/useEspecialidades'
import { useHorarios } from '@/hooks/useHorarios'
import { useProfissionais } from '@/hooks/useProfissionais'
import {
  scheduleAppointmentSchema,
  type ScheduleAppointmentValues,
} from './schedule-appointment.schema'

export interface UsePatientScheduleProps {
  onSuccess?: () => void
}

export function usePatientSchedule({ onSuccess }: UsePatientScheduleProps = {}) {
  const router = useRouter()
  const toast = useToast()
  const [mutationError, setMutationError] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')

  const form = useForm<ScheduleAppointmentValues>({
    resolver: zodResolver(scheduleAppointmentSchema),
    mode: 'onChange',
    defaultValues: {
      profissionalId: '',
      data: '',
      tipo: 'primeira',
      hora: '',
    },
  })

  const { control, handleSubmit, setValue, formState: { errors } } = form

  const doctorId = useWatch({ control, name: 'profissionalId' })
  const date = useWatch({ control, name: 'data' })
  const type = useWatch({ control, name: 'tipo' })
  const time = useWatch({ control, name: 'hora' })

  const { data: specialties = [] } = useEspecialidades()

  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
    error: doctorsError,
  } = useProfissionais({
    ...(date ? { data: date } : {}),
    ...(specialtyFilter ? { especialidade: specialtyFilter } : {}),
  })

  const {
    data: timeSlots = [],
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useHorarios(doctorId, date, type)

  const { mutateAsync: schedule, isPending: isSubmitting } = useAgendarConsulta()

  const submit = handleSubmit(async (values) => {
    setMutationError('')
    try {
      await schedule(values)
      toast.success(
        'Consulta agendada com sucesso!',
        `Agendamento confirmado para o dia ${values.data} às ${values.hora}.`,
      )
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/paciente')
      }
    } catch (err) {
      const msg = (err as Error).message
      setMutationError(msg)
      toast.error('Não foi possível agendar', msg)
      setValue('hora', '', { shouldValidate: true })
    }
  })

  return {
    form,
    control,
    errors,
    specialties,
    specialtyFilter,
    setSpecialtyFilter,
    doctors,
    isLoadingDoctors,
    doctorId,
    date,
    type,
    time,
    timeSlots,
    isLoadingSlots,
    isSubmitting,
    submit,
    errorMessage: mutationError || doctorsError?.message || slotsError?.message,
    setValue,
  }
}
