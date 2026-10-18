'use client'

import { Alert } from '@/shared/ui/alert/alert'
import { Button } from '@/shared/ui/button/button'
import { Card } from '@/shared/ui/card/card'
import { FormField } from '@/shared/ui/form-field/form-field'
import { Select } from '@/shared/ui/select/select'
import { Typography } from '@/shared/ui/typography/typography'
import { APPOINTMENT_TYPE_LABELS } from '@/shared/lib/format/date'
import {
  useScheduleAppointment,
  type UseScheduleAppointmentProps,
} from '../model/use-schedule-appointment'

export function ScheduleAppointmentForm(props: UseScheduleAppointmentProps) {
  const {
    form,
    onSubmit,
    isSubmitting,
    patients,
    isLoadingPatients,
    availableSlots,
    successMessage,
  } = useScheduleAppointment(props)

  const {
    register,
    formState: { errors },
  } = form

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Typography variant="section-title">Marcar consulta</Typography>

        {errors.root?.message && (
          <Alert variant="danger">{errors.root.message}</Alert>
        )}

        {successMessage && (
          <p role="status" className="text-sm font-medium text-teal-700 dark:text-teal-400">
            {successMessage}
          </p>
        )}

        <FormField label="Paciente" errorText={errors.pacienteId?.message} required>
          <Select
            {...register('pacienteId')}
            hasError={Boolean(errors.pacienteId)}
            disabled={isLoadingPatients}
          >
            <option value="">
              {isLoadingPatients ? 'Carregando pacientes...' : 'Selecione'}
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Tipo" errorText={errors.tipo?.message}>
          <Select {...register('tipo')} hasError={Boolean(errors.tipo)}>
            <option value="primeira">{APPOINTMENT_TYPE_LABELS.primeira}</option>
            <option value="retorno">{APPOINTMENT_TYPE_LABELS.retorno}</option>
          </Select>
        </FormField>

        <FormField label="Horário" errorText={errors.hora?.message} required>
          <Select {...register('hora')} hasError={Boolean(errors.hora)}>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isSubmitting}
          loadingText="Marcando..."
        >
          Marcar
        </Button>
      </form>
    </Card>
  )
}
