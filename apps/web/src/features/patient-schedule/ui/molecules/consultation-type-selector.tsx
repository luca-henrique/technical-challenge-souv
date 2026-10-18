import { FormField } from '@/shared/ui/form-field/form-field'
import { Select } from '@/shared/ui/select/select'

export interface ConsultationTypeSelectorProps {
  value: 'primeira' | 'retorno'
  onChange: (type: 'primeira' | 'retorno') => void
}

export function ConsultationTypeSelector({
  value,
  onChange,
}: ConsultationTypeSelectorProps) {
  return (
    <FormField id="appointment-type" label="Tipo de Consulta" required>
      <Select
        id="appointment-type"
        value={value}
        onChange={(e) => onChange(e.target.value as 'primeira' | 'retorno')}
      >
        <option value="primeira">Primeira Consulta (60 min)</option>
        <option value="retorno">Retorno (30 min)</option>
      </Select>
    </FormField>
  )
}
