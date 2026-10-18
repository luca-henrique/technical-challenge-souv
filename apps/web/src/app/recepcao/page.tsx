import type { Metadata } from 'next'
import { ReceptionDashboardView } from '@/views/reception/ui/reception-dashboard-view'

export const metadata: Metadata = {
  title: 'Agenda da Recepção | Clínica Bem Viver',
  description: 'Visualização da agenda diária e controle de atendimentos pela equipe da recepção.',
}

export default function Page() {
  return <ReceptionDashboardView />
}
