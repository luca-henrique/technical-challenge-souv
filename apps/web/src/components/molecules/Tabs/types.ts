import type { ReactNode } from 'react'

export interface TabsProps {
  valorPadrao?: string
  valor?: string
  onChange?: (valor: string) => void
  children: ReactNode
  className?: string
}

export interface TabsListProps {
  children: ReactNode
  'aria-label'?: string
  className?: string
}

export interface TabTriggerProps {
  valor: string
  children: ReactNode
  className?: string
}

export interface TabContentProps {
  valor: string
  children: ReactNode
  className?: string
}
