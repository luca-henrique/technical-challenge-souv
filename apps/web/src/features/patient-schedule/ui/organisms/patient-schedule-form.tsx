'use client'

import { Controller } from 'react-hook-form'
import { Card } from '@/shared/ui/card/card'
import { Button } from '@/shared/ui/button/button'
import { Alert } from '@/shared/ui/alert/alert'
import { usePatientSchedule } from '../../model/use-patient-schedule'
import { SpecialtySelector } from '../molecules/specialty-selector'
import { DoctorSelector } from '../molecules/doctor-selector'
import { AppointmentDatePicker } from '../molecules/appointment-date-picker'
import { ConsultationTypeSelector } from '../molecules/consultation-type-selector'
import { TimeSlotGrid } from '../molecules/time-slot-grid'

export interface PatientScheduleFormProps {
  onSuccess?: () => void
}

export function PatientScheduleForm({ onSuccess }: PatientScheduleFormProps) {
  const {
    control,
    errors,
    specialties,
    specialtyFilter,
    setSpecialtyFilter,
    doctors,
    isLoadingDoctors,
    timeSlots,
    isLoadingSlots,
    time,
    isSubmitting,
    submit,
    errorMessage,
    setValue,
  } = usePatientSchedule({ onSuccess })

  return (
    <Card className="max-w-md mx-auto">
      <form onSubmit={submit} noValidate className="space-y-4">
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <SpecialtySelector
          specialties={specialties}
          value={specialtyFilter}
          onChange={(spec) => {
            setSpecialtyFilter(spec)
            setValue('profissionalId', '', { shouldValidate: true })
            setValue('hora', '', { shouldValidate: true })
          }}
        />

        <Controller
          name="profissionalId"
          control={control}
          render={({ field }) => (
            <DoctorSelector
              doctors={doctors}
              value={field.value}
              onChange={(id) => {
                field.onChange(id)
                setValue('hora', '', { shouldValidate: true })
              }}
              error={errors.profissionalId?.message}
              isLoading={isLoadingDoctors}
            />
          )}
        />

        <Controller
          name="data"
          control={control}
          render={({ field }) => (
            <AppointmentDatePicker
              value={field.value}
              onChange={(d) => {
                field.onChange(d)
                setValue('hora', '', { shouldValidate: true })
              }}
              error={errors.data?.message}
            />
          )}
        />

        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <ConsultationTypeSelector
              value={field.value}
              onChange={(t) => {
                field.onChange(t)
                setValue('hora', '', { shouldValidate: true })
              }}
            />
          )}
        />

        <TimeSlotGrid
          slots={timeSlots}
          selectedTime={time}
          onSelect={(slot) => setValue('hora', slot, { shouldValidate: true })}
          isLoading={isLoadingSlots}
          error={errors.hora?.message}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-6"
          isLoading={isSubmitting}
          loadingText="Agendando consulta..."
        >
          Confirmar Agendamento
        </Button>
      </form>
    </Card>
  )
}
