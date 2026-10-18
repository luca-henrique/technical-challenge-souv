import { Select } from '@/shared/ui/select/select'
import { FormField } from '@/shared/ui/form-field/form-field'

export interface SpecialtySelectorProps {
  specialties: string[]
  value: string
  onChange: (specialty: string) => void
}

export function SpecialtySelector({
  specialties,
  value,
  onChange,
}: SpecialtySelectorProps) {
  if (specialties.length === 0) return null

  return (
    <FormField
      id="specialty-selector"
      label="Especialidade"
      hint="Filtre os médicos pela especialidade desejada"
    >
      <Select
        id="specialty-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filtrar por especialidade"
      >
        <option value="">Todas as especialidades</option>
        {specialties.map((spec) => (
          <option key={spec} value={spec}>
            {spec}
          </option>
        ))}
      </Select>
    </FormField>
  )
}
