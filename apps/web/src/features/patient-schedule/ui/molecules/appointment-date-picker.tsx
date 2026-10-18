import { hojeEmRecife } from '@bemviver/shared'
import { FormField } from '@/shared/ui/form-field/form-field'
import { Input } from '@/shared/ui/input/input'

export interface AppointmentDatePickerProps {
  value: string
  onChange: (date: string) => void
  error?: string
}

export function AppointmentDatePicker({
  value,
  onChange,
  error,
}: AppointmentDatePickerProps) {
  return (
    <FormField
      id="appointment-date"
      label="Data da Consulta"
      errorText={error}
      required
    >
      <Input
        id="appointment-date"
        type="date"
        min={hojeEmRecife()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        hasError={Boolean(error)}
      />
    </FormField>
  )
}
