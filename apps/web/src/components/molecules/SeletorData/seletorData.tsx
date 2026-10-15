import type { SeletorDataProps } from './types'
import Input from '@/components/atoms/Input/input'
import Field from '@/components/molecules/Field/field'

export default function SeletorData({
  valor,
  onChange,
  label = 'Data',
  erro,
  className = '',
  required = true,
  ...props
}: SeletorDataProps) {
  return (
    <Field label={label} erro={erro} className={className}>
      <Input
        type="date"
        required={required}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </Field>
  )
}
