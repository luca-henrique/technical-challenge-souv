import type { InputHTMLAttributes } from 'react'

export interface SeletorDataProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  valor: string
  onChange: (data: string) => void
  label?: string
  erro?: string
  className?: string
}
