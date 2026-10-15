import type { ReactNode } from 'react'

export interface FieldProps {
  label: string
  erro?: string
  className?: string
  children: ReactNode
}
