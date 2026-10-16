import type { SeletorEspecialidadeProps } from './types'
import Select from '@/components/atoms/Select/select'
import Field from '@/components/molecules/Field/field'

export default function SeletorEspecialidade({
  especialidades,
  valor,
  onChange,
  label = 'Especialidade',
  permitirVazio = true,
  textoVazio = 'Todas as especialidades',
  className = '',
  erro,
}: SeletorEspecialidadeProps) {
  return (
    <Field label={label} erro={erro} className={className}>
      <Select value={valor} onChange={(e) => onChange(e.target.value)}>
        {permitirVazio && <option value="">{textoVazio}</option>}
        {especialidades.map((esp) => {
          const nome = typeof esp === 'string' ? esp : ((esp as unknown as { especialidade?: string })?.especialidade ?? '')
          if (!nome) return null
          return (
            <option key={nome} value={nome}>
              {nome}
            </option>
          )
        })}
      </Select>
    </Field>
  )
}
