import type { ReactNode } from 'react'

export interface FieldProps {
  label: string
  erro?: string
  hint?: string
  id?: string
  className?: string
  children: ReactNode
}
