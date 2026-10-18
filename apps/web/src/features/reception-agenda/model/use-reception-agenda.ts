'use client'

import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { hojeEmRecife } from '@bemviver/shared'
import { useProfissionais } from '@/hooks/useProfissionais'
import {
  receptionAgendaFilterSchema,
  type ReceptionAgendaFilterInput,
} from './reception-agenda.schema'

export function useReceptionAgenda(initialDate?: string) {
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceptionAgendaFilterInput>({
    resolver: zodResolver(receptionAgendaFilterSchema),
    defaultValues: {
      professionalId: '',
      date: initialDate ?? hojeEmRecife(),
    },
  })

  const selectedProfessionalId = useWatch({ control, name: 'professionalId' })
  const selectedDate = useWatch({ control, name: 'date' }) ?? hojeEmRecife()

  const {
    data: professionals = [],
    isLoading,
    error,
  } = useProfissionais(selectedDate ? { data: selectedDate } : undefined)

  const initialized = useRef(false)
  useEffect(() => {
    if (!initialized.current && professionals.length > 0 && !selectedProfessionalId) {
      initialized.current = true
      setValue('professionalId', professionals[0].id)
    }
  }, [professionals, selectedProfessionalId, setValue])

  return {
    control,
    handleSubmit,
    professionals,
    selectedProfessionalId: selectedProfessionalId ?? '',
    selectedDate,
    setSelectedProfessionalId: (id: string) => setValue('professionalId', id),
    setSelectedDate: (date: string) => setValue('date', date),
    isLoading,
    error: error?.message ?? null,
    errors,
  }
}
