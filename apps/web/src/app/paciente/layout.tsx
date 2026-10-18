import type { ReactNode } from 'react'
import { AppShell } from '@/widgets/layout/app-shell/app-shell'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AppShell requiredRole="paciente" title="Área do Paciente">
      {children}
    </AppShell>
  )
}
