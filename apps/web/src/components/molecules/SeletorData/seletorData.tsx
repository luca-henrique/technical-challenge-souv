import type { SeletorDataProps } from './types'
import Input from '@/components/atoms/Input/input'
import Field from '@/components/molecules/Field/field'

export default function SeletorData({
  valor,
  onChange,
  label = 'Data',
  erro,
  hint = 'Atendimento de segunda a sexta-feira',
  className = '',
  required = true,
  id = 'seletor-data-input',
  ...props
}: SeletorDataProps) {
  return (
    <Field id={id} label={label} erro={erro} hint={hint} className={className}>
      <Input
        id={id}
        type="date"
        required={required}
        value={valor}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `${id}-erro` : hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </Field>
  )
}
