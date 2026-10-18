import { Select } from '@/shared/ui/select/select'
import { FormField } from '@/shared/ui/form-field/form-field'

export interface DoctorOption {
  id: string
  nome: string
  especialidade: string
  folga?: boolean
}

export interface DoctorSelectorProps {
  doctors: DoctorOption[]
  value: string
  onChange: (id: string) => void
  error?: string
  isLoading?: boolean
}

export function DoctorSelector({
  doctors,
  value,
  onChange,
  error,
  isLoading = false,
}: DoctorSelectorProps) {
  return (
    <FormField
      id="doctor-selector"
      label="Profissional"
      errorText={error}
      required
    >
      <Select
        id="doctor-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        hasError={Boolean(error)}
        aria-label="Selecionar profissional médico"
      >
        <option value="">
          {isLoading ? 'Carregando médicos...' : 'Selecione um profissional'}
        </option>
        {doctors.map((doc) => (
          <option
            key={doc.id}
            value={doc.id}
            disabled={doc.folga}
          >
            {doc.nome} — {doc.especialidade}
            {doc.folga ? ' (Folga / Indisponível)' : ''}
          </option>
        ))}
      </Select>
    </FormField>
  )
}
