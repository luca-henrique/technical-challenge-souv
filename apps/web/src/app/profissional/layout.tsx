import type { ReactNode } from 'react'
import { AppShell } from '@/widgets/layout/app-shell/app-shell'

export default function ProfessionalLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      requiredRole="profissional"
      title="Minha Agenda"
      subtitle="Gerenciamento de consultas e escala de atendimentos"
    >
      {children}
    </AppShell>
  )
}
