import type { Metadata } from 'next'
import { ScheduleAppointmentView } from '@/views/patient/ui/schedule-appointment-view'

export const metadata: Metadata = {
  title: 'Agendar Consulta | Clínica Bem Viver',
  description: 'Escolha um profissional e reserve seu horário de consulta na Clínica Bem Viver.',
}

export default function Page() {
  return <ScheduleAppointmentView />
}
