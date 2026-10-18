import type { Metadata } from 'next'
import { PatientDashboardView } from '@/views/patient/ui/patient-dashboard-view'

export const metadata: Metadata = {
  title: 'Minhas Consultas | Clínica Bem Viver',
  description: 'Consulte suas próximas consultas e histórico médico na Clínica Bem Viver.',
}

export default function Page() {
  return <PatientDashboardView />
}
